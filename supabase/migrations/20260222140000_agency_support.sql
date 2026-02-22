-- Agency support: link customers to agencies, allow agencies to create applications and upload documents

-- 0. Ensure get_least_busy_advisor exists (used by handle_new_user below)
CREATE OR REPLACE FUNCTION public.get_least_busy_advisor()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_advisor_id UUID;
BEGIN
    SELECT a.id INTO v_advisor_id
    FROM public.advisors a
    LEFT JOIN public.profiles p ON p.assigned_advisor_id = a.id
    WHERE a.is_active = true
    GROUP BY a.id
    ORDER BY count(p.id) ASC, a.created_at ASC
    LIMIT 1;

    RETURN v_advisor_id;
END;
$$;

-- 1. Profiles: add agency_id and email
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS agency_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS email TEXT;

-- 2. Backfill profile email from auth.users (run as definer)
CREATE OR REPLACE FUNCTION public.sync_profile_email_from_auth()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles p
  SET email = u.email
  FROM auth.users u
  WHERE p.user_id = u.id AND (p.email IS DISTINCT FROM u.email);
END;
$$;

-- One-time backfill (safe to run multiple times)
SELECT public.sync_profile_email_from_auth();

-- 3. Applications: add created_by_agency_id
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS created_by_agency_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 4. Agency invites: when customer signs up with this email, link to agency
CREATE TABLE IF NOT EXISTS public.agency_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(agency_user_id, email)
);

ALTER TABLE public.agency_invites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Agencies can manage own invites" ON public.agency_invites;
CREATE POLICY "Agencies can manage own invites"
ON public.agency_invites FOR ALL TO authenticated
USING (agency_user_id = auth.uid())
WITH CHECK (agency_user_id = auth.uid());

-- 5. Update handle_new_user: set email and agency_id from invite if exists
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_advisor_id UUID;
    v_agency_id UUID;
BEGIN
    v_advisor_id := public.get_least_busy_advisor();

    SELECT inv.agency_user_id INTO v_agency_id
    FROM public.agency_invites inv
    WHERE inv.email = NEW.email
    LIMIT 1;

    INSERT INTO public.profiles (user_id, full_name, assigned_advisor_id, email, agency_id)
    VALUES (
      NEW.id,
      COALESCE(NEW.raw_user_meta_data ->> 'full_name', (SELECT full_name FROM public.agency_invites WHERE email = NEW.email LIMIT 1)),
      v_advisor_id,
      NEW.email,
      v_agency_id
    );

    RETURN NEW;
END;
$$;

-- 6. RLS: Agencies can view/update profiles that belong to them
DROP POLICY IF EXISTS "Agencies can view their customers' profiles" ON public.profiles;
CREATE POLICY "Agencies can view their customers' profiles"
ON public.profiles FOR SELECT TO authenticated
USING (
  agency_id = auth.uid()
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Agencies can update their customers' profiles" ON public.profiles;
CREATE POLICY "Agencies can update their customers' profiles"
ON public.profiles FOR UPDATE TO authenticated
USING (agency_id = auth.uid())
WITH CHECK (agency_id = auth.uid());

-- Allow agency to set agency_id when linking existing user (update by email lookup is done via service or we allow update of agency_id only)
-- Already covered: agency can UPDATE profiles where agency_id = auth.uid(). So to "link" a customer, we need agency to set agency_id.
-- But initially profile has agency_id = null. So we need: agency can UPDATE profiles SET agency_id = auth.uid() WHERE email = ? AND agency_id IS NULL (or any profile they "discover").
-- Safer: allow agency to update only agency_id on profiles where email matches a value the agency provides. That requires a custom RPC for security.
-- Simpler: allow agency to update profiles where id IN (some list). We can't do "where email = X" in RLS easily without exposing all emails.
-- RPC: agency links an existing customer (by profile id) to themselves
CREATE OR REPLACE FUNCTION public.agency_link_customer(p_profile_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'agency') THEN
    RAISE EXCEPTION 'Not an agency';
  END IF;
  UPDATE public.profiles
  SET agency_id = auth.uid(), updated_at = now()
  WHERE id = p_profile_id AND agency_id IS NULL;
END;
$$;

-- RPC: agency searches for a profile by email to link as customer (returns id and full_name only)
CREATE OR REPLACE FUNCTION public.agency_search_customer_by_email(p_email TEXT)
RETURNS TABLE(profile_id UUID, full_name TEXT, already_linked BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'agency') THEN
    RAISE EXCEPTION 'Not an agency';
  END IF;
  RETURN QUERY
  SELECT p.id, p.full_name, (p.agency_id IS NOT NULL)
  FROM public.profiles p
  WHERE p.email IS NOT NULL AND lower(trim(p.email)) = lower(trim(p_email))
  LIMIT 1;
END;
$$;

-- 7. RLS: Agencies can manage applications for their customers or created by them
DROP POLICY IF EXISTS "Agencies can view their customers' applications" ON public.applications;
CREATE POLICY "Agencies can view their customers' applications"
ON public.applications FOR SELECT TO authenticated
USING (
  created_by_agency_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = applications.user_id AND p.agency_id = auth.uid()
  )
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

DROP POLICY IF EXISTS "Agencies can create applications for their customers" ON public.applications;
CREATE POLICY "Agencies can create applications for their customers"
ON public.applications FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'agency'::app_role)
  AND created_by_agency_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = applications.user_id AND p.agency_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Agencies can update their customers' applications" ON public.applications;
CREATE POLICY "Agencies can update their customers' applications"
ON public.applications FOR UPDATE TO authenticated
USING (
  created_by_agency_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = applications.user_id AND p.agency_id = auth.uid()
  )
)
WITH CHECK (
  created_by_agency_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = applications.user_id AND p.agency_id = auth.uid()
  )
);

-- 8. application_documents: agencies can manage docs for their customers' applications
DROP POLICY IF EXISTS "Agencies can manage documents for their customers' applications" ON public.application_documents;
CREATE POLICY "Agencies can manage documents for their customers' applications"
ON public.application_documents
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.applications app
    WHERE app.id = application_documents.application_id
    AND (
      app.created_by_agency_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = app.user_id AND p.agency_id = auth.uid()
      )
    )
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.applications app
    WHERE app.id = application_documents.application_id
    AND (
      app.created_by_agency_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = app.user_id AND p.agency_id = auth.uid()
      )
    )
  )
);

-- 9. advisor_assignments: agencies can view assignments for their applications
DROP POLICY IF EXISTS "Agencies can view assignments for their applications" ON public.advisor_assignments;
CREATE POLICY "Agencies can view assignments for their applications"
ON public.advisor_assignments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.applications app
    WHERE app.id = advisor_assignments.application_id
    AND (
      app.created_by_agency_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.user_id = app.user_id AND p.agency_id = auth.uid()
      )
    )
  )
);

-- 10. Storage: agencies can upload/read/delete in documents bucket under agency-uploads/{agency_uid}/...
DROP POLICY IF EXISTS "Agencies can manage agency document uploads" ON storage.objects;
CREATE POLICY "Agencies can manage agency document uploads"
ON storage.objects FOR ALL TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'agency-uploads'
  AND (storage.foldername(name))[2] = auth.uid()::text
  AND public.has_role(auth.uid(), 'agency'::app_role)
)
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = 'agency-uploads'
  AND (storage.foldername(name))[2] = auth.uid()::text
  AND public.has_role(auth.uid(), 'agency'::app_role)
);
