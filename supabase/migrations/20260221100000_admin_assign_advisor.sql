-- RPC: Admin assigns advisor to a customer (by auth user_id).
-- Only admins can call this (enforced by RLS; function is SECURITY DEFINER so it can update any profile).
CREATE OR REPLACE FUNCTION public.admin_assign_advisor(p_user_id uuid, p_advisor_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can assign advisors';
  END IF;
  UPDATE public.profiles
  SET assigned_advisor_id = p_advisor_id,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;
