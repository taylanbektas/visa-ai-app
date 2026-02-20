import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    const { data, error } = await supabase.from('messages').select('*').limit(5).order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching:', error);
        return;
    }
    console.log('Latest messages:', JSON.stringify(data, null, 2));
}

check();
