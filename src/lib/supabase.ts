import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Video {
  id: string
  title: string
  url: string
  category: string
  description?: string
  year?: number
  format?: string
  runtime?: string
  order_index?: number
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  email: string
  created_at?: string
}

export interface AboutContent {
  id: string
  content_type: 'text' | 'image'
  title: string
  content: string
  order_index: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}