
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Eye, Pencil, Loader2, Hotel, Calendar, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import { updateBookingHotel, type HotelUpdatePayload } from '../actions'

import { type RefData } from './utils'
import { HotelViewFields, HotelEditFields, parseHotelFormData, type HotelService } from './hotel-fields'

interface Props {
  hotel: HotelService
  refData: RefData
  mode: 'view' | 'edit'
}

/* ─── Main Component ─────────────────────────────────────── */

export function HotelDetailDialog({ hotel, refData, mode: initialMode }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()


  function openAs(m: 'view' | 'edit') {
    setMode(m)
    setIsOpen(true)
  }

  function handleClose() {
    setIsOpen(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const payload = parseHotelFormData(new FormData(e.currentTarget))

    startTransition(async () => {
      const result = await updateBookingHotel(hotel.id, payload)
      if (result.success) {
        toast.success('Hotel updated successfully')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.error ?? 'Failed to update hotel')
      }
    })
  }

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <>
      <button className="btn-action h-8 w-8" title="View hotel details" onClick={() => openAs('view')}>
        <Eye className="h-4 w-4" />
      </button>
      <button className="btn-action h-8 w-8" title="Edit hotel" onClick={() => openAs('edit')}>
        <Pencil className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}>
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Hotel className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-lg font-bold text-foreground truncate">
                  {mode === 'view' ? 'Hotel Details' : 'Edit Hotel'}
                </h3>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 bg-secondary/40">
                <button type="button" onClick={() => setMode('view')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${mode === 'view' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
                <button type="button" onClick={() => setMode('edit')} className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${mode === 'edit' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              </div>
              <button onClick={handleClose} className="rounded-full p-1 opacity-60 hover:opacity-100 ml-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 pb-6 flex-1 text-left">
              {mode === 'view' ? (
                <HotelViewFields hotel={hotel} refData={refData} />
              ) : (
                <form id="hotel-edit-form" onSubmit={handleSubmit}>
                  <HotelEditFields hotel={hotel} refData={refData} />
                </form>
              )}
            </div>

            {/* Footer */}
            {mode === 'edit' && (
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
                <button type="button" onClick={handleClose} className="btn-secondary" disabled={isPending}>Cancel</button>
                <button type="submit" form="hotel-edit-form" disabled={isPending} className="btn-primary">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
