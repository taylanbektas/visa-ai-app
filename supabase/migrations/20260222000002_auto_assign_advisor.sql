-- Function to find advisor with minimum customers
CREATE OR REPLACE FUNCTION public.get_least_busy_advisor()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_advisor_id UUID;
BEGIN
    SELECT a.id INTO v_advisor_id
    FROM public.advisors a
    LEFT JOIN public.profiles p ON p.assigned_advisor_id = a.id
    WHERE a.is_active = true
    GROUP BY a.id
    ORDER BY count(p.id) ASC, a.created_at ASC
    LIMIT 1;
    
    RETURN v_advisor_id;
END;
$$;

-- Update handle_new_user to assign advisor
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_advisor_id UUID;
BEGIN
    -- Find least busy advisor
    v_advisor_id := public.get_least_busy_advisor();

    INSERT INTO public.profiles (user_id, full_name, assigned_advisor_id)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', v_advisor_id);
    
    RETURN NEW;
END;
$$;
