
'use client'

import { useState } from 'react'
import { createUser } from './server-actions'
import { X, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTransition } from 'react'

export function CreateUserDialog({ roles }: { roles: { id: string; name: string }[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await createUser(formData)
      if (result.success) {
        setIsOpen(false)
        toast.success('User created successfully')
      } else {
        toast.error(result.error || 'Failed to create user')
      }
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-primary"
      >
        <Plus className="h-4 w-4" />
        Create User
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Create New User</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="input-standard"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              className="input-standard"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              required
              className="input-standard"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium text-foreground">Role</label>
            <select
              id="role"
              name="role"
              defaultValue={roles.find(r => r.name === 'user')?.name || roles[0]?.name}
              className="input-standard"
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
              className="btn-secondary h-11 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn-primary h-11 px-6"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
