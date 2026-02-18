-- Update Profiles Table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS assigned_advisor_id UUID REFERENCES public.advisors(id);

-- Update Advisors Table
ALTER TABLE public.advisors 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS photo_url TEXT,
ADD COLUMN IF NOT EXISTS about_me TEXT;

-- Update RLS for detailed permissions if needed
-- (Assume existing policies cover basic updates for own profile)
