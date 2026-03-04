
'use client'

import { useState, useRef } from 'react'
import { saveSMTPSettings } from '@/app/admin/email-actions'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { TestSmtpDialog } from './test-smtp-dialog'

interface SmtpSettingsFormProps {
  airlineId: string
  initialData: Record<string, unknown> | null
}

export function SmtpSettingsForm({ airlineId, initialData }: SmtpSettingsFormProps) {
  const router = useRouter()
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)
  const [authType, setAuthType] = useState(initialData?.auth_type || 'BASIC')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  function getFormData() {
    if (!formRef.current) return {}
    const formData = new FormData(formRef.current)
    return {
      auth_type: authType,
      user: formData.get('user'),
      host: formData.get('host'),
      port: Number(formData.get('port')),
      password: formData.get('password'),
      client_id: formData.get('client_id'),
      client_secret: formData.get('client_secret'),
      tenant_id: formData.get('tenant_id'),
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    const data = getFormData()
    const result = await saveSMTPSettings(airlineId, data)
    setLoading(false)

    if (result.success) {
      setMessage({ type: 'success', text: 'SMTP settings saved successfully' })
      router.refresh()
    } else {
      setMessage({ type: 'error', text: 'Error: ' + result.error })
    }
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-4 rounded-md text-sm border ${message.type === 'success'
          ? 'bg-green-500/10 text-green-500 border-green-500/20'
          : 'bg-red-500/10 text-red-500 border-red-500/20'
          }`}>
          {message.text}
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground text-left block">Authentication Type</label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer text-foreground">
              <input
                type="radio"
                name="auth_type"
                value="BASIC"
                checked={authType === 'BASIC'}
                onChange={() => setAuthType('BASIC')}
              />
              Basic (User/Pass)
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-foreground">
              <input
                type="radio"
                name="auth_type"
                value="OAUTH2"
                checked={authType === 'OAUTH2'}
                onChange={() => setAuthType('OAUTH2')}
              />
              OAuth2 (Outlook/Office365)
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground text-left block">SMTP Host</label>
            <input
              name="host"
              defaultValue={(initialData?.host as string) || 'outlook.office365.com'}
              className="input-standard"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground text-left block">SMTP Port</label>
            <input
              name="port"
              type="number"
              defaultValue={(initialData?.port as number) || 587}
              className="input-standard"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground text-left block">User (Email Address)</label>
          <input
            name="user"
            type="email"
            defaultValue={(initialData?.user as string) || ''}
            className="input-standard"
            required
          />
        </div>

        <div className={authType === 'BASIC' ? 'block' : 'hidden'}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground text-left block">Password</label>
            <input
              name="password"
              type="password"
              defaultValue={(initialData?.password as string) || ''}
              className="input-standard"
              required={authType === 'BASIC'}
            />
          </div>
        </div>

        <div className={authType === 'OAUTH2' ? 'block space-y-4' : 'hidden'}>
          <div className="space-y-4 p-4 border border-blue-500/20 bg-blue-500/5 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-500 flex items-center gap-2">
              Microsoft Graph API Configuration
            </h4>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground text-left block">Tenant ID</label>
              <input
                name="tenant_id"
                defaultValue={(initialData?.tenant_id as string) || ''}
                className="input-standard"
                required={authType === 'OAUTH2'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground text-left block">Client ID</label>
              <input
                name="client_id"
                defaultValue={(initialData?.client_id as string) || ''}
                className="input-standard"
                required={authType === 'OAUTH2'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground text-left block">Client Secret</label>
              <input
                name="client_secret"
                type="password"
                defaultValue={(initialData?.client_secret as string) || ''}
                className="input-standard"
                required={authType === 'OAUTH2'}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
          <TestSmtpDialog
            airlineId={airlineId}
            getFormData={getFormData}
          />

          <button
            type="submit"
            disabled={loading}
            className="flex-1 inline-flex h-11 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          >
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}
