
'use client'

import { useState } from 'react'
import { createRegion } from '../../reference-data-actions'
import { Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTransition } from 'react'

export function CreateRegionDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {

    const code = formData.get('code') as string

    startTransition(async () => {
      const result = await createRegion({ code })
      if (result.success) {
        setIsOpen(false)
        toast.success('Region created successfully')
      } else {
        toast.error(result.error || 'Failed to create region')
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
        Add Region
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Add Region</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium text-foreground">Code</label>
            <input
              id="code"
              name="code"
              type="text"
              required
              placeholder="e.g. GLOBAL, EEA, UK, US"
              className="input-standard"
            />
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
              disabled={isPending}
              className="btn-primary"
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
