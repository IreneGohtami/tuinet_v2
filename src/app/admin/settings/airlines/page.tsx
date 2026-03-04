
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Mail } from 'lucide-react'
import { CreateAirlineDialog } from './create-airline-dialog'
import { EditAirlineDialog } from './edit-airline-dialog'
import { DeleteAirlineDialog } from './delete-airline-dialog'
import { getModulePermissions } from '@/lib/rbac'
import Link from 'next/link'

export default async function AirlinesPage() {
  const [{ data: airlines, error }, permissions] = await Promise.all([
    supabaseAdmin.from('settings_airlines').select('*').order('name', { ascending: true }),
    getModulePermissions('settings')
  ])

  if (error) {
    return <div className="text-destructive">Error loading airlines: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Airlines</h2>
          <p className="text-muted-foreground">Manage reference data for airlines.</p>
        </div>
        {permissions.canCreate && <CreateAirlineDialog />}
      </div>

      <div className="table-container">
        <table className="table-standard">
          <thead className="table-head-standard">
            <tr>
              <th className="table-th-standard">Code</th>
              <th className="table-th-standard">Name</th>
              <th className="table-th-standard text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {airlines.map((airline) => (
              <tr key={airline.id} className="table-row-standard">
                <td className="table-td-standard font-mono font-bold text-primary">
                  {airline.code}
                </td>
                <td className="table-td-standard">
                  {airline.name}
                </td>
                <td className="table-td-standard text-right flex justify-end gap-2">
                  {permissions.canUpdate && (
                    <>
                      <Link
                        href={`/admin/settings/airlines/${airline.id}/smtp`}
                        className="btn-action"
                        title="SMTP Settings"
                      >
                        <Mail className="h-4 w-4" />
                      </Link>
                      <EditAirlineDialog airline={airline} />
                    </>
                  )}
                  {permissions.canDelete && <DeleteAirlineDialog airline={airline} />}
                </td>
              </tr>
            ))}
            {airlines.length === 0 && (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                  No airlines found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
