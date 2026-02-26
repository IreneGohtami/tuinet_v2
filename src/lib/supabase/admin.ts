import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY are set in .env.local. ' +
    'If you just added them, restart your dev server with: npm run dev'
  )
}

// Note: This client should ONLY be used in secure server-side contexts (API routes, Server Actions).
// It bypasses Row Level Security.
export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
