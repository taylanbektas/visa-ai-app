-- Create consultations table
CREATE TABLE IF NOT EXISTS public.consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected', 'cancelled')),
    notes TEXT,
    is_advisor_request BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create advisor_availability table (Recurring)
CREATE TABLE IF NOT EXISTS public.advisor_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0: Sunday, 1: Monday, ...
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    UNIQUE(advisor_id, day_of_week, start_time, end_time),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create advisor_blocked_slots table (Manual overrides)
CREATE TABLE IF NOT EXISTS public.advisor_blocked_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advisor_id UUID NOT NULL REFERENCES public.advisors(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.advisor_blocked_slots ENABLE ROW LEVEL SECURITY;

-- Policies for consultations
CREATE POLICY "Users can view their own consultations" ON public.consultations
    FOR SELECT USING (auth.uid() = customer_id OR auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id));

CREATE POLICY "Users can insert their own consultations" ON public.consultations
    FOR INSERT WITH CHECK (auth.uid() = customer_id OR auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id));

CREATE POLICY "Users/Advisors can update their own consultations" ON public.consultations
    FOR UPDATE USING (auth.uid() = customer_id OR auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id));

-- Policies for advisor_availability
CREATE POLICY "Anyone can view advisor availability" ON public.advisor_availability
    FOR SELECT USING (true);

CREATE POLICY "Advisors can manage their own availability" ON public.advisor_availability
    FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id));

-- Policies for advisor_blocked_slots
CREATE POLICY "Anyone can view blocked slots" ON public.advisor_blocked_slots
    FOR SELECT USING (true);

CREATE POLICY "Advisors can manage their own blocked slots" ON public.advisor_blocked_slots
    FOR ALL USING (auth.uid() IN (SELECT user_id FROM public.advisors WHERE id = advisor_id));
