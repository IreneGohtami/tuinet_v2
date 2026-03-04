'use client'

import { useState, useTransition } from 'react'
import { updateBookingStatus } from '../../reference-data-actions'
import { Edit2, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function EditBookingStatusDialog({ status }: { status: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    const data = {
      code: formData.get('code') as string,
      name: formData.get('name') as string,
    }

    startTransition(async () => {
      const result = await updateBookingStatus(status.id, data)
      if (result.success) {
        setIsOpen(false)
        toast.success('Booking status updated successfully')
      } else {
        toast.error(result.error || 'Failed to update booking status')
      }
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-action"
        title="Edit"
      >
        <Edit2 className="h-4 w-4" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200 text-left">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Edit Booking Status</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-full p-2 hover:bg-secondary transition-colors"
          >
            <X className="h-4 w-4 text-muted-foreground" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="code" className="text-sm font-medium text-foreground">
              Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              defaultValue={status.code}
              required
              className="input-standard"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              defaultValue={status.name}
              required
              className="input-standard"
            />
          </div>

          <div className="flex justify-end pt-4 gap-3">
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
              className="btn-primary h-11 px-6 min-w-[120px]"
            >
              {isPending ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
