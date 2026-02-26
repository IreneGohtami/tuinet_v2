
'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { syncUserMetadata } from '@/lib/sync-user'

// Fetch roles for dropdowns
export async function getRoles() {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_roles')
      .select('id, name')
      .order('name', { ascending: true })

    if (error) throw error
    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error fetching roles:', error)
    return { success: false, data: [] }
  }
}

export async function deleteUser(userId: string) {
  try {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (error) throw error
    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, error: 'Failed to delete user' }
  }
}

export async function createUser(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  try {
    const { data: user, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName }
    })

    if (error) throw error

    if (user.user) {
      // Update role in profiles table.
      // Note: The trigger creates the profile with 'user' role by default.
      // We need to update it if a different role was selected.
      if (role !== 'user') {
        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .update({ role })
          .eq('id', user.user.id)

        if (profileError) {
          console.error('Error updating role:', profileError)
          // Non-fatal, user is created but role might be wrong
        }
      }

      // Sync metadata for the new user
      await syncUserMetadata(user.user.id)
    }

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error creating user:', error)
    return { success: false, error: 'Failed to create user' }
  }
}

export async function updateUser(userId: string, formData: FormData) {
  const fullName = formData.get('fullName') as string
  const role = formData.get('role') as string

  try {
    // 1. Update public profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        full_name: fullName,
        role: role
      })
      .eq('id', userId)

    if (profileError) throw profileError

    // 2. Update auth user metadata (optional but good for consistency)
    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: { full_name: fullName }
    })

    if (authError) {
      console.warn('Failed to update auth metadata:', authError)
      // Not fatal
    }

    // Trigger sync to update app_metadata (caching layer)
    await syncUserMetadata(userId)

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error updating user:', error)
    return { success: false, error: 'Failed to update user' }
  }
}

export async function resetPassword(userId: string, email: string) {
  try {
    await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    })

    // Note: generateLink returns a link. If we want to strictly SEND the email, we should use resetPasswordForEmail.
    // However, resetPasswordForEmail doesn't work well if we don't have a redirect URL set up or if we want to just trigger it.
    // simple resetPasswordForEmail sends it.

    const { error: sendError } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
    })

    if (sendError) throw sendError

    return { success: true }
  } catch (error) {
    console.error('Error resetting password:', error)
    return { success: false, error: 'Failed to send reset email' }
  }
}

export async function toggleUserStatus(userId: string, shouldBan: boolean) {
  try {
    const banDuration = shouldBan ? '876000h' : '0' // 100 years or 0
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      ban_duration: banDuration
    })

    if (error) throw error

    revalidatePath('/admin/users')
    return { success: true }
  } catch (error) {
    console.error('Error toggling user status:', error)
    return { success: false, error: 'Failed to update user status' }
  }
}
