-- Trigger to create a profile when a new user signs up
-- This ensures every user in auth.users has a corresponding row in public.profiles

-- 1. Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, created_at)
  VALUES (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'phone',
    now()
  );
  
  -- Optionally verify if they are an advisor application (if logic exists)
  -- But usually, we just want the profile.
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill for existing users (if any missing)
-- This is tricky in Supabase SQL editor as we can't iterate auth.users easily in simple query sometimes.
-- But we can try:
INSERT INTO public.profiles (id, created_at)
SELECT id, created_at FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;
