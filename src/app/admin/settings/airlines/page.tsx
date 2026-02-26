
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

      <div className="rounded-md border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left text-muted-foreground">
              <th className="p-4 font-medium w-1/3">Name</th>
              <th className="p-4 font-medium w-1/3">Code</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {airlines.map((airline) => (
              <tr key={airline.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                <td className="p-4 font-medium text-foreground">{airline.name}</td>
                <td className="p-4 font-mono text-muted-foreground">{airline.code}</td>
                <td className="p-4 text-right flex justify-end gap-2">
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
