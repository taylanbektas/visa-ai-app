-- Create customer_packages table to track specific package instances and counts
CREATE TABLE IF NOT EXISTS public.customer_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL,
    package_type TEXT NOT NULL CHECK (package_type IN ('starter', 'pro', 'elite')),
    remaining_count INTEGER NOT NULL DEFAULT 1,
    purchased_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for customer_packages
ALTER TABLE public.customer_packages ENABLE ROW LEVEL SECURITY;

-- Policies for customer_packages
CREATE POLICY "Users can view own packages" ON public.customer_packages
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all packages" ON public.customer_packages
    FOR ALL USING (
        exists (
            select 1 from public.user_roles 
            where user_id = auth.uid() and role = 'admin'
        )
    );

-- Add payment columns to applications
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed')),
ADD COLUMN IF NOT EXISTS used_package_id UUID REFERENCES public.customer_packages(id);

-- Update existing applications to 'paid' if they were created before this change
UPDATE public.applications SET payment_status = 'paid' WHERE payment_status = 'pending';
