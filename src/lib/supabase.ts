import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: SupabaseClient<Database>

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please create a .env.local file with:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  
  // Create a mock client with proper typing
  supabase = createClient<Database>('https://mock.supabase.co', 'mock-key')
} else {
  console.log('✅ Supabase URL:', supabaseUrl)
  console.log('✅ Supabase Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...')
  
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
}

export { supabase }