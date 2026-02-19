-- Add last_seen to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure messages has read column (it already does according to types.ts, but being safe)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND column_name='read') THEN
        ALTER TABLE messages ADD COLUMN read BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
