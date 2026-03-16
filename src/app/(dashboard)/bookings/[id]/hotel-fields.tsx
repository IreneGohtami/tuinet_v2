import { useState } from 'react'
import { type RefData, getCurrencyCode, getCountryName, getStatusName, getSupplierLabel, formatDate } from './utils'
import { type HotelUpdatePayload } from '../actions'
import { nullify, intOrNull, numOrNull } from './utils'
import { DatePicker } from '@/components/ui/date-picker'

export function parseHotelFormData(fd: FormData, prefix: string = ''): HotelUpdatePayload {
  return {
    description: nullify(fd.get(`${prefix}description`) as string),
    check_in_date: nullify(fd.get(`${prefix}check_in_date`) as string),
    check_out_date: nullify(fd.get(`${prefix}check_out_date`) as string),
    item_status_id: intOrNull(fd.get(`${prefix}item_status_id`) as string),
    hotel_contract_id: intOrNull(fd.get(`${prefix}hotel_contract_id`) as string),
    hotel_feature_id: intOrNull(fd.get(`${prefix}hotel_feature_id`) as string),
    board_basis_id: intOrNull(fd.get(`${prefix}board_basis_id`) as string),
    adult_count: intOrNull(fd.get(`${prefix}adult_count`) as string),
    child_count: intOrNull(fd.get(`${prefix}child_count`) as string),
    infant_count: intOrNull(fd.get(`${prefix}infant_count`) as string),
    room_count: intOrNull(fd.get(`${prefix}room_count`) as string),
    destination_id: intOrNull(fd.get(`${prefix}destination_id`) as string),
    supplier_id: intOrNull(fd.get(`${prefix}supplier_id`) as string),
    source: nullify(fd.get(`${prefix}source`) as string),
    cost_per_pax: numOrNull(fd.get(`${prefix}cost_per_pax`) as string),
    pvp_per_pax: numOrNull(fd.get(`${prefix}pvp_per_pax`) as string),
    cost_currency_id: intOrNull(fd.get(`${prefix}cost_currency_id`) as string),
    cost_currency_exchange_rate: numOrNull(fd.get(`${prefix}cost_currency_exchange_rate`) as string),
    settlement_currency_id: intOrNull(fd.get(`${prefix}settlement_currency_id`) as string),
    settlement_currency_exchange_rate: numOrNull(fd.get(`${prefix}settlement_currency_exchange_rate`) as string),
    net_commissionable: nullify(fd.get(`${prefix}net_commissionable`) as string),
    confirmation_ref: nullify(fd.get(`${prefix}confirmation_ref`) as string),
    supplier_locator: nullify(fd.get(`${prefix}supplier_locator`) as string),
    additional_locator: nullify(fd.get(`${prefix}additional_locator`) as string),
    in_voucher: fd.get(`${prefix}in_voucher`) === 'on',
  }
}


/* ─── Shared Hotel Types ───────────────────────────────── */

export interface HotelService {
  id: number
  description?: string | null
  check_in_date?: string | null
  check_out_date?: string | null
  item_status_id?: number | null
  hotel_contract_id?: number | null
  hotel_feature_id?: number | null
  board_basis_id?: number | null
  adult_count: number
  child_count: number
  infant_count: number
  room_count: number
  destination_id?: number | null
  supplier_id?: number | null
  source?: string | null
  cost_per_pax?: number | null
  pvp_per_pax?: number | null
  cost_currency_id?: number | null
  cost_currency_exchange_rate?: number | null
  settlement_currency_id?: number | null
  settlement_currency_exchange_rate?: number | null
  net_commissionable?: string | null
  confirmation_ref?: string | null
  supplier_locator?: string | null
  additional_locator?: string | null
  in_voucher?: boolean | null
}

/* ─── Components ─────────────────────────────────────────── */

