
'use client'

import { useState } from 'react'
import { X, Loader2, Send } from 'lucide-react'
import { testSMTPSettings } from '@/app/admin/email-actions'

interface TestSmtpDialogProps {
  airlineId: string
  getFormData: () => Record<string, unknown>
}

export function TestSmtpDialog({ airlineId, getFormData }: TestSmtpDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [recipient, setRecipient] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  async function handleSend() {
    if (!recipient) return
    setLoading(true)
    setStatus(null)

    const formData = getFormData()
    const result = await testSMTPSettings(airlineId, formData, recipient)

    setLoading(false)
    if (result.success) {
      setStatus({ type: 'success', message: 'Test email sent successfully! Please check ' + recipient })
    } else {
      setStatus({ type: 'error', message: 'Test failed: ' + result.error })
    }
  }

  const handleOpenDialog = () => {
    setIsOpen(true)
    setStatus(null) // Reset status when opening
    setRecipient('') // Clear recipient when opening
  }

  return (
    <>
      <button
        type="button"
        onClick={handleOpenDialog}
        className="flex-1 inline-flex h-11 items-center justify-center rounded-md border border-input bg-background px-8 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      >
        <Send className="mr-2 h-4 w-4" />
        Test Connection
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Send Test Email</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-left">
              {status && (
                <div className={`p-3 rounded-md text-xs border ${status.type === 'success'
                  ? 'bg-green-500/10 text-green-500 border-green-500/20'
                  : 'bg-red-500/10 text-red-500 border-red-500/20'
                  }`}>
                  {status.message}
                </div>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground text-left block">Recipient Email</label>
                <input
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="name@example.com"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  autoFocus
                />
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleSend}
                  disabled={loading || !recipient}
                  className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Send Test Email
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
