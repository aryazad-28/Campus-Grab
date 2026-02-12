import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Log for debugging
if (typeof window !== 'undefined') {
  console.log('Supabase URL:', supabaseUrl ? 'Set' : 'NOT SET')
  console.log('Supabase Key:', supabaseAnonKey ? 'Set' : 'NOT SET')
}

// Create client - will throw error if credentials missing
let supabase: SupabaseClient | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }

// Database types
export interface MenuItem {
  id: string
  admin_id?: string
  name: string
  category: string
  price: number
  image_url: string | null
  eta_minutes: number
  canteen_id?: number
  available: boolean
}

export interface Canteen {
  id: number
  name: string
  location: string | null
  is_open: boolean
}

export interface Order {
  id: string
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  estimated_time: number
  payment_method: string
  status: 'pending' | 'preparing' | 'ready' | 'completed'
  created_at: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  eta_minutes: number
}