export function HotelViewFields({ hotel, refData, ShowSectionTitles = true, hotelName }: { hotel: HotelService, refData: RefData, ShowSectionTitles?: boolean, hotelName?: string | null }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {ShowSectionTitles && <SectionTitle title="Hotel Information" />}
      <InfoRow label="Hotel Name" value={hotelName || hotel.description} />
      <InfoRow label="Status" value={getStatusName(refData, hotel.item_status_id)} />
      <InfoRow label="Check-in" value={formatDate(hotel.check_in_date)} />
      <InfoRow label="Check-out" value={formatDate(hotel.check_out_date)} />
      <InfoRow label="Destination" value={getCountryName(refData, hotel.destination_id)} />
      <InfoRow label="Reference" value={hotel.confirmation_ref} />
      <InfoRow label="Remarks" value={hotel.description} />
      <InfoRow label="In Voucher" value={hotel.in_voucher === null ? null : (hotel.in_voucher ? 'Yes' : 'No')} />

      {ShowSectionTitles && <SectionTitle title="Accommodations" />}
      <InfoRow label="Rooms" value={hotel.room_count} />
      <InfoRow label="Adults" value={hotel.adult_count} />
      <InfoRow label="Children" value={hotel.child_count} />
      <InfoRow label="Infants" value={hotel.infant_count} />
      <InfoRow label="Board Basis ID" value={hotel.board_basis_id} />
      <InfoRow label="Hotel Feature ID" value={hotel.hotel_feature_id} />

      {ShowSectionTitles && <SectionTitle title="Pricing" />}
      <InfoRow label="Cost / Pax" value={hotel.cost_per_pax?.toLocaleString()} />
      <InfoRow label="PVP / Pax" value={hotel.pvp_per_pax?.toLocaleString()} />
      <InfoRow label="Cost Currency" value={getCurrencyCode(refData, hotel.cost_currency_id)} />
      <InfoRow label="Cost Currency Exchange Rate" value={hotel.cost_currency_exchange_rate} />
      <InfoRow label="Settlement Currency" value={getCurrencyCode(refData, hotel.settlement_currency_id)} />
      <InfoRow label="Settlement Currency Exchange Rate" value={hotel.settlement_currency_exchange_rate} />

      {ShowSectionTitles && <SectionTitle title="Supplier Details" />}
      <InfoRow label="Supplier" value={getSupplierLabel(refData, hotel.supplier_id)} />
      <InfoRow label="Source" value={hotel.source} />
      <InfoRow label="Contract ID" value={hotel.hotel_contract_id} />
    </div>
  )
}

interface HotelEditFieldsProps {
  hotel: HotelService
  refData: RefData
  prefix?: string
  pvpPerPaxOverride?: React.ReactNode
  hotelName?: string | null
  ShowSectionTitles?: boolean
}

