import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | {
  from: () => any;
  channel: () => any;
  removeChannel: () => void;
  storage: { from: () => any };
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.error('Please create a .env.local file with:')
  console.error('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key')
  
  // Create a mock client that will show helpful error messages
  supabase = {
    from: () => ({
      select: () => ({
        order: () => ({
          gte: () => ({
            limit: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } })
          })
        })
      }),
      insert: () => Promise.resolve({ data: null, error: { message: 'Supabase not configured. Please set up your environment variables.' } })
    }),
    channel: () => ({
      on: () => ({
        subscribe: () => ({ unsubscribe: () => {} })
      })
    }),
    removeChannel: () => {},
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ error: { message: 'Supabase not configured' } }),
        getPublicUrl: () => ({ data: { publicUrl: null } })
      })
    }
  }
} else {
  console.log('✅ Supabase URL:', supabaseUrl)
  console.log('✅ Supabase Key (first 20 chars):', supabaseAnonKey.substring(0, 20) + '...')
  
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          id: string
          name: string | null
          title: string
          content: string
          image_url: string | null
          created_at: string
          updated_at: string
          likes_count: number
          comments_count: number
          views_count: number
        }
        Insert: {
          id?: string
          name?: string | null
          title: string
          content: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
          likes_count?: number
          comments_count?: number
          views_count?: number
        }
        Update: {
          id?: string
          name?: string | null
          title?: string
          content?: string
          image_url?: string | null
          created_at?: string
          updated_at?: string
          likes_count?: number
          comments_count?: number
          views_count?: number
        }
      }
      comments: {
        Row: {
          id: string
          post_id: string
          name: string | null
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          name?: string | null
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          name?: string | null
          content?: string
          created_at?: string
          updated_at?: string
        }
      }
      reactions: {
        Row: {
          id: string
          post_id: string
          type: 'like' | 'dislike' | 'laugh' | 'angry' | 'heart'
          ip_address: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          type: 'like' | 'dislike' | 'laugh' | 'angry' | 'heart'
          ip_address: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          type?: 'like' | 'dislike' | 'laugh' | 'angry' | 'heart'
          ip_address?: string
          created_at?: string
        }
      }
    }
  }
}