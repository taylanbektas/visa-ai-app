-- Make documents bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'documents';

-- Users can view their own application documents
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can upload to their own folder
CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Admins can manage all documents
CREATE POLICY "Admins can manage all documents in storage"
ON storage.objects FOR ALL
TO authenticated
USING (
  bucket_id = 'documents'
  AND public.has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  bucket_id = 'documents'
  AND public.has_role(auth.uid(), 'admin'::app_role)
);