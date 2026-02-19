-- Create a secure function to allow admins to delete a user completely from the auth.users table
-- This is necessary because the Supabase JS client auth.admin.deleteUser requires service_role key,
-- which shouldn't be exposed to the client. This function runs with SECURITY DEFINER and checks roles.

CREATE OR REPLACE FUNCTION delete_user(user_id UUID)
RETURNS void AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- 1. Verify caller has admin privileges
  -- Let's check if the caller's ID exists in user_roles with role 'admin'
  SELECT role INTO caller_role
  FROM public.user_roles
  WHERE user_roles.user_id = auth.uid() AND role = 'admin'
  LIMIT 1;

  IF caller_role IS NULL THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can delete users';
  END IF;

  -- 2. Delete the user from auth.users
  -- NOTE: Because of ON DELETE CASCADE, this will also automatically remove:
  -- - public.profiles
  -- - public.user_roles
  -- - public.messages
  -- - public.advisors (if any)
  -- - public.visa_applications (check if cascade is set, if not it will error or set null)
  
  DELETE FROM auth.users WHERE id = user_id;

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
