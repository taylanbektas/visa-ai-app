-- Create Application Documents Table
CREATE TABLE IF NOT EXISTS public.application_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
    advisor_id UUID REFERENCES public.advisors(id),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for Application Documents
ALTER TABLE public.application_documents ENABLE ROW LEVEL SECURITY;

-- Advisors can manage documents for their assigned customers
CREATE POLICY "Advisors can manage documents for their assigned customers"
    ON public.application_documents
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.advisor_assignments
            JOIN public.advisors ON advisors.id = advisor_assignments.advisor_id
            WHERE advisor_assignments.application_id = application_documents.application_id
            AND advisors.user_id = auth.uid()
        )
    );

-- Customers can view documents for their applications
CREATE POLICY "Customers can view their application documents"
    ON public.application_documents
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.applications
            WHERE id = application_documents.application_id
            AND user_id = auth.uid()
        )
    );
