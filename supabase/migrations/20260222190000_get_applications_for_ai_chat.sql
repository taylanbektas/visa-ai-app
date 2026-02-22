-- RPC: AI chat için giriş yapan kullanıcının tüm başvurularını döndürür (tek kaynak: SQL).
-- Edge function ai-chat bu fonksiyonu çağırır; başvuru sayısı ve liste sadece buradan türetilir.
CREATE OR REPLACE FUNCTION public.get_applications_for_ai_chat()
RETURNS TABLE (
  id uuid,
  reference_id text,
  destination text,
  visa_type text,
  status text,
  travel_date text,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    a.id,
    a.reference_id,
    a.destination,
    a.visa_type,
    a.status,
    a.travel_date::text,
    a.created_at
  FROM public.applications a
  WHERE a.user_id = auth.uid()
  ORDER BY a.created_at DESC
  LIMIT 5000;
$$;

COMMENT ON FUNCTION public.get_applications_for_ai_chat() IS 'AI asistanı için kullanıcının tüm başvurularını döndürür; auth.uid() ile filtrelenir.';

GRANT EXECUTE ON FUNCTION public.get_applications_for_ai_chat() TO authenticated;
