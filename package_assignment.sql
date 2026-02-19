
-- Add active_package and package_assigned_at to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_package TEXT CHECK (active_package IN ('starter', 'pro', 'elite')),
ADD COLUMN IF NOT EXISTS package_assigned_at TIMESTAMPTZ;

-- Enable RLS for admins to update these columns
-- Existing policies might already allow admins to update profiles, but let's be explicit if needed.
-- Looking at supabase_consolidated_migration.sql, it has:
-- CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
-- We need a policy for admins to update profiles too.

DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() and role = 'admin'
    )
  );
