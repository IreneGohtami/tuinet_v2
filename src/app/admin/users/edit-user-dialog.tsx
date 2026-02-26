
'use client'

import { useState } from 'react'
import { updateUser } from './server-actions'
import { Loader2, Pencil, X } from 'lucide-react'

type EditUserDialogProps = {
  user: {
    id: string
    full_name: string
    email: string
    role: string
  },
  roles: { id: string; name: string }[]
}

export function EditUserDialog({ user, roles }: EditUserDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    // server action expects (userId, formData)
    const result = await updateUser(user.id, formData)

    setIsLoading(false)
    if (result.success) {
      setMessage({ type: 'success', text: 'User updated successfully' })
      setTimeout(() => {
        setIsOpen(false)
        setMessage(null)
      }, 1500)
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update user' })
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-action"
        title="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-foreground">Edit User</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <input
                  type="text"
                  disabled
                  value={user.email}
                  className="flex h-10 w-full rounded-md border border-input bg-secondary px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  defaultValue={user.full_name}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-foreground">Role</label>
                <select
                  id="role"
                  name="role"
                  defaultValue={user.role}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name.replace(/_/g, ' ').replace(/\b\w/g, s => s.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
