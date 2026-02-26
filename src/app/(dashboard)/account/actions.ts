
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const fullName = formData.get('fullName') as string

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  try {
    // Update public profile
    const { error } = await supabase
      .from('user_profiles')
      .update({ full_name: fullName })
      .eq('id', user.id)

    if (error) throw error

    // Optionally update auth metadata
    await supabase.auth.updateUser({
      data: { full_name: fullName }
    })

    revalidatePath('/account')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile:', error)
    return { success: false, error: 'Failed to update profile' }
  }
}

export async function changePassword(formData: FormData) {
  const supabase = await createClient()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match' }
  }

  if (password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters' }
  }

  try {
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error changing password:', error)
    return { success: false, error: 'Failed to change password' }
  }
}

export async function signOutAllSessionsAction() {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signOut({ scope: 'global' })
    if (error) throw error

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error signing out of all sessions:', error)
    return { success: false, error: 'Failed to sign out of all sessions' }
  }
}
