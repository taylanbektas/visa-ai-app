-- Allow customers to insert into advisor_assignments when creating an application
-- (so the assigned advisor can see the application and it appears in finances).
-- Also backfill missing assignments for existing applications.

-- 1. INSERT policy: user can add assignment for their own application with their assigned_advisor_id
CREATE POLICY "Users can create own application assignment"
ON public.advisor_assignments FOR INSERT TO authenticated
WITH CHECK (
  public.is_own_application(auth.uid(), application_id)
  AND advisor_id = (SELECT assigned_advisor_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1)
);

-- 2. Backfill: add advisor_assignments for applications that have none (use profile.assigned_advisor_id)
INSERT INTO public.advisor_assignments (application_id, advisor_id)
SELECT a.id, p.assigned_advisor_id
FROM public.applications a
JOIN public.profiles p ON p.user_id = a.user_id AND p.assigned_advisor_id IS NOT NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.advisor_assignments aa WHERE aa.application_id = a.id
)
ON CONFLICT (application_id) DO NOTHING;
