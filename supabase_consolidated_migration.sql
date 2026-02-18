-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Base User Table)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    updated_at TIMESTAMPTZ,
    full_name TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add assigned_advisor_id to profiles if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'assigned_advisor_id') THEN
        ALTER TABLE public.profiles ADD COLUMN assigned_advisor_id UUID;
    END IF;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. ADVISORS (Extended Profile for Advisors)
CREATE TABLE IF NOT EXISTS public.advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  bio TEXT,
  specialties TEXT[],
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  max_clients INTEGER DEFAULT 50,
  UNIQUE(user_id)
);

-- Add new columns to advisors if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advisors' AND column_name = 'email') THEN
        ALTER TABLE public.advisors ADD COLUMN email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advisors' AND column_name = 'phone') THEN
        ALTER TABLE public.advisors ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advisors' AND column_name = 'photo_url') THEN
        ALTER TABLE public.advisors ADD COLUMN photo_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'advisors' AND column_name = 'about_me') THEN
        ALTER TABLE public.advisors ADD COLUMN about_me TEXT;
    END IF;
END $$;

ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;

-- 3. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 4. ADVISOR APPLICATIONS
CREATE TABLE IF NOT EXISTS public.advisor_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    resume_url TEXT,
    bio TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.advisor_applications ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES (Drop first to avoid "already exists" errors)

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Advisors Policies
DROP POLICY IF EXISTS "Advisors are viewable by everyone" ON public.advisors;
CREATE POLICY "Advisors are viewable by everyone" ON public.advisors FOR SELECT USING (true);

DROP POLICY IF EXISTS "Advisors can update their own profile" ON public.advisors;
CREATE POLICY "Advisors can update their own profile" ON public.advisors FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage advisors" ON public.advisors;
CREATE POLICY "Admins can manage advisors" ON public.advisors FOR ALL USING (
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() and role = 'admin'
    )
);

-- Messages Policies
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;
CREATE POLICY "Users can insert messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Advisor Applications Policies
DROP POLICY IF EXISTS "Users can view own application" ON public.advisor_applications;
CREATE POLICY "Users can view own application" ON public.advisor_applications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create application" ON public.advisor_applications;
CREATE POLICY "Users can create application" ON public.advisor_applications FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can view all applications" ON public.advisor_applications;
CREATE POLICY "Admins can view all applications" ON public.advisor_applications FOR SELECT USING (
    exists (
        select 1 from public.user_roles 
        where user_id = auth.uid() and role = 'admin'
    )
);

DROP POLICY IF EXISTS "Admins can update applications" ON public.advisor_applications;
CREATE POLICY "Admins can update applications" ON public.advisor_applications FOR UPDATE USING (
    exists (
        select 1 from public.user_roles 
        where user_id = auth.uid() and role = 'admin'
    )
);

-- Grant permissions if needed (usually handled by default in Supabase, but good to be safe for table creation)
GRANT ALL ON TABLE public.profiles TO postgres;
GRANT ALL ON TABLE public.profiles TO service_role;
GRANT ALL ON TABLE public.advisors TO postgres;
GRANT ALL ON TABLE public.advisors TO service_role;
GRANT ALL ON TABLE public.messages TO postgres;
GRANT ALL ON TABLE public.messages TO service_role;