export function HotelEditFields({ hotel, refData, prefix = '', pvpPerPaxOverride, hotelName, ShowSectionTitles = true }: HotelEditFieldsProps) {
  const [checkIn, setCheckIn] = useState(hotel.check_in_date?.split('T')[0] ?? '')
  const [checkOut, setCheckOut] = useState(hotel.check_out_date?.split('T')[0] ?? '')

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {ShowSectionTitles && <SectionTitle title="Hotel Information" />}
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}hotel_name`}>Hotel Name</FieldLabel>
        <input id={`${prefix}hotel_name`} type="text" value={hotelName || ''} className="input-standard bg-muted/30 border-b border-border/60" readOnly />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}item_status_id`}>Status</FieldLabel>
        <select id={`${prefix}item_status_id`} name={`${prefix}item_status_id`} defaultValue={hotel.item_status_id ?? ''} className="select-standard">
          <option value="" disabled>— None —</option>
          {refData.bookingItemStatuses.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}check_in_date`}>Check-in</FieldLabel>
        <DatePicker value={checkIn} onChange={setCheckIn} placeholder="Select check-in date" />
        <input type="hidden" name={`${prefix}check_in_date`} value={checkIn} />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}check_out_date`}>Check-out</FieldLabel>
        <DatePicker value={checkOut} onChange={setCheckOut} placeholder="Select check-out date" />
        <input type="hidden" name={`${prefix}check_out_date`} value={checkOut} />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}destination_id`}>Destination</FieldLabel>
        <select id={`${prefix}destination_id`} name={`${prefix}destination_id`} defaultValue={hotel.destination_id ?? ''} className="select-standard">
          <option value="">— None —</option>
          {refData.countries.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}confirmation_ref`}>Reference</FieldLabel>
        <input id={`${prefix}confirmation_ref`} name={`${prefix}confirmation_ref`} type="text" defaultValue={hotel.confirmation_ref ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}description`}>Remarks</FieldLabel>
        <input id={`${prefix}description`} name={`${prefix}description`} type="text" defaultValue={hotel.description ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}in_voucher`}>In Voucher</FieldLabel>
        <input id={`${prefix}in_voucher`} name={`${prefix}in_voucher`} type="checkbox" defaultChecked={hotel.in_voucher || false} className="input-standard w-5 h-5 mt-3" />
      </div>

      {ShowSectionTitles && <SectionTitle title="Accommodations" />}
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}room_count`}>Rooms</FieldLabel>
        <input id={`${prefix}room_count`} name={`${prefix}room_count`} type="number" min={0} defaultValue={hotel.room_count} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}adult_count`}>Adults</FieldLabel>
        <input id={`${prefix}adult_count`} name={`${prefix}adult_count`} type="number" min={0} defaultValue={hotel.adult_count} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}child_count`}>Children</FieldLabel>
        <input id={`${prefix}child_count`} name={`${prefix}child_count`} type="number" min={0} defaultValue={hotel.child_count} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}infant_count`}>Infants</FieldLabel>
        <input id={`${prefix}infant_count`} name={`${prefix}infant_count`} type="number" min={0} defaultValue={hotel.infant_count} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}board_basis_id`}>Board Basis ID</FieldLabel>
        <input id={`${prefix}board_basis_id`} name={`${prefix}board_basis_id`} type="number" defaultValue={hotel.board_basis_id ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}hotel_feature_id`}>Hotel Feature ID</FieldLabel>
        <input id={`${prefix}hotel_feature_id`} name={`${prefix}hotel_feature_id`} type="number" defaultValue={hotel.hotel_feature_id ?? ''} className="input-standard" />
      </div>

      {ShowSectionTitles && <SectionTitle title="Pricing" />}
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}cost_per_pax`}>Cost / Pax</FieldLabel>
        <input id={`${prefix}cost_per_pax`} name={`${prefix}cost_per_pax`} type="number" step="0.01" defaultValue={hotel.cost_per_pax ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}pvp_per_pax`}>PVP / Pax</FieldLabel>
        {pvpPerPaxOverride ? pvpPerPaxOverride : (
          <input id={`${prefix}pvp_per_pax`} name={`${prefix}pvp_per_pax`} type="number" step="0.01" defaultValue={hotel.pvp_per_pax ?? ''} className="input-standard" />
        )}
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}cost_currency_id`}>Cost Currency</FieldLabel>
        <select id={`${prefix}cost_currency_id`} name={`${prefix}cost_currency_id`} defaultValue={hotel.cost_currency_id ?? ''} className="select-standard">
          <option value="" disabled>— None —</option>
          {refData.currencies.map((c) => (
            <option key={c.id} value={c.id}>{c.code}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}cost_currency_exchange_rate`}>Cost Currency Exchange Rate</FieldLabel>
        <input id={`${prefix}cost_currency_exchange_rate`} name={`${prefix}cost_currency_exchange_rate`} type="number" step="0.000001" defaultValue={hotel.cost_currency_exchange_rate ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}settlement_currency_id`}>Settlement Currency</FieldLabel>
        <select id={`${prefix}settlement_currency_id`} name={`${prefix}settlement_currency_id`} defaultValue={hotel.settlement_currency_id ?? ''} className="select-standard">
          <option value="" disabled>— None —</option>
          {refData.currencies.map((c) => (
            <option key={c.id} value={c.id}>{c.code}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}settlement_currency_exchange_rate`}>Settlement Currency Exchange Rate</FieldLabel>
        <input id={`${prefix}settlement_currency_exchange_rate`} name={`${prefix}settlement_currency_exchange_rate`} type="number" step="0.000001" defaultValue={hotel.settlement_currency_exchange_rate ?? ''} className="input-standard" />
      </div>

      {ShowSectionTitles && <SectionTitle title="Supplier Details" />}
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}supplier_id`}>Supplier</FieldLabel>
        <select id={`${prefix}supplier_id`} name={`${prefix}supplier_id`} defaultValue={hotel.supplier_id ?? ''} className="select-standard">
          <option value="">— None —</option>
          {refData.suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.provider_code}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}source`}>Source</FieldLabel>
        <input id={`${prefix}source`} name={`${prefix}source`} type="text" defaultValue={hotel.source ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}hotel_contract_id`}>Contract ID</FieldLabel>
        <input id={`${prefix}hotel_contract_id`} name={`${prefix}hotel_contract_id`} type="number" defaultValue={hotel.hotel_contract_id ?? ''} className="input-standard" />
      </div>
    </div>
  )
}

/* ─── Shared UI Helpers (Should ideally be moved to a common place) ───── */

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="col-span-2 mt-4 mb-1 border-b border-border/60 pb-1 text-left">
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{title}</span>
    </div>
  )
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-sm font-medium text-foreground block text-left">
      {children}
    </label>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 text-left">
      <span className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground break-words">
        {(value !== null && value !== undefined && value !== '' && value !== 0) ? value : <span className="text-muted-foreground italic">—</span>}
      </span>
    </div>
  )
}
