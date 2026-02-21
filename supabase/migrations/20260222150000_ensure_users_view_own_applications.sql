-- Ensure customers can always see their own applications (user_id = auth.uid())
-- Re-create in case it was dropped or missing
DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;
CREATE POLICY "Users can view own applications"
ON public.applications FOR SELECT TO authenticated
USING (auth.uid() = user_id);
