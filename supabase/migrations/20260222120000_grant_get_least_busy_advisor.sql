-- Allow authenticated users to call get_least_busy_advisor (e.g. for dashboard auto-assign)
GRANT EXECUTE ON FUNCTION public.get_least_busy_advisor() TO authenticated;
