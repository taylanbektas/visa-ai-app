-- Phase 3 Updates: Database schema modifications for Chat and Admin Panel

-- 1. Extend profiles table with is_suspended
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_suspended') THEN
        ALTER TABLE public.profiles ADD COLUMN is_suspended BOOLEAN DEFAULT false;
    END IF;
END $$;

-- 2. Extend messages table with attachment columns
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'attachment_url') THEN
        ALTER TABLE public.messages ADD COLUMN attachment_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'attachment_type') THEN
        ALTER TABLE public.messages ADD COLUMN attachment_type TEXT;
    END IF;
END $$;

-- 3. Create Storage bucket for message attachments
INSERT INTO storage.buckets (id, name, public) 
VALUES ('message_attachments', 'message_attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for message_attachments
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'message_attachments');

DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'message_attachments');
