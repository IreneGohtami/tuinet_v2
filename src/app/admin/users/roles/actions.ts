
'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// --- Roles ---

export async function createRole(data: { name: string; description?: string }) {
  try {
    const { error } = await supabaseAdmin.from('user_roles').insert(data)
    if (error) throw error
    revalidatePath('/admin/users/roles')
    return { success: true }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return { success: false, error: 'Role name must be unique.' }
    }
    console.error('Error creating role:', error)
    return { success: false, error: 'Failed to create role' }
  }
}

export async function updateRole(id: string, data: { name: string; description?: string }) {
  try {
    const { error } = await supabaseAdmin.from('user_roles').update(data).eq('id', id)
    if (error) throw error
    revalidatePath('/admin/users/roles')
    return { success: true }
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === '23505') {
      return { success: false, error: 'Role name must be unique.' }
    }
    console.error('Error updating role:', error)
    return { success: false, error: 'Failed to update role' }
  }
}

export async function deleteRole(id: string) {
  try {
    const { error } = await supabaseAdmin.from('user_roles').delete().eq('id', id)
    if (error) throw error
    revalidatePath('/admin/users/roles')
    return { success: true }
  } catch (error) {
    console.error('Error deleting role:', error)
    return { success: false, error: 'Failed to delete role' }
  }
}

// --- Permissions ---

export async function getRolePermissions(roleId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('user_permissions')
      .select('*')
      .eq('role_id', roleId)

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return { success: false, error: 'Failed to fetch permissions', data: [] }
  }
}

export async function updateRolePermissions(
  roleId: string,
  permissions: { module: string; action: string }[]
) {
  try {
    // Delete existing permissions
    await supabaseAdmin.from('user_permissions').delete().eq('role_id', roleId)

    // Insert new permissions
    if (permissions.length > 0) {
      const permissionsData = permissions.map(p => ({
        role_id: roleId,
        module: p.module,
        action: p.action
      }))

      const { error } = await supabaseAdmin.from('user_permissions').insert(permissionsData)
      if (error) throw error
    }

    revalidatePath('/admin/users/roles')
    return { success: true }
  } catch (error) {
    console.error('Error updating permissions:', error)
    return { success: false, error: 'Failed to update permissions' }
  }
}

export async function getReferenceData() {
  try {
    const [airlines, regions, currencies] = await Promise.all([
      supabaseAdmin.from('setting_airlines').select('id, name, code').order('name'),
      supabaseAdmin.from('setting_regions').select('id, code').order('code'),
      supabaseAdmin.from('setting_currencies').select('id, code').order('code')
    ])

    return {
      success: true,
      data: {
        airlines: airlines.data || [],
        regions: regions.data || [],
        currencies: currencies.data || []
      }
    }
  } catch (error) {
    console.error('Error fetching reference data:', error)
    return {
      success: false,
      error: 'Failed to fetch reference data',
      data: { airlines: [], regions: [], currencies: [] }
    }
  }
}
