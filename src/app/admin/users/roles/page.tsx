
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

      <div className="table-container">
        <table className="table-standard">
          <thead className="table-head-standard">
            <tr>
              <th className="table-th-standard">Name</th>
              <th className="table-th-standard">Description</th>
              <th className="table-th-standard text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id} className="table-row-standard">
                <td className="table-td-standard font-medium">
                  <div className="flex items-center gap-2">
                    {role.name}
                    {role.is_system && (
                      <span className="px-2 py-0.5 rounded-full bg-secondary text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        System
                      </span>
                    )}
                  </div>
                </td>
                <td className="table-td-standard text-muted-foreground italic">
                  {role.description || 'No description'}
                </td>
                <td className="table-td-standard text-right">
                  <div className="flex justify-end gap-2">
                    {permissions.canUpdate && <EditRoleDialog role={role} />}
                    {!role.is_system && permissions.canDelete && <DeleteRoleDialog role={role} />}
                  </div>
                </td>
              </tr>
            ))}
            {roles.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground">
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
