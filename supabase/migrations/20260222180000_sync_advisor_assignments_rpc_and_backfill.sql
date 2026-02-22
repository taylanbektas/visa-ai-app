-- Sync advisor assignments: ensure every application has a row in advisor_assignments
-- so advisors see them and finances work. Safe to run multiple times.

CREATE OR REPLACE FUNCTION public.sync_advisor_assignments()
RETURNS TABLE(applications_updated int, assignments_inserted int)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_updated int := 0;
  v_inserted int := 0;
BEGIN
  -- 1. Give an advisor to profiles that have applications but no assigned_advisor_id
  WITH profs AS (
    SELECT p.user_id, p.id
    FROM public.profiles p
    WHERE p.assigned_advisor_id IS NULL
      AND EXISTS (SELECT 1 FROM public.applications a WHERE a.user_id = p.user_id)
  ),
  updated AS (
    UPDATE public.profiles p
    SET assigned_advisor_id = public.get_least_busy_advisor()
    FROM profs
    WHERE p.user_id = profs.user_id
    RETURNING p.user_id
  )
  SELECT count(*) INTO v_updated FROM updated;

  -- 2. Insert missing advisor_assignments (use profile.assigned_advisor_id)
  WITH missing AS (
    SELECT a.id AS application_id, p.assigned_advisor_id AS advisor_id
    FROM public.applications a
    JOIN public.profiles p ON p.user_id = a.user_id AND p.assigned_advisor_id IS NOT NULL
    WHERE NOT EXISTS (
      SELECT 1 FROM public.advisor_assignments aa WHERE aa.application_id = a.id
    )
  )
  INSERT INTO public.advisor_assignments (application_id, advisor_id)
  SELECT application_id, advisor_id FROM missing
  ON CONFLICT (application_id) DO NOTHING;

  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  applications_updated := v_updated;
  assignments_inserted := v_inserted;
  RETURN NEXT;
  RETURN;
END;
$$;

COMMENT ON FUNCTION public.sync_advisor_assignments() IS 'Backfill: set assigned_advisor_id where missing, then insert missing advisor_assignments. Call from SQL or admin.';

-- Run once so existing data is fixed
SELECT * FROM public.sync_advisor_assignments();

-- Allow authenticated to call (e.g. admin panel can trigger sync)
GRANT EXECUTE ON FUNCTION public.sync_advisor_assignments() TO authenticated;
