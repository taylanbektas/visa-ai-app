
-- Add assigned_to to applications table
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS assigned_to UUID REFERENCES auth.users(id);

-- Add policy for Advisors to view assigned applications
CREATE POLICY "Advisors can view assigned applications" ON public.applications
  FOR SELECT USING (
    auth.uid() = assigned_to 
    OR 
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() and role = 'admin'
    )
  );
