
import { TemplateForm } from '../template-form'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NewTemplatePage() {
  const [airlines, regions, currencies] = await Promise.all([
    supabaseAdmin.from('setting_airlines').select('id, name, code').order('name'),
    supabaseAdmin.from('setting_regions').select('id, code').order('code'),
    supabaseAdmin.from('setting_currencies').select('id, code').order('code'),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/email-templates"
          className="p-2 hover:bg-secondary rounded-full transition-colors font-medium text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">New Email Template</h2>
          <p className="text-muted-foreground">Create a new template with fallback configuration.</p>
        </div>
      </div>

      <TemplateForm
        airlines={airlines.data || []}
        regions={regions.data || []}
        currencies={currencies.data || []}
      />
    </div>
  )
}
