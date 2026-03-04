
'use client'

import { useState } from 'react'
import { deleteCountry } from '../../reference-data-actions'
import { Trash2, X, AlertTriangle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTransition } from 'react'

export function DeleteCountryDialog({ country }: { country: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleDelete() {
    startTransition(async () => {
      const result = await deleteCountry(country.id)
      if (result.success) {
        setIsOpen(false)
        toast.success('Country deleted successfully')
      } else {
        toast.error(result.error || 'Failed to delete country')
      }
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-action text-destructive hover:bg-destructive/10"
        title="Delete Country"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <h3 className="text-xl font-semibold">Delete Country</h3>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <div className="space-y-4">
          <p className="text-muted-foreground">
            Are you sure you want to delete <span className="font-semibold text-foreground">{country.name}</span>?
            This action cannot be undone and may affect related data.
          </p>

          <div className="flex justify-end pt-2 gap-2">
            <button
              onClick={() => setIsOpen(false)}
              className="btn-secondary"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="btn-primary bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Country
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
