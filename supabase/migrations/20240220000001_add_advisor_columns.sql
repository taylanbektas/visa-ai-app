-- Add missing columns to advisors table
ALTER TABLE public.advisors 
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Ensure RLS policies cover updates to these columns
-- (Existing policy "Advisors can update their own profile" covers all columns)
