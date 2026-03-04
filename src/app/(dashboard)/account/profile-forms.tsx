
'use client'

import { useState } from 'react'
import { updateProfile, changePassword, signOutAllSessionsAction } from './actions'
import { Loader2 } from 'lucide-react'

export function ProfileForm({
  initialFullName,
  userEmail
}: {
  initialFullName: string | null,
  userEmail: string
}) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    const result = await updateProfile(new FormData(e.currentTarget))
    setIsLoading(false)

    if (result.success) {
      setMessage({ type: 'success', text: 'Profile updated successfully' })
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-medium text-foreground">Profile Information</h3>

      {message && (
        <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium text-muted-foreground">Email</label>
        <div className="flex h-10 w-full items-center rounded-md border border-input bg-secondary px-3 text-sm text-muted-foreground">
          {userEmail}
        </div>
        <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="fullName" className="text-sm font-medium text-foreground">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          defaultValue={initialFullName || ''}
          type="text"
          className="input-standard"
        />
      </div>

      <div className="flex justify-end">
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
  )
}

export function SecurityForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)
    const result = await changePassword(new FormData(e.currentTarget))
    setIsLoading(false)

    if (result.success) {
      setMessage({ type: 'success', text: 'Password changed successfully' })
      // Optional: clearer form
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to change password' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-medium text-foreground">Security</h3>

      {message && (
        <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">New Password</label>
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
        <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">Confirm New Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={6}
          className="input-standard"
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Change Password
        </button>
      </div>
    </form>
  )
}

export function DangerZone() {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  async function handleSignOutAll() {
    setIsLoading(true)
    setMessage(null)
    setShowConfirm(false)

    try {
      const result = await signOutAllSessionsAction()

      if (result.success) {
        setMessage({ type: 'success', text: 'Successfully signed out of all sessions' })
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to sign out' })
      }
    } catch (_error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4 rounded-lg border border-destructive/20 bg-destructive/5 p-6">
      <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>

      {message && (
        <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="flex flex-col space-y-2">
        <p className="text-sm text-muted-foreground">
          Logging out of all sessions will terminate all active login sessions across all your devices.
        </p>

        <div className="flex justify-start">
          {!showConfirm ? (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              disabled={isLoading}
              className="inline-flex h-10 items-center justify-center rounded-md border border-destructive bg-transparent px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive disabled:pointer-events-none disabled:opacity-50"
            >
              Sign out of all sessions
            </button>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
              <span className="text-sm font-medium text-destructive">Are you sure?</span>
              <button
                onClick={handleSignOutAll}
                disabled={isLoading}
                className="btn-primary h-8 px-3 text-xs bg-destructive hover:bg-destructive/90 transition-colors"
              >
                {isLoading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : null}
                Yes, Sign out
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isLoading}
                className="btn-secondary h-8 px-3 text-xs"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
