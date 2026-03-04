
'use client'

import { useState } from 'react'
import { createCountry } from '../../reference-data-actions'
import { Plus, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTransition } from 'react'

export function CreateCountryDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    const name = formData.get('name') as string
    const iso_alpha2 = formData.get('iso_alpha2') as string || undefined
    const iso_alpha3 = formData.get('iso_alpha3') as string || undefined
    const iso_num = formData.get('iso_num') ? parseInt(formData.get('iso_num') as string) : undefined
    const phone_prefix = formData.get('phone_prefix') as string || undefined

    startTransition(async () => {
      const result = await createCountry({ name, iso_alpha2, iso_alpha3, iso_num, phone_prefix } as any)
      if (result.success) {
        setIsOpen(false)
        toast.success('Country created successfully')
      } else {
        toast.error(result.error || 'Failed to create country')
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
        Add Country
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Add Country</h3>
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
            <label htmlFor="name" className="text-sm font-medium text-foreground">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              placeholder="e.g. Spain"
              className="input-standard"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="iso_alpha2" className="text-sm font-medium text-foreground">ISO Alpha 2</label>
              <input
                id="iso_alpha2"
                name="iso_alpha2"
                type="text"
                maxLength={2}
                placeholder="e.g. ES"
                className="input-standard uppercase"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="iso_alpha3" className="text-sm font-medium text-foreground">ISO Alpha 3</label>
              <input
                id="iso_alpha3"
                name="iso_alpha3"
                type="text"
                maxLength={3}
                placeholder="e.g. ESP"
                className="input-standard uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="iso_num" className="text-sm font-medium text-foreground">ISO Num</label>
              <input
                id="iso_num"
                name="iso_num"
                type="number"
                placeholder="e.g. 724"
                className="input-standard"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone_prefix" className="text-sm font-medium text-foreground">Phone Prefix</label>
              <input
                id="phone_prefix"
                name="phone_prefix"
                type="text"
                placeholder="e.g. +34"
                className="input-standard"
              />
            </div>
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
