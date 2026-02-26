'use client'

import { useFormStatus } from 'react-dom'
import { login } from './actions'

export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      formAction={login}
      disabled={pending}
      className="flex w-full justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Signing in...' : 'Sign in'}
    </button>
  )
}
