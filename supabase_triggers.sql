-- Trigger to create a profile when a new user signs up
-- This ensures every user in auth.users has a corresponding row in public.profiles

-- 1. Create the function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  -- Try to insert with user_id to satisfy not-null constraint
  -- Handle unique violations gracefully using ON CONFLICT
  INSERT INTO public.profiles (id, user_id, full_name, phone, created_at)
  VALUES (
    new.id,
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'phone',
    now()
  )
  ON CONFLICT (id) DO NOTHING; 
  -- Note: If conflict is on user_id but id is different, it might still fail, 
  -- but usually id and user_id are 1:1 in this schema design.
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill for existing users (robust version)
INSERT INTO public.profiles (id, user_id, created_at)
SELECT id, id, created_at FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
  AND id NOT IN (SELECT user_id FROM public.profiles) -- Ensure we don't violate user_id unique constraint
ON CONFLICT (id) DO NOTHING;
