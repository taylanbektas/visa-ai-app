-- 1. Add UPDATE policy for messages table (recipients can mark as read)
CREATE POLICY "Recipients can mark messages as read"
ON public.messages FOR UPDATE
TO authenticated
USING (auth.uid() = recipient_id)
WITH CHECK (auth.uid() = recipient_id);

-- 2. Make message_attachments bucket private
UPDATE storage.buckets 
SET public = false 
WHERE id = 'message_attachments';

-- 3. Drop overly permissive storage policy and add scoped ones
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Users can view attachments from their own messages
CREATE POLICY "Users can view their message attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'message_attachments'
  AND (
    EXISTS (
      SELECT 1 FROM public.messages m
      WHERE (m.content LIKE '%' || name || '%')
      AND (m.sender_id = auth.uid() OR m.recipient_id = auth.uid())
    )
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- Authenticated users can upload to message_attachments
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload message attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'message_attachments');

-- Users can delete their own uploads
CREATE POLICY "Users can delete own message attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'message_attachments'
  AND (storage.foldername(name))[1] = auth.uid()::text
);