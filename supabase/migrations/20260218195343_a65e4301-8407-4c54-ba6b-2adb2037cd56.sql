
-- 1. Tabloları oluştur (sıralı)
CREATE TABLE public.advisors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  specializations TEXT[] DEFAULT '{}',
  bio TEXT,
  is_active BOOLEAN DEFAULT true,
  max_clients INTEGER DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  destination TEXT NOT NULL,
  visa_type TEXT NOT NULL,
  plan TEXT NOT NULL,
  status TEXT DEFAULT 'Alındı',
  travel_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.advisor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  advisor_id UUID REFERENCES public.advisors(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  UNIQUE(application_id)
);

-- 2. RLS etkinleştir
ALTER TABLE public.advisors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_assignments ENABLE ROW LEVEL SECURITY;

-- 3. Trigger'lar
CREATE TRIGGER update_advisors_updated_at
BEFORE UPDATE ON public.advisors
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON public.applications
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Advisors RLS
CREATE POLICY "Admins can manage advisors" ON public.advisors
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Advisors can view own profile" ON public.advisors
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Advisors can update own profile" ON public.advisors
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Applications RLS
CREATE POLICY "Admins can manage applications" ON public.applications
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view own applications" ON public.applications
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own applications" ON public.applications
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Advisors can view assigned applications" ON public.applications
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.advisor_assignments aa
    JOIN public.advisors a ON a.id = aa.advisor_id
    WHERE aa.application_id = applications.id
    AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Advisors can update assigned applications" ON public.applications
FOR UPDATE TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.advisor_assignments aa
    JOIN public.advisors a ON a.id = aa.advisor_id
    WHERE aa.application_id = applications.id
    AND a.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.advisor_assignments aa
    JOIN public.advisors a ON a.id = aa.advisor_id
    WHERE aa.application_id = applications.id
    AND a.user_id = auth.uid()
  )
);

-- 6. Advisor Assignments RLS
CREATE POLICY "Admins can manage assignments" ON public.advisor_assignments
FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Advisors can view own assignments" ON public.advisor_assignments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.advisors a
    WHERE a.id = advisor_assignments.advisor_id
    AND a.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view own application assignments" ON public.advisor_assignments
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.applications app
    WHERE app.id = advisor_assignments.application_id
    AND app.user_id = auth.uid()
  )
);

-- 7. Adminlerin profilleri görmesi için ek policy
CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));
