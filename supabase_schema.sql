-- Create Advisors Table (Extended Profile)
CREATE TABLE IF NOT EXISTS public.advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  full_name TEXT,
  bio TEXT,
  specialties TEXT[], -- e.g., ['Schengen', 'USA', 'Student']
  rating NUMERIC DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS for Advisors
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;

-- Advisors Policies
CREATE POLICY "Advisors are viewable by everyone" ON public.advisors
  FOR SELECT USING (true);

CREATE POLICY "Advisors can update their own profile" ON public.advisors
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage advisors" ON public.advisors
  FOR ALL USING (
    exists (
      select 1 from public.user_roles 
      where user_id = auth.uid() and role = 'admin'
    )
  );

-- Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) NOT NULL,
  recipient_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for Messages
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Messages Policies
CREATE POLICY "Users can view their own messages" ON public.messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert messages" ON public.messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Create Advisor Applications Table if not exists (it was missing from types)
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

-- RLS for Advisor Applications
ALTER TABLE public.advisor_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own application" ON public.advisor_applications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create application" ON public.advisor_applications
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications" ON public.advisor_applications
    FOR SELECT USING (
        exists (
            select 1 from public.user_roles 
            where user_id = auth.uid() and role = 'admin'
        )
    );

CREATE POLICY "Admins can update applications" ON public.advisor_applications
    FOR UPDATE USING (
        exists (
            select 1 from public.user_roles 
            where user_id = auth.uid() and role = 'admin'
        )
    );
