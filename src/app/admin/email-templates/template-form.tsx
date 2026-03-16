
'use client'

import { useState } from 'react'
import { createTemplate, updateTemplate } from '@/app/admin/email-actions'
import { useRouter } from 'next/navigation'
import { Eye, Edit3, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useTransition } from 'react'

interface TemplateFormProps {
  initialData?: Record<string, unknown>
  airlines: { id: string; name: string; code: string }[]
  regions: { id: string; code: string }[]
  currencies: { id: string; code: string }[]
}

export function TemplateForm({ initialData, airlines, regions, currencies }: TemplateFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit')
  const [htmlContent, setHtmlContent] = useState((initialData?.html_content as string) || '')
  const [subject, setSubject] = useState((initialData?.subject as string) || '')
  const isEditing = !!initialData?.id

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const data = {
      type: formData.get('type'),
      airline_id: formData.get('airline_id') || null,
      region_id: formData.get('region_id') || null,
      currency_id: formData.get('currency_id') || null,
      subject: formData.get('subject'),
      html_content: formData.get('html_content'),
      text_content: formData.get('text_content'),
      variable_placeholders: formData.get('placeholders')?.toString().split(',').map(p => p.trim()).filter(Boolean) || []
    }

    startTransition(async () => {
      const result = isEditing
        ? await updateTemplate(initialData.id as string, data)
        : await createTemplate(data)

      if (result.success) {
        toast.success(`Template ${isEditing ? 'updated' : 'created'} successfully`)
        router.refresh()
        if (!isEditing) {
          setTimeout(() => router.push('/admin/email-templates'), 1000)
        }
      } else {
        toast.error('Error: ' + (result.error || 'Unknown error'))
      }
    })
  }

  // Simple placeholder replacement for preview
  const previewHtml = htmlContent.replace(/\{\{(.*?)\}\}/g, (_match: string, key: string) => {
    return `<span style="background: rgba(224, 63, 63, 0.1); color: #e03f3f; padding: 0 4px; border-radius: 2px;">${key.trim()}</span>`
  })

  return (
    <div className="space-y-6 max-w-5xl">

      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('edit')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'edit' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <div className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Editor
          </div>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
        >
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            HTML Preview
          </div>
        </button>
      </div>

      {activeTab === 'edit' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card border border-border p-6 rounded-lg shadow-sm">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Template Type (Identifier)</label>
              <input
                name="type"
                defaultValue={(initialData?.type as string) || ''}
                placeholder="e.g., booking_confirmation"
                className="input-standard"
                required
              />
              <p className="text-xs text-muted-foreground">Unique key used in code to trigger this email.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Airline (Optional Fallback)</label>
              <select
                name="airline_id"
                defaultValue={(initialData?.airline_id as string) || ''}
                className="select-standard"
              >
                <option value="">Global Default</option>
                {airlines.map(a => (
                  <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Region (Optional Fallback)</label>
              <select
                name="region_id"
                defaultValue={(initialData?.region_id as string) || ''}
                className="select-standard"
              >
                <option value="">Global/Any</option>
                {regions.map(r => (
                  <option key={r.id} value={r.id}>{r.code}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Currency (Optional Fallback)</label>
              <select
                name="currency_id"
                defaultValue={(initialData?.currency_id as string) || ''}
                className="select-standard"
              >
                <option value="">Any</option>
                {currencies.map(c => (
                  <option key={c.id} value={c.id}>{c.code}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-card border border-border p-6 rounded-lg shadow-sm space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email Subject</label>
              <input
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Your booking confirmation: {{booking_ref}}"
                className="input-standard"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">HTML Content</label>
              <textarea
                name="html_content"
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                placeholder="<h1>Hello {{name}}</h1>..."
                className="input-standard min-h-[400px] font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Plain Text Content (Optional)</label>
              <textarea
                name="text_content"
                defaultValue={(initialData?.text_content as string) || ''}
                className="input-standard min-h-[100px] font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Variable Placeholders (Comma separated)</label>
              <input
                name="placeholders"
                defaultValue={(initialData?.variable_placeholders as string[])?.join(', ') || ''}
                placeholder="booking_ref, name, airline_name"
                className="input-standard"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/admin/email-templates"
              className="btn-secondary px-8"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary px-8"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Save Template' : 'Create Template'}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="bg-card border border-border p-4 rounded-md">
            <p className="text-sm font-medium text-muted-foreground mb-2">Subject Preview:</p>
            <p className="text-lg font-semibold text-foreground">{subject || '(No subject)'}</p>
          </div>
          <div className="border border-border rounded-lg overflow-hidden bg-white min-h-[600px]">
            <iframe
              srcDoc={previewHtml || '<p style="padding:20px; color:#666;">No content to preview</p>'}
              className="w-full h-[600px] border-none"
              title="Template Preview"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center italic">
            Note: Placeholders are highlighted for visibility in this preview.
          </p>
        </div>
      )}
    </div>
  )
}
