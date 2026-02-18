import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets()
  console.log('Buckets:', data)
  console.log('Error:', error)
}
listBuckets()
