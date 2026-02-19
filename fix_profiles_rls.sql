-- This script fixes the issue where Admins cannot assign advisors to users
-- because they lack UPDATE permissions on the profiles table.

-- Add a policy that allows admins to update all profiles
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'profiles' AND policyname = 'Admins can update profiles'
    ) THEN
        CREATE POLICY "Admins can update profiles" ON public.profiles 
        FOR UPDATE 
        TO authenticated
        USING (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        )
        WITH CHECK (
            EXISTS (
                SELECT 1 FROM public.user_roles 
                WHERE user_id = auth.uid() AND role = 'admin'
            )
        );
    END IF;
END $$;
