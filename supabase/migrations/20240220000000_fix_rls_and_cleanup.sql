-- Advisor assignments icin guvenli kontrol fonksiyonu
CREATE OR REPLACE FUNCTION public.is_own_application(_user_id uuid, _application_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.applications
    WHERE id = _application_id AND user_id = _user_id
  )
$$;

-- Sorunlu politikayi kaldir ve yeniden olustur
DROP POLICY IF EXISTS "Users can view own application assignments" ON public.advisor_assignments;
CREATE POLICY "Users can view own application assignments" ON public.advisor_assignments
  FOR SELECT USING (public.is_own_application(auth.uid(), application_id));

-- customer@example.com kullanicisinin yanlis moderator rolunu temizle
-- NOTE: User user_id is hardcoded based on the request '23190572-2439-4251-9978-647f217caf00'
DELETE FROM public.user_roles 
WHERE user_id = '23190572-2439-4251-9978-647f217caf00' AND role = 'moderator';
