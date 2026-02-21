-- Fix infinite recursion: applications RLS -> advisor_assignments RLS -> is_own_application -> applications
-- Use SECURITY DEFINER functions so advisor_assignments/applications are read with definer (bypass RLS),
-- breaking the cycle.

-- 1. Advisor can view/update application: check advisor_assignments + advisors without triggering RLS
CREATE OR REPLACE FUNCTION public.advisor_can_view_application(_advisor_user_id uuid, _application_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.advisor_assignments aa
    JOIN public.advisors a ON a.id = aa.advisor_id
    WHERE aa.application_id = _application_id AND a.user_id = _advisor_user_id
  )
$$;

-- 2. Applications: replace inline EXISTS with definer function (stops recursion into advisor_assignments)
DROP POLICY IF EXISTS "Advisors can view assigned applications" ON public.applications;
CREATE POLICY "Advisors can view assigned applications"
ON public.applications FOR SELECT TO authenticated
USING (public.advisor_can_view_application(auth.uid(), id));

DROP POLICY IF EXISTS "Advisors can update assigned applications" ON public.applications;
CREATE POLICY "Advisors can update assigned applications"
ON public.applications FOR UPDATE TO authenticated
USING (public.advisor_can_view_application(auth.uid(), id))
WITH CHECK (public.advisor_can_view_application(auth.uid(), id));

-- 3. is_own_application: ensure it does not trigger applications RLS by using same-definer read.
--    It already does SELECT from applications; if the function owner has BYPASSRLS, no recursion.
--    Re-create with explicit STABLE/SECURITY DEFINER so it runs as owner when reading applications.
CREATE OR REPLACE FUNCTION public.is_own_application(_user_id uuid, _application_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.applications
    WHERE id = _application_id AND user_id = _user_id
  )
$$;

COMMENT ON FUNCTION public.advisor_can_view_application(uuid, uuid) IS 'RLS helper: avoids recursion when applications policy checks advisor_assignments.';
COMMENT ON FUNCTION public.is_own_application(uuid, uuid) IS 'RLS helper: used by advisor_assignments policy; SECURITY DEFINER to avoid recursion when reading applications.';
