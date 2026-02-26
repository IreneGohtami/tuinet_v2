
import { supabaseAdmin } from './supabase/admin'

export async function syncUserMetadata(userId: string) {
  try {
    // 1. Get user's role from profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile for sync:', profileError)
      return { success: false, error: 'Profile not found' }
    }

    // 2. Get role_id
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('name', profile.role)
      .single()

    if (roleError || !roleData) {
      console.error('Error fetching role data for sync:', roleError)
      return { success: false, error: 'Role not found' }
    }

    // 3. Get permissions
    const { data: permissions, error: permsError } = await supabaseAdmin
      .from('user_permissions')
      .select('module, action')
      .eq('role_id', roleData.id)

    if (permsError) {
      console.error('Error fetching permissions for sync:', permsError)
      return { success: false, error: 'Permissions fetch failed' }
    }

    // 4. Update auth user metadata
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: {
        role: profile.role,
        permissions: permissions || []
      }
    })

    if (updateError) {
      console.error('Error updating user app_metadata:', updateError)
      return { success: false, error: 'Metadata update failed' }
    }

    return { success: true }
  } catch (error) {
    console.error('Sync user metadata error:', error)
    return { success: false, error: 'Unknown error' }
  }
}
