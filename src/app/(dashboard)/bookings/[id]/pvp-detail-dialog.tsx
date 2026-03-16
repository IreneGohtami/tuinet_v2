'use client'

import { useState, useTransition, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Eye, Pencil, Loader2, Tag } from 'lucide-react'
import { toast } from 'sonner'
import { updatePvpDetailWithComponents, type PvpDetailUpdatePayload, type ComponentUpdatePayload } from '../actions'
import { type RefData, numOrNull, formatDate } from './utils'
import { HotelViewFields, HotelEditFields, parseHotelFormData } from './hotel-fields'
import { FlightViewFields, FlightEditFields, parseFlightFormData } from './flight-fields'
import { OtherServiceViewFields, OtherServiceEditFields, parseOtherServiceFormData } from './other-services-fields'

/* ─── Types ─────────────────────────────────────────────── */

export interface PvpDetail {
  id: number
  name?: string
  component?: string
  direction?: string
  passenger_count?: number
  pvp_per_pax?: number
  tax_type?: string
  tax_rate?: string
  tax_amount?: number
  net_commissionable?: string
  is_invoiced?: boolean
}

interface Props {
  pvpDetail: PvpDetail
  relatedComponent: any | any[] | null // Support multiple components (e.g. Flight legs)
  refData: RefData
  mode: 'view' | 'edit'
}

/* ─── Sub-components ─────────────────────────────────────── */

export function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 text-left">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground break-words">
        {(value !== null && value !== undefined && value !== '' && value !== 0) ? value : <span className="text-muted-foreground italic">—</span>}
      </span>
    </div>
  )
}

export function SectionTitle({ title }: { title: string }) {
  return (
    <div className="col-span-2 mt-4 mb-1 border-b border-border/60 pb-1 text-left">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
    </div>
  )
}

export function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground block text-left">
      {children}
    </label>
  )
}

