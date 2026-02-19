
-- Fix infinite recursion: create SECURITY DEFINER function for advisor_assignments RLS
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

-- Drop the problematic policy and recreate using the safe function
DROP POLICY IF EXISTS "Users can view own application assignments" ON public.advisor_assignments;
CREATE POLICY "Users can view own application assignments" ON public.advisor_assignments
  FOR SELECT USING (public.is_own_application(auth.uid(), application_id));
