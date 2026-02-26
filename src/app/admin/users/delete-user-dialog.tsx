
'use client'

import { useState } from 'react'
import { deleteUser } from './server-actions'
import { Loader2, Trash2 } from 'lucide-react'

// Since we don't have the shadcn Alert Dialog components installed yet,
// I will build a simple custom one using fix-positioned div for now to avoid dependency hell
// and keep it consistent with the CreateUserDialog I made earlier.

export function DeleteUserDialog({ userId, userName }: { userId: string, userName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteUser(userId)
    setIsDeleting(false)
    if (result.success) {
      setIsOpen(false)
    } else {
      alert(result.error) // Fallback for error
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-action-danger"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete User</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{userName}</strong>? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsOpen(false)}
                disabled={isDeleting}
                className="btn-secondary h-9"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="btn-primary h-9 bg-destructive hover:bg-destructive/90 transition-colors"
              >
                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