export function PvpDetailDialog({ pvpDetail, relatedComponent, refData, mode: initialMode }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [mode, setMode] = useState<'view' | 'edit'>(initialMode)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState<Partial<PvpDetail>>({})

  // Component updates state (internal state for the dialog) - now for single component
  const [componentPvp, setComponentPvp] = useState<number | null>(null)
  const [originalPvp, setOriginalPvp] = useState<number>(0)

  // Initialize state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: pvpDetail.name,
        component: pvpDetail.component,
        direction: pvpDetail.direction,
        passenger_count: pvpDetail.passenger_count,
        pvp_per_pax: pvpDetail.pvp_per_pax,
        tax_type: pvpDetail.tax_type,
        tax_rate: pvpDetail.tax_rate,
        tax_amount: pvpDetail.tax_amount,
        net_commissionable: pvpDetail.net_commissionable,
        is_invoiced: pvpDetail.is_invoiced
      })

      // Initialize related component(s)
      if (Array.isArray(relatedComponent)) {
        // For multiple components, we take the PVP from the first one as they should be synced
        setComponentPvp(relatedComponent[0]?.pvp_per_pax || 0)
        setOriginalPvp(relatedComponent[0]?.pvp_per_pax || 0)
      } else if (relatedComponent) {
        setComponentPvp(relatedComponent.pvp_per_pax || 0)
        setOriginalPvp(relatedComponent.pvp_per_pax || 0)
      } else {
        setComponentPvp(null)
        setOriginalPvp(0)
      }
    }
  }, [isOpen, initialMode, pvpDetail, relatedComponent])

  const openDialog = (m: 'view' | 'edit') => {
    setMode(m)
    setIsOpen(true)
  }
  const closeDialog = () => setIsOpen(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value

    setFormData(prev => ({ ...prev, [name]: val }))

    // Cascade PVP change to related component if changing main PVP
    if (name === 'pvp_per_pax' && originalPvp !== 0) {
      const newPvp = numOrNull(value)
      if (newPvp !== null) {
        setComponentPvp(newPvp)
      }
    }
  }

  const handleSave = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault()

    const formEl = e?.currentTarget

    startTransition(async () => {
      const payload: PvpDetailUpdatePayload = {
        name: formData.name,
        component: formData.component,
        direction: formData.direction,
        passenger_count: numOrNull(formData.passenger_count?.toString() || ''),
        pvp_per_pax: numOrNull(formData.pvp_per_pax?.toString() || ''),
        tax_type: formData.tax_type,
        tax_rate: formData.tax_rate,
        tax_amount: numOrNull(formData.tax_amount?.toString() || ''),
        net_commissionable: formData.net_commissionable,
        is_invoiced: formData.is_invoiced
      }

      let compsToUpdate: ComponentUpdatePayload[] = []

      // Link correct component fields
      if (relatedComponent) {
        if (pvpDetail.component === 'Hotel' && formEl) {
          const fullFormData = new FormData(formEl)
          const prefix = `hotel_${relatedComponent.id}_`
          const parsedHotelFields = parseHotelFormData(fullFormData, prefix)

          compsToUpdate = [{
            id: relatedComponent.id,
            type: 'Hotel',
            fields: {
              ...parsedHotelFields,
              pvp_per_pax: payload.pvp_per_pax, // Sync PVP per Pax from top level
              net_commissionable: payload.net_commissionable, // Sync Net Comm from top level
            }
          }]
        } else if (pvpDetail.component === 'Flight' && formEl && Array.isArray(relatedComponent)) {
          const fullFormData = new FormData(formEl)

          compsToUpdate = relatedComponent.map(comp => {
            const prefix = `flight_${comp.id}_`
            const parsedFlightFields = parseFlightFormData(fullFormData, prefix)
            return {
              id: comp.id,
              type: 'Flight',
              fields: {
                ...parsedFlightFields,
                pvp_per_pax: payload.pvp_per_pax, // Sync PVP per Pax from top level
                net_commissionable: payload.net_commissionable, // Sync Net Comm from top level
              }
            }
          })
        } else if (pvpDetail.component === 'Others' && formEl) {
          const fullFormData = new FormData(formEl)
          const prefix = `other_service_${relatedComponent.id}_`
          const parsedOtherServiceFields = parseOtherServiceFormData(fullFormData, prefix)

          compsToUpdate = [{
            id: relatedComponent.id,
            type: 'Others',
            fields: {
              ...parsedOtherServiceFields,
              description: payload.name, // Sync description from PVP name
              pvp_per_pax: payload.pvp_per_pax, // Sync PVP per Pax from top level
              net_commissionable: payload.net_commissionable, // Sync Net Comm from top level
            }
          }]
        } else if (['Tour', 'Transfer'].includes(pvpDetail.component || '')) {
          compsToUpdate = [{
            id: relatedComponent.id,
            type: pvpDetail.component || '',
            fields: {
              pvp_per_pax: payload.pvp_per_pax,
              net_commissionable: payload.net_commissionable,
            }
          }]
        }
      }

      const result = await updatePvpDetailWithComponents(pvpDetail.id, payload, compsToUpdate)

      if (result.success) {
        toast.success(`PVP Detail updated successfully`)
        router.refresh()
      } else {
        toast.error(`Failed to update: ${result.error}`)
      }
    })
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <button className="btn-action h-8 w-8" title="View details" onClick={() => openDialog('view')}>
          <Eye className="h-4 w-4" />
        </button>
        <button className="btn-action h-8 w-8" title="Edit details" onClick={() => openDialog('edit')}>
          <Pencil className="h-4 w-4" />
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-border shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Tag className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <h3 className="text-lg font-bold text-foreground truncate">
                  {mode === 'view' ? 'PVP Details' : 'Edit PVP Detail'}
                </h3>
                {pvpDetail.name && (
                  <p className="text-xs text-muted-foreground truncate">{pvpDetail.name}</p>
                )}
              </div>

              {/* Mode toggle */}
              <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 bg-secondary/40">
                <button
                  type="button"
                  onClick={() => setMode('view')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${mode === 'view' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Eye className="h-3.5 w-3.5" /> View
                </button>
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${mode === 'edit' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              </div>

              <button onClick={closeDialog} className="rounded-full p-1 opacity-60 hover:opacity-100 ml-1">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto px-6 pb-6 flex-1 text-left">
              {mode === 'view' ? (
                <>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <SectionTitle title="General Information" />
                    <InfoRow label="Name" value={formData.name} />
                    <InfoRow label="Component" value={formData.component} />
                    <InfoRow label="Direction" value={formData.direction} />
                    <InfoRow label="Pax Count" value={formData.passenger_count} />

                    <SectionTitle title="Pricing & Taxes" />
                    <InfoRow label="PVP per Pax" value={formData.pvp_per_pax} />
                    <InfoRow label="Net Comm." value={formData.net_commissionable} />
                    <InfoRow label="Tax Type" value={formData.tax_type} />
                    <InfoRow label="Tax Rate" value={formData.tax_rate} />
                    <InfoRow label="Tax Amount" value={formData.tax_amount} />

                    <SectionTitle title="Status" />
                    <InfoRow label="Invoiced" value={formData.is_invoiced ? 'Yes' : 'No'} />
                  </div>

                  {/* Related Component Section (View mode) */}
                  {['Flight', 'Hotel', 'Tour', 'Transfer', 'Others'].includes(formData.component || '') && relatedComponent && (
                    <div className="mt-8 space-y-4">
                      <SectionTitle title={`${formData.component} Information`} />
                      {formData.component === 'Hotel' ? (
                        <div className="p-5 rounded-2xl border border-border bg-secondary/10 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                          <HotelViewFields hotel={relatedComponent} refData={refData} ShowSectionTitles={false} hotelName={formData.name} />
                        </div>
                      ) : formData.component === 'Flight' && Array.isArray(relatedComponent) ? (
                        <div className="space-y-4">
                          {relatedComponent.map((comp, idx) => (
                            <div key={comp.id} className="p-5 rounded-2xl border border-border bg-secondary/10 relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-primary/60">Leg {idx + 1}</div>
                              <FlightViewFields flight={comp} refData={refData} ShowSectionTitles={false} flightName={idx === 0 ? formData.name : `Leg ${idx + 1}`} />
                            </div>
                          ))}
                        </div>
                      ) : formData.component === 'Others' ? (
                        <div className="p-5 rounded-2xl border border-border bg-secondary/10 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                          <OtherServiceViewFields otherService={relatedComponent} refData={refData} ShowSectionTitles={false} serviceName={formData.name} />
                        </div>
                      ) : (
                        <div className="rounded-xl border border-border overflow-hidden">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-secondary/30">
                              <tr>
                                <th className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">Details</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border w-32">Cost/Pax</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border w-32">PVP/Pax</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card">
                              <tr className="hover:bg-secondary/5 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-foreground">{relatedComponent.description || relatedComponent.pnr_code || relatedComponent.name || `ID: ${relatedComponent.id}`}</div>
                                  <div className="text-[11px] text-muted-foreground flex gap-2">
                                    {relatedComponent.cabin_class && <span>{relatedComponent.cabin_class}</span>}
                                    {relatedComponent.tour_date && <span>{formatDate(relatedComponent.tour_date)}</span>}
                                    {relatedComponent.pickup_location && <span>{relatedComponent.pickup_location}</span>}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground font-medium">
                                  {relatedComponent.cost_per_pax?.toLocaleString() || '-'}
                                </td>
                                <td className="px-4 py-3">
                                  <span className="font-bold text-primary">{relatedComponent.pvp_per_pax?.toLocaleString() || '-'}</span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <form id="pvp-edit-form" onSubmit={handleSave} className="space-y-8">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <SectionTitle title="General Information" />
                    <div className="col-span-2 space-y-1">
                      <FieldLabel htmlFor="name">Name</FieldLabel>
                      <input id="name" name="name" type="text" value={formData.name || ''} onChange={handleChange} className="input-standard" />
                    </div>
                    <div className="space-y-1">
                      <FieldLabel htmlFor="component">Component</FieldLabel>
                      <input id="component" name="component" type="text" value={formData.component || ''} className="input-standard bg-muted/30 border-b border-border/60" readOnly />
                    </div>
                    <div className="space-y-1">
                      <FieldLabel htmlFor="direction">Direction</FieldLabel>
                      <select id="direction" name="direction" value={formData.direction || ''} onChange={handleChange} className="select-standard">
                        <option value="">— Select Direction —</option>
                        <option value="Outbound">Outbound</option>
                        <option value="Inbound">Inbound</option>
                        <option value="Domestic">Domestic</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <FieldLabel htmlFor="passenger_count">Pax Count</FieldLabel>
                      <input id="passenger_count" name="passenger_count" type="number" value={formData.passenger_count || ''} onChange={handleChange} className="input-standard" />
                    </div>

                    <SectionTitle title="Pricing & Taxes" />
                    <div className="space-y-1">
                      <FieldLabel htmlFor="pvp_per_pax">PVP per Pax</FieldLabel>
                      <input id="pvp_per_pax" name="pvp_per_pax" type="number" step="0.01" value={formData.pvp_per_pax || ''} onChange={handleChange} className="input-standard" />
                    </div>
                    <div className="space-y-1">
                      <FieldLabel htmlFor="net_commissionable">Net Commissionable</FieldLabel>
                      <select id="net_commissionable" name="net_commissionable" value={formData.net_commissionable || ''} onChange={handleChange} className="select-standard">
                        <option value="" disabled>— Select Status —</option>
                        <option value="Net">Net</option>
                        <option value="Commissionable">Commissionable</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <FieldLabel htmlFor="tax_type">Tax Type</FieldLabel>
                      <input id="tax_type" name="tax_type" type="text" value={formData.tax_type || ''} onChange={handleChange} className="input-standard" />
                    </div>
                    <div className="space-y-1">
                      <FieldLabel htmlFor="tax_rate">Tax Rate</FieldLabel>
                      <input id="tax_rate" name="tax_rate" type="text" value={formData.tax_rate || ''} onChange={handleChange} className="input-standard" />
                    </div>
                    <div className="space-y-1">
                      <FieldLabel htmlFor="tax_amount">Tax Amount</FieldLabel>
                      <input id="tax_amount" name="tax_amount" type="number" step="0.01" value={formData.tax_amount || ''} onChange={handleChange} className="input-standard" />
                    </div>

                    <SectionTitle title="Status" />
                    <div className="flex items-center gap-2 mt-2">
                      <input id="is_invoiced" name="is_invoiced" type="checkbox" checked={formData.is_invoiced || false} onChange={handleChange} className="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
                      <FieldLabel htmlFor="is_invoiced">Is Invoiced</FieldLabel>
                    </div>
                  </div>

                  {/* Related Component Section (Edit mode) */}
                  {['Flight', 'Hotel', 'Tour', 'Transfer', 'Others'].includes(formData.component || '') && relatedComponent && (
                    <div className="space-y-4">
                      <SectionTitle title={`${formData.component} Information`} />
                      {formData.component === 'Hotel' ? (
                        <div className="p-5 rounded-2xl border border-border bg-secondary/10 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                          <HotelEditFields
                            hotel={relatedComponent}
                            refData={refData}
                            prefix={`hotel_${relatedComponent.id}_`}
                            ShowSectionTitles={false}
                            hotelName={formData.name}
                            pvpPerPaxOverride={
                              <div className="input-standard bg-muted/30 border-b border-border/60">
                                {formData.pvp_per_pax || '-'}
                              </div>
                            }
                          />
                        </div>
                      ) : formData.component === 'Flight' && Array.isArray(relatedComponent) ? (
                        <div className="space-y-4">
                          {relatedComponent.map((comp, idx) => (
                            <div key={comp.id} className="p-5 rounded-2xl border border-border bg-secondary/10 relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                              <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-primary/60">Leg {idx + 1}</div>
                              <FlightEditFields
                                flight={comp}
                                refData={refData}
                                prefix={`flight_${comp.id}_`}
                                ShowSectionTitles={false}
                                flightName={idx === 0 ? formData.name : `Leg ${idx + 1}`}
                                pvpPerPaxOverride={
                                  <div className="input-standard bg-muted/30 border-b border-border/60">
                                    {formData.pvp_per_pax || '-'}
                                  </div>
                                }
                              />
                            </div>
                          ))}
                        </div>
                      ) : formData.component === 'Others' ? (
                        <div className="p-5 rounded-2xl border border-border bg-secondary/10 relative overflow-hidden group">
                          <div className="absolute top-0 left-0 w-1 h-full bg-primary/40 group-hover:bg-primary transition-colors" />
                          <OtherServiceEditFields
                            otherService={relatedComponent}
                            refData={refData}
                            prefix={`other_service_${relatedComponent.id}_`}
                            ShowSectionTitles={false}
                            serviceName={formData.name}
                            pvpPerPaxOverride={
                              <div className="input-standard bg-muted/30 border-b border-border/60">
                                {formData.pvp_per_pax || '-'}
                              </div>
                            }
                          />
                        </div>
                      ) : (
                        <div className="rounded-xl border border-border overflow-hidden">
                          <table className="w-full text-sm text-left border-collapse">
                            <thead className="bg-secondary/30">
                              <tr>
                                <th className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border">Details</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border w-32">Cost/Pax</th>
                                <th className="px-4 py-3 font-semibold text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border w-32">PVP/Pax</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-card">
                              <tr className="hover:bg-secondary/5 transition-colors">
                                <td className="px-4 py-3">
                                  <div className="font-semibold text-foreground">{relatedComponent.description || relatedComponent.pnr_code || relatedComponent.name || `ID: ${relatedComponent.id}`}</div>
                                  <div className="text-[11px] text-muted-foreground flex gap-2">
                                    {relatedComponent.cabin_class && <span>{relatedComponent.cabin_class}</span>}
                                    {relatedComponent.tour_date && <span>{formatDate(relatedComponent.tour_date)}</span>}
                                    {relatedComponent.pickup_location && <span>{relatedComponent.pickup_location}</span>}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-muted-foreground font-medium">
                                  {relatedComponent.cost_per_pax?.toLocaleString() || '-'}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="input-standard py-1 px-2 h-8 text-xs font-bold text-primary bg-muted/30 flex items-center">
                                    {formData.pvp_per_pax || '-'}
                                  </div>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-border shrink-0 bg-secondary/30">
              <button type="button" onClick={closeDialog} className="btn-secondary" disabled={isPending}>
                {mode === 'edit' ? 'Cancel' : 'Close'}
              </button>
              {mode === 'edit' && (
                <button type="submit" form="pvp-edit-form" disabled={isPending} className="btn-primary min-w-[120px]">
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Changes'}
                </button>
              )}
            </div>
          </div>
        </div >
      )
      }
    </>
  )
}
