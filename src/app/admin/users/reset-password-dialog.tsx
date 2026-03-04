
'use client'

import { useState } from 'react'
import { resetPassword } from './server-actions'
import { LockKeyhole, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useTransition } from 'react'

export function ResetPasswordDialog({ userId, email }: { userId: string, email: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleReset = async () => {
    startTransition(async () => {
      const result = await resetPassword(userId, email)
      if (result.success) {
        setIsOpen(false)
        toast.success(`Password reset email sent to ${email}`)
      } else {
        toast.error(result.error || 'Failed to send reset email')
      }
    })
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-action"
        title="Reset Password"
      >
        <LockKeyhole className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Reset Password</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="space-y-4 mb-8">
              <p className="text-muted-foreground">
                Send a password reset email to <span className="font-bold text-foreground">{email}</span>?
              </p>
              <p className="text-sm text-blue-500 font-medium p-3 bg-blue-500/5 rounded-lg">
                The user will receive a link to set a new password.
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isPending}
                className="btn-secondary h-11 px-4"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                disabled={isPending}
                className="btn-primary h-11 px-6 min-w-[140px]"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
