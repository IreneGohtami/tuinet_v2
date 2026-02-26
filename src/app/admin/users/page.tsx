import { supabaseAdmin } from '@/lib/supabase/admin'
import { CreateUserDialog } from './create-user-dialog'
import { getModulePermissions } from '@/lib/rbac'
import { UserTable } from './user-table'

export default async function UsersPage() {
  // Fetch users from Auth to get email, banned status, last_sign_in
  // auth.admin.listUsers defaults to 50, so we need to loop to get all users
  const allUsers = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const { data, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page,
      perPage: 1000
    })

    if (authError) {
      return (
        <div className="p-4 rounded-md bg-destructive/10 text-destructive">
          Error loading users: {authError.message}
        </div>
      )
    }

    const { users } = data
    allUsers.push(...users)
    // Some versions of supabase-js might have total in data as a pagination field
    hasMore = users.length === 1000
    page++
  }

  // Fetch profiles and permissions
  const [profilesRes, rolesRes, permissions] = await Promise.all([
    supabaseAdmin.from('user_profiles').select('*'),
    supabaseAdmin.from('user_roles').select('id, name').order('name', { ascending: true }),
    getModulePermissions('users')
  ])

  const profiles = profilesRes.data
  const roles = rolesRes.data || []

  if (profilesRes.error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive">
        Error loading profiles: {profilesRes.error.message}
      </div>
    )
  }

  // Merge data
  const mergedUsers = allUsers.map(user => {
    const profile = profiles?.find(p => p.id === user.id)
    return {
      id: user.id,
      email: user.email || '',
      full_name: profile?.full_name || user.user_metadata?.full_name || '',
      role: profile?.role || 'user',
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at || null,
      banned_until: user.banned_until || null,
      is_banned: user.banned_until ? new Date(user.banned_until) > new Date() : false
    }
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">User Management</h2>
        {permissions.canCreate && <CreateUserDialog roles={roles} />}
      </div>

      <UserTable
        users={mergedUsers}
        roles={roles}
        permissions={permissions}
      />
    </div>
  )
}
