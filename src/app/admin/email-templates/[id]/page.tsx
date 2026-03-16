
import { TemplateForm } from '../template-form'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function EditTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [templateResult, airlines, regions, currencies] = await Promise.all([
    supabaseAdmin.from('email_templates').select('*').eq('id', id).single(),
    supabaseAdmin.from('setting_airlines').select('id, name, code').order('name'),
    supabaseAdmin.from('setting_regions').select('id, code').order('code'),
    supabaseAdmin.from('setting_currencies').select('id, code').order('code'),
  ])

  if (templateResult.error || !templateResult.data) {
    notFound()
  }

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
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Edit Email Template</h2>
          <p className="text-muted-foreground">Adjust fallback configuration or content.</p>
        </div>
      </div>

      <TemplateForm
        initialData={templateResult.data}
        airlines={airlines.data || []}
        regions={regions.data || []}
        currencies={currencies.data || []}
      />
    </div>
  )
}
