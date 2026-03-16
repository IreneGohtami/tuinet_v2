
import { supabaseAdmin } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import { SmtpSettingsForm } from './smtp-settings-form'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function AirlineSmtpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [airlineResult, smtpResult] = await Promise.all([
    supabaseAdmin.from('setting_airlines').select('*').eq('id', id).single(),
    supabaseAdmin.from('setting_airline_smtp').select('*').eq('airline_id', id).single()
  ])

  if (airlineResult.error || !airlineResult.data) {
    notFound()
  }

  const airline = airlineResult.data
  const smtpSettings = smtpResult.data || null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/settings/airlines"
          className="p-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            SMTP Settings: {airline.name}
          </h2>
          <p className="text-muted-foreground">
            Configure email delivery credentials for {airline.name} ({airline.code}).
          </p>
        </div>
      </div>

      <div className="max-w-2xl bg-card border border-border rounded-lg p-6">
        <SmtpSettingsForm airlineId={id} initialData={smtpSettings} />
      </div>
    </div>
  )
}
