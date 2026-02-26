
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CreateRoleDialog } from './create-role-dialog'
import { EditRoleDialog } from './edit-role-dialog'
import { DeleteRoleDialog } from './delete-role-dialog'
import { getModulePermissions } from '@/lib/rbac'

export default async function RolesPage() {
  const [{ data: roles, error }, permissions] = await Promise.all([
    supabaseAdmin.from('user_roles').select('*').order('name', { ascending: true }),
    getModulePermissions('users')
  ])

  if (error) {
    return <div className="text-destructive">Error loading roles: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Roles</h2>
          <p className="text-muted-foreground">Manage user roles and their access permissions.</p>
        </div>
        {permissions.canCreate && <CreateRoleDialog />}
      </div>

      <div className="rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left text-muted-foreground">
              <th className="p-4 font-medium w-1/4">Name</th>
              <th className="p-4 font-medium w-1/2">Description</th>
              <th className="p-4 font-medium w-1/12 text-center">System</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-medium text-foreground">{role.name}</td>
                <td className="p-4 text-muted-foreground">{role.description || '—'}</td>
                <td className="p-4 text-center">
                  {role.is_system && (
                    <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-500">
                      System
                    </span>
                  )}
                </td>
                <td className="p-4 text-right flex justify-end gap-2">
                  {permissions.canUpdate && <EditRoleDialog role={role} />}
                  {!role.is_system && permissions.canDelete && <DeleteRoleDialog role={role} />}
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  No roles found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
