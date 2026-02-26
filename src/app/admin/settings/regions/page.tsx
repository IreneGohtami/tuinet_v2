
import { supabaseAdmin } from '@/lib/supabase/admin'
import { CreateRegionDialog } from './create-region-dialog'
import { EditRegionDialog } from './edit-region-dialog'
import { DeleteRegionDialog } from './delete-region-dialog'
import { getModulePermissions } from '@/lib/rbac'

export default async function RegionsPage() {
  const [{ data: regions, error }, permissions] = await Promise.all([
    supabaseAdmin.from('settings_regions').select('*').order('code', { ascending: true }),
    getModulePermissions('settings')
  ])

  if (error) {
    return <div className="text-destructive">Error loading regions: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Regions</h2>
          <p className="text-muted-foreground">Manage reference data for regions.</p>
        </div>
        {permissions.canCreate && <CreateRegionDialog />}
      </div>

      <div className="rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left text-muted-foreground">
              <th className="p-4 font-medium w-2/3">Code</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((region) => (
              <tr key={region.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-medium font-mono text-foreground">{region.code}</td>
                <td className="p-4 text-right flex justify-end gap-2">
                  {permissions.canUpdate && <EditRegionDialog region={region} />}
                  {permissions.canDelete && <DeleteRegionDialog region={region} />}
                </td>
              </tr>
            ))}
            {regions.length === 0 && (
              <tr>
                <td colSpan={2} className="p-8 text-center text-muted-foreground">
                  No regions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
