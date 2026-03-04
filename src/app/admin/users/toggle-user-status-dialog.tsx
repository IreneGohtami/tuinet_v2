
'use client'

import { useState } from 'react'
import { toggleUserStatus } from './server-actions'
import { UserCheck, UserX, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { useTransition } from 'react'

type ToggleUserStatusDialogProps = {
  userId: string
  isBanned: boolean
  userName: string
}

export function ToggleUserStatusDialog({ userId, isBanned, userName }: ToggleUserStatusDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const handleToggle = async () => {
    startTransition(async () => {
      const result = await toggleUserStatus(userId, !isBanned)
      if (result.success) {
        setIsOpen(false)
        toast.success(`User ${isBanned ? 'enabled' : 'disabled'} successfully`)
      } else {
        toast.error(result.error || 'Failed to update user status')
      }
    })
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
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">{action} User</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <div className="space-y-4 mb-8">
              {isBanned ? (
                <p className="text-muted-foreground">
                  Are you sure you want to enable <span className="font-bold text-foreground">{userName}</span>?
                  <br />
                  The user will be able to sign in again immediately.
                </p>
              ) : (
                <p className="text-muted-foreground">
                  Are you sure you want to disable <span className="font-bold text-foreground">{userName}</span>?
                  <br />
                  The user will be signed out and unable to access the system.
                </p>
              )}
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
                onClick={handleToggle}
                disabled={isPending}
                className={`flex items-center justify-center font-semibold px-6 h-11 min-w-[140px] rounded-lg transition-all text-white
                  ${isBanned ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'}`}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {action} User
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
