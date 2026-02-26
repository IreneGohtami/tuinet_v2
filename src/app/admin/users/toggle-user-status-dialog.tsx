
'use client'

import { useState } from 'react'
import { toggleUserStatus } from './server-actions'
import { UserCheck, UserX, Loader2 } from 'lucide-react'

type ToggleUserStatusDialogProps = {
  userId: string
  isBanned: boolean
  userName: string
}

export function ToggleUserStatusDialog({ userId, isBanned, userName }: ToggleUserStatusDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleToggle = async () => {
    setIsLoading(true)
    setMessage(null)
    const result = await toggleUserStatus(userId, !isBanned)
    setIsLoading(false)

    if (result.success) {
      setMessage({ type: 'success', text: `User ${isBanned ? 'enabled' : 'disabled'} successfully.` })
      setTimeout(() => {
        setIsOpen(false)
        setMessage(null)
      }, 1500)
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update status.' })
    }
  }

  const action = isBanned ? 'Enable' : 'Disable'
  const ActionIcon = isBanned ? UserCheck : UserX

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-action"
        title={`${action} User`}
      >
        <ActionIcon className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
            <h3 className="text-lg font-semibold text-foreground mb-2">{action} User</h3>
            {isBanned ? (
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to enable <strong>{userName}</strong>?
                <br />
                The user will be able to sign in again immediately.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to disable <strong>{userName}</strong>?
                <br />
                The user will be signed out and unable to access the system.
              </p>
            )}

            {message && (
              <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {message.text}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
                className="btn-secondary h-9"
              >
                Cancel
              </button>
              <button
                onClick={handleToggle}
                disabled={isLoading}
                className={`btn-primary h-9 text-white
                  ${isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {action} User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
