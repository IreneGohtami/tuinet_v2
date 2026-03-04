
'use client'

import { useState } from 'react'
import { updateCountry } from '../../reference-data-actions'
import { Edit2, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useTransition } from 'react'

export function EditCountryDialog({ country }: { country: any }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(formData: FormData) {
    const name = formData.get('name') as string
    const iso_alpha2 = formData.get('iso_alpha2') as string || undefined
    const iso_alpha3 = formData.get('iso_alpha3') as string || undefined
    const iso_num = formData.get('iso_num') ? parseInt(formData.get('iso_num') as string) : undefined
    const phone_prefix = formData.get('phone_prefix') as string || undefined

    startTransition(async () => {
      const result = await updateCountry(country.id, {
        name,
        iso_alpha2,
        iso_alpha3,
        iso_num,
        phone_prefix
      })
      if (result.success) {
        setIsOpen(false)
        toast.success('Country updated successfully')
      } else {
        toast.error(result.error || 'Failed to update country')
      }
    })
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="btn-action"
        title="Edit Country"
      >
        <Edit2 className="h-4 w-4" />
      </button>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-left">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-foreground">Edit Country</h3>
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
              defaultValue={country.name}
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
                defaultValue={country.iso_alpha2 || ''}
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
                defaultValue={country.iso_alpha3 || ''}
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
                defaultValue={country.iso_num || ''}
                className="input-standard"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="phone_prefix" className="text-sm font-medium text-foreground">Phone Prefix</label>
              <input
                id="phone_prefix"
                name="phone_prefix"
                type="text"
                defaultValue={country.phone_prefix || ''}
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
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
