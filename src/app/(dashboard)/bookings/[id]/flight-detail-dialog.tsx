
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X, Eye, Pencil, Loader2, Plane } from 'lucide-react'
import { toast } from 'sonner'
import { updateBookingFlight, type FlightUpdatePayload } from '../actions'

/* ─── Types ─────────────────────────────────────────────── */


import {
  type RefData,
  nullify,
  numOrNull,
  intOrNull,
} from './utils'
import { 
  FlightViewFields, 
  FlightEditFields, 
  parseFlightFormData, 
  type FlightService 
} from './flight-fields'

interface Props {
  flight: FlightService
  refData: RefData
  mode: 'view' | 'edit'
}


const CABIN_CLASSES = [
  'Economy',
  'Premium Economy',
  'Business',
  'First',
] as const


/* ─── Main Component ─────────────────────────────────────── */

export function FlightDetailDialog({ flight, refData, mode: initialMode }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode)
  const [isPending, startTransition] = useTransition()

  // States for auto-calculation
  const [adultCount, setAdultCount] = useState(flight.adult_count)
  const [childCount, setChildCount] = useState(flight.child_count)
  const [infantCount, setInfantCount] = useState(flight.infant_count)
  const [pvpPerPax, setPvpPerPax] = useState(flight.pvp_per_pax ?? 0)
  const [priceWithTaxes, setPriceWithTaxes] = useState(flight.price_with_taxes ?? 0)

  const totalPax = adultCount + childCount + infantCount
  const flightTaxesResult = priceWithTaxes - (pvpPerPax * totalPax)

  const router = useRouter()


  function openAs(m: 'view' | 'edit') {
    setAdultCount(flight.adult_count)
    setChildCount(flight.child_count)
    setInfantCount(flight.infant_count)
    setPvpPerPax(flight.pvp_per_pax ?? 0)
    setPriceWithTaxes(flight.price_with_taxes ?? 0)
    setMode(m)
    setIsOpen(true)
  }

  function handleClose() {
    setIsOpen(false)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)

    const payload: FlightUpdatePayload = parseFlightFormData(fd)

    startTransition(async () => {
      const result = await updateBookingFlight(flight.id, payload)
      if (result.success) {
        toast.success('Flight updated successfully')
        setIsOpen(false)
        router.refresh()
      } else {
        toast.error(result.error ?? 'Failed to update flight')
      }
    })
  }

  /* ─── View Mode Content ───────────────────────────────── */
  const viewContent = <FlightViewFields flight={flight} refData={refData} flightName={flight.description} />

  /* ─── Edit Mode Content ───────────────────────────────── */
  const editContent = (
    <form id="flight-edit-form" onSubmit={handleSubmit}>
      <FlightEditFields flight={flight} refData={refData} flightName={flight.description} />
    </form>
  )

  /* ─── Render ─────────────────────────────────────────── */
  return (
    <>
      {/* Trigger buttons */}
      <button
        className="btn-action h-8 w-8"
        title="View flight details"
        onClick={() => openAs('view')}
      >
        <Eye className="h-4 w-4" />
      </button>
      <button
        className="btn-action h-8 w-8"
        title="Edit flight"
        onClick={() => openAs('edit')}
      >
        <Pencil className="h-4 w-4" />
      </button>

      {/* Dialog overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose() }}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Plane className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-lg font-bold text-foreground truncate">
                  {mode === 'view' ? 'Flight Details' : 'Edit Flight'}
                </h3>
                {flight.description && (
                  <p className="text-xs text-muted-foreground truncate">{flight.description}</p>
                )}
              </div>

              {/* Mode toggle */}
              <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 bg-secondary/40">
                <button
                  type="button"
                  onClick={() => setMode('view')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${mode === 'view'
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${mode === 'edit'
                    ? 'bg-card shadow-sm text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              </div>

              <button
                onClick={handleClose}
                className="rounded-full p-1 opacity-60 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ml-1"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 pb-6 flex-1 text-left">
              {mode === 'view' ? viewContent : editContent}
            </div>

            {/* Footer */}
            {mode === 'edit' && (
              <div className="flex justify-end gap-2 px-6 py-4 border-t border-border shrink-0">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-secondary"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="flight-edit-form"
                  disabled={isPending}
                  className="btn-primary"
                >
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
