
import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { syncUserMetadata } from './sync-user'

export type Permission = {
  module: string
  action: 'create' | 'read' | 'update' | 'delete'
}

export const getUserPermissions = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // 1. Check app_metadata first (Caching layer)
  if (user.app_metadata?.permissions) {
    return user.app_metadata.permissions as Permission[]
  }

  // 2. Fallback to DB (and sync for future requests)
  // We use syncUserMetadata which uses supabaseAdmin internally
  await syncUserMetadata(user.id)

  // Re-fetch user to get updated metadata
  const { data: { user: updatedUser } } = await supabase.auth.getUser()
  return (updatedUser?.app_metadata?.permissions || []) as Permission[]
})

export async function hasPermission(module: string, action: Permission['action']) {
  const permissions = await getUserPermissions()
  return permissions.some(p => p.module === module && p.action === action)
}

export async function getModulePermissions(module: string) {
  const permissions = await getUserPermissions()
  const modulePerms = permissions.filter(p => p.module === module)

  return {
    canRead: modulePerms.some(p => p.action === 'read') || module === 'any', // generic check
    canCreate: modulePerms.some(p => p.action === 'create'),
    canUpdate: modulePerms.some(p => p.action === 'update'),
    canDelete: modulePerms.some(p => p.action === 'delete')
  }
}

export async function canAccessAdmin() {
  const permissions = await getUserPermissions()
  // If user has 'read' access to any module, they can access admin
  return permissions.length > 0
}
