
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { syncUserMetadata } from '@/lib/sync-user'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`)
  }

  // Sync permissions to app_metadata on login
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    await syncUserMetadata(user.id)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
