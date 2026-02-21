-- Add notes column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS notes TEXT;

-- Update RLS policies for profiles to allow advisors to update notes for their assigned customers
-- Assuming advisors have the 'moderator' role or there is a specific way to identify them.
-- Based on the schema, advisors are linked to profiles via assigned_advisor_id.

CREATE POLICY "Advisors can update notes for assigned customers" ON public.profiles
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.advisors a
    WHERE a.id = profiles.assigned_advisor_id
    AND a.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.advisors a
    WHERE a.id = profiles.assigned_advisor_id
    AND a.user_id = auth.uid()
  )
);
