
import { supabaseAdmin } from '@/lib/supabase/admin'
import { Plus, Pencil } from 'lucide-react'
import Link from 'next/link'
import { getModulePermissions } from '@/lib/rbac'
import { DuplicateButton } from './duplicate-button'
import { DeleteTemplateDialog } from './delete-template-dialog'

export default async function EmailTemplatesPage() {
  const [templatesResult, _airlinesResult, _regionsResult, _currenciesResult, permissions] = await Promise.all([
    supabaseAdmin.from('email_templates').select(`
      *,
      airline:settings_airlines(name, code),
      region:settings_regions(code),
      currency:settings_currencies(code)
    `).order('type', { ascending: true }),
    supabaseAdmin.from('settings_airlines').select('id, name, code'),
    supabaseAdmin.from('settings_regions').select('id, code'),
    supabaseAdmin.from('settings_currencies').select('id, code'),
    getModulePermissions('settings')
  ])

  if (templatesResult.error) {
    return <div className="text-destructive">Error loading templates: {templatesResult.error.message}</div>
  }

  const templates = templatesResult.data

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Email Templates</h2>
          <p className="text-muted-foreground">Manage transactional email templates with A/R/C fallback logic.</p>
        </div>
        {permissions.canCreate && (
          <Link
            href="/admin/email-templates/new"
            className="btn-primary"
          >
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Link>
        )}
      </div>

      <div className="table-container">
        <table className="table-standard">
          <thead className="table-head-standard">
            <tr>
              <th className="table-th-standard">Type</th>
              <th className="table-th-standard">Airline</th>
              <th className="table-th-standard">Region</th>
              <th className="table-th-standard">Currency</th>
              <th className="table-th-standard">Subject</th>
              <th className="table-th-standard text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr key={template.id} className="table-row-standard">
                <td className="table-td-standard font-bold text-foreground">{template.type}</td>
                <td className="table-td-standard text-muted-foreground">{template.airline?.code || <span className="text-xs uppercase font-semibold text-blue-500">Global</span>}</td>
                <td className="table-td-standard text-muted-foreground">{template.region?.code || <span className="text-xs uppercase font-semibold text-blue-500">Global</span>}</td>
                <td className="table-td-standard text-muted-foreground">{template.currency?.code || <span className="text-xs uppercase font-semibold text-blue-500">Global</span>}</td>
                <td className="table-td-standard text-foreground truncate max-w-[200px]">{template.subject}</td>
                <td className="table-td-standard text-right flex justify-end gap-2">
                  {permissions.canCreate && <DuplicateButton id={template.id} />}
                  <Link
                    href={`/admin/email-templates/${template.id}`}
                    className="btn-action"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                  {permissions.canDelete && <DeleteTemplateDialog template={template} />}
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-muted-foreground">
                  No templates found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
