import { useState } from 'react'
import {
  type RefData,
  getCurrencyCode,
  getCountryName,
  getStatusName,
  getSupplierLabel,
  nullify,
  intOrNull,
  numOrNull,
  formatDatetime
} from './utils'
import { type FlightUpdatePayload } from '../actions'
import { DatePicker } from '@/components/ui/date-picker'

/* ─── Types ─────────────────────────────────────────────── */

export interface FlightService {
  id: number
  description?: string | null
  pnr_code?: string | null
  departure_terminal?: string | null
  arrival_terminal?: string | null
  adult_count: number
  child_count: number
  infant_count: number
  cabin_class?: string | null
  cost_currency_id?: number | null
  cost_currency_exchange_rate?: number | null
  settlement_currency_id?: number | null
  settlement_currency_exchange_rate?: number | null
  cost_per_pax?: number | null
  price_with_taxes?: number | null
  pvp_per_pax?: number | null
  item_status_id?: number | null
  destination_id?: number | null
  adult_baggage?: string | null
  child_baggage?: string | null
  infant_baggage?: string | null
  supplier_id?: number | null
  airline_contract_id?: number | null
  air_service_id?: number | null
  service_type_id?: number | null
  is_waitlisted?: boolean | null
  issued_date?: string | null
}

const CABIN_CLASSES = [
  'Economy',
  'Premium Economy',
  'Business',
  'First',
] as const

/* ─── Helpers ───────────────────────────────────────────── */

export function parseFlightFormData(fd: FormData, prefix: string = ''): FlightUpdatePayload {
  return {
    description: nullify(fd.get(`${prefix}description`) as string),
    pnr_code: nullify(fd.get(`${prefix}pnr_code`) as string),
    cabin_class: nullify(fd.get(`${prefix}cabin_class`) as string),
    departure_terminal: nullify(fd.get(`${prefix}departure_terminal`) as string),
    arrival_terminal: nullify(fd.get(`${prefix}arrival_terminal`) as string),
    item_status_id: intOrNull(fd.get(`${prefix}item_status_id`) as string),
    destination_id: intOrNull(fd.get(`${prefix}destination_id`) as string),
    adult_count: intOrNull(fd.get(`${prefix}adult_count`) as string),
    child_count: intOrNull(fd.get(`${prefix}child_count`) as string),
    infant_count: intOrNull(fd.get(`${prefix}infant_count`) as string),
    adult_baggage: nullify(fd.get(`${prefix}adult_baggage`) as string),
    child_baggage: nullify(fd.get(`${prefix}child_baggage`) as string),
    infant_baggage: nullify(fd.get(`${prefix}infant_baggage`) as string),
    cost_per_pax: numOrNull(fd.get(`${prefix}cost_per_pax`) as string),
    pvp_per_pax: numOrNull(fd.get(`${prefix}pvp_per_pax`) as string),
    price_with_taxes: numOrNull(fd.get(`${prefix}price_with_taxes`) as string),
    cost_currency_id: intOrNull(fd.get(`${prefix}cost_currency_id`) as string),
    cost_currency_exchange_rate: numOrNull(fd.get(`${prefix}cost_currency_exchange_rate`) as string),
    settlement_currency_id: intOrNull(fd.get(`${prefix}settlement_currency_id`) as string),
    settlement_currency_exchange_rate: numOrNull(fd.get(`${prefix}settlement_currency_exchange_rate`) as string),
    supplier_id: intOrNull(fd.get(`${prefix}supplier_id`) as string),
    is_waitlisted: fd.get(`${prefix}is_waitlisted`) === 'true',
  }
}

/* ─── Components ─────────────────────────────────────────── */

export function FlightViewFields({ flight, refData, ShowSectionTitles = true, flightName }: { flight: FlightService, refData: RefData, ShowSectionTitles?: boolean, flightName?: string | null }) {
  const totalPax = (flight.adult_count || 0) + (flight.child_count || 0) + (flight.infant_count || 0)
  const taxes = (flight.price_with_taxes != null && flight.pvp_per_pax != null)
    ? (flight.price_with_taxes - (flight.pvp_per_pax * totalPax))
    : null

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {ShowSectionTitles && <SectionTitle title="Flight Info" />}
      <InfoRow label="Flight Name" value={flightName || flight.description} />
      <InfoRow label="PNR Code" value={flight.pnr_code} />
      <InfoRow label="Cabin Class" value={flight.cabin_class} />
      <InfoRow label="Status" value={getStatusName(refData, flight.item_status_id)} />
      <InfoRow label="Issued Date" value={formatDatetime(flight.issued_date)} />
      <InfoRow label="Destination" value={getCountryName(refData, flight.destination_id)} />
      <InfoRow label="Departure Terminal" value={flight.departure_terminal} />
      <InfoRow label="Arrival Terminal" value={flight.arrival_terminal} />
      <InfoRow label="Waitlisted" value={flight.is_waitlisted == null ? null : flight.is_waitlisted ? 'Yes' : 'No'} />
      <InfoRow label="Remarks" value={flight.description} />

      {ShowSectionTitles && <SectionTitle title="Passengers & Baggage" />}
      <InfoRow label="Adults" value={flight.adult_count > 0 ? flight.adult_count : null} />
      <InfoRow label="Adult Baggage" value={flight.adult_baggage} />
      <InfoRow label="Children" value={flight.child_count > 0 ? flight.child_count : null} />
      <InfoRow label="Child Baggage" value={flight.child_baggage} />
      <InfoRow label="Infants" value={flight.infant_count > 0 ? flight.infant_count : null} />
      <InfoRow label="Infant Baggage" value={flight.infant_baggage} />

      {ShowSectionTitles && <SectionTitle title="Pricing" />}
      <InfoRow label="Cost / Pax" value={flight.cost_per_pax != null ? flight.cost_per_pax.toLocaleString() : null} />
      <InfoRow label="PVP / Pax" value={flight.pvp_per_pax != null ? flight.pvp_per_pax.toLocaleString() : null} />
      <InfoRow label="Flight Taxes" value={taxes != null ? taxes.toLocaleString() : null} />
      <InfoRow label="Price w/ Taxes" value={flight.price_with_taxes != null ? flight.price_with_taxes.toLocaleString() : null} />
      <InfoRow label="Cost Currency" value={getCurrencyCode(refData, flight.cost_currency_id)} />
      <InfoRow label="Cost Currency Exchange Rate" value={flight.cost_currency_exchange_rate} />
      <InfoRow label="Settlement Currency" value={getCurrencyCode(refData, flight.settlement_currency_id)} />
      <InfoRow label="Settlement Currency Exchange Rate" value={flight.settlement_currency_exchange_rate} />

      {ShowSectionTitles && <SectionTitle title="Supplier" />}
      <InfoRow label="Supplier" value={getSupplierLabel(refData, flight.supplier_id)} />
      <InfoRow label="Airline Contract ID" value={flight.airline_contract_id} />
      <InfoRow label="Air Service ID" value={flight.air_service_id} />
      <InfoRow label="Service Type ID" value={flight.service_type_id} />
    </div>
  )
}

interface FlightEditFieldsProps {
  flight: FlightService
  refData: RefData
  prefix?: string
  pvpPerPaxOverride?: React.ReactNode
  flightName?: string | null
  ShowSectionTitles?: boolean
}

export function FlightEditFields({ flight, refData, prefix = '', pvpPerPaxOverride, flightName, ShowSectionTitles = true }: FlightEditFieldsProps) {
  const [adultCount, setAdultCount] = useState(flight.adult_count)
  const [childCount, setChildCount] = useState(flight.child_count)
  const [infantCount, setInfantCount] = useState(flight.infant_count)
  const [pvpPerPax, setPvpPerPax] = useState(flight.pvp_per_pax ?? 0)
  const [priceWithTaxes, setPriceWithTaxes] = useState(flight.price_with_taxes ?? 0)

  const totalPax = adultCount + childCount + infantCount
  const flightTaxesResult = priceWithTaxes - (pvpPerPax * totalPax)

  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {ShowSectionTitles && <SectionTitle title="Flight Info" />}
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}flight_name`}>Flight Name</FieldLabel>
        <input id={`${prefix}flight_name`} type="text" value={flightName || ''} className="input-standard bg-muted/30 border-b border-border/60" readOnly />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}pnr_code`}>PNR Code</FieldLabel>
        <input id={`${prefix}pnr_code`} name={`${prefix}pnr_code`} type="text" defaultValue={flight.pnr_code ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}cabin_class`}>Cabin Class</FieldLabel>
        <select id={`${prefix}cabin_class`} name={`${prefix}cabin_class`} defaultValue={flight.cabin_class ?? ''} className="select-standard">
          <option value="">— None —</option>
          {CABIN_CLASSES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}item_status_id`}>Status</FieldLabel>
        <select id={`${prefix}item_status_id`} name={`${prefix}item_status_id`} defaultValue={flight.item_status_id ?? ''} className="select-standard">
          <option value="">— None —</option>
          {refData.bookingItemStatuses.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}departure_date`}>Issued Date</FieldLabel>
        <input id={`${prefix}issued_date`} name={`${prefix}issued_date`} type="text" value={formatDatetime(flight.issued_date) || ''} className="input-standard bg-muted/30 border-b border-border/60" readOnly />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}destination_id`}>Destination</FieldLabel>
        <select id={`${prefix}destination_id`} name={`${prefix}destination_id`} defaultValue={flight.destination_id ?? ''} className="select-standard">
          <option value="">— None —</option>
          {refData.countries.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}departure_terminal`}>Departure Terminal</FieldLabel>
        <input id={`${prefix}departure_terminal`} name={`${prefix}departure_terminal`} type="text" defaultValue={flight.departure_terminal ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}arrival_terminal`}>Arrival Terminal</FieldLabel>
        <input id={`${prefix}arrival_terminal`} name={`${prefix}arrival_terminal`} type="text" defaultValue={flight.arrival_terminal ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}is_waitlisted`}>Waitlisted</FieldLabel>
        <select id={`${prefix}is_waitlisted`} name={`${prefix}is_waitlisted`} defaultValue={flight.is_waitlisted == null ? '' : String(flight.is_waitlisted)} className="select-standard">
          <option value="">— Unknown —</option>
          <option value="false">No</option>
          <option value="true">Yes</option>
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}description`}>Remarks</FieldLabel>
        <input id={`${prefix}description`} name={`${prefix}description`} type="text" defaultValue={flight.description ?? ''} className="input-standard" />
      </div>

      {ShowSectionTitles && <SectionTitle title="Passengers & Baggage" />}
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}adult_count`}>Adult Count</FieldLabel>
        <input
          id={`${prefix}adult_count`}
          name={`${prefix}adult_count`}
          type="number"
          min={0}
          defaultValue={flight.adult_count}
          className="input-standard"
          onChange={(e) => setAdultCount(parseInt(e.target.value) || 0)}
        />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}adult_baggage`}>Adult Baggage</FieldLabel>
        <input id={`${prefix}adult_baggage`} name={`${prefix}adult_baggage`} type="text" defaultValue={flight.adult_baggage ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}child_count`}>Child Count</FieldLabel>
        <input
          id={`${prefix}child_count`}
          name={`${prefix}child_count`}
          type="number"
          min={0}
          defaultValue={flight.child_count}
          className="input-standard"
          onChange={(e) => setChildCount(parseInt(e.target.value) || 0)}
        />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}child_baggage`}>Child Baggage</FieldLabel>
        <input id={`${prefix}child_baggage`} name={`${prefix}child_baggage`} type="text" defaultValue={flight.child_baggage ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}infant_count`}>Infant Count</FieldLabel>
        <input
          id={`${prefix}infant_count`}
          name={`${prefix}infant_count`}
          type="number"
          min={0}
          defaultValue={flight.infant_count}
          className="input-standard"
          onChange={(e) => setInfantCount(parseInt(e.target.value) || 0)}
        />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}infant_baggage`}>Infant Baggage</FieldLabel>
        <input id={`${prefix}infant_baggage`} name={`${prefix}infant_baggage`} type="text" defaultValue={flight.infant_baggage ?? ''} className="input-standard" />
      </div>

      {ShowSectionTitles && <SectionTitle title="Pricing" />}
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}cost_per_pax`}>Cost / Pax</FieldLabel>
        <input id={`${prefix}cost_per_pax`} name={`${prefix}cost_per_pax`} type="number" step="0.0001" defaultValue={flight.cost_per_pax ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}pvp_per_pax`}>PVP / Pax</FieldLabel>
        {pvpPerPaxOverride ? pvpPerPaxOverride : (
          <input
            id={`${prefix}pvp_per_pax`}
            name={`${prefix}pvp_per_pax`}
            type="number"
            step="0.0001"
            defaultValue={flight.pvp_per_pax ?? ''}
            className="input-standard"
            onChange={(e) => setPvpPerPax(parseFloat(e.target.value) || 0)}
          />
        )}
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}flight_taxes`}>Flight Taxes</FieldLabel>
        <input
          id={`${prefix}flight_taxes`}
          name={`${prefix}flight_taxes`}
          type="text"
          value={flightTaxesResult.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          className="input-standard bg-muted/30 border-b border-border/60 cursor-not-allowed"
          readOnly
        />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}price_with_taxes`}>Price w/ Taxes</FieldLabel>
        <input
          id={`${prefix}price_with_taxes`}
          name={`${prefix}price_with_taxes`}
          type="number"
          step="0.0001"
          defaultValue={flight.price_with_taxes ?? ''}
          className="input-standard"
          onChange={(e) => setPriceWithTaxes(parseFloat(e.target.value) || 0)}
        />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}cost_currency_id`}>Cost Currency</FieldLabel>
        <select id={`${prefix}cost_currency_id`} name={`${prefix}cost_currency_id`} defaultValue={flight.cost_currency_id ?? ''} className="select-standard">
          <option value="">— None —</option>
          {refData.currencies.map((c) => (
            <option key={c.id} value={c.id}>{c.code}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}cost_currency_exchange_rate`}>Cost Currency Exchange Rate</FieldLabel>
        <input id={`${prefix}cost_currency_exchange_rate`} name={`${prefix}cost_currency_exchange_rate`} type="number" step="0.00001" defaultValue={flight.cost_currency_exchange_rate ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}settlement_currency_id`}>Settlement Currency</FieldLabel>
        <select id={`${prefix}settlement_currency_id`} name={`${prefix}settlement_currency_id`} defaultValue={flight.settlement_currency_id ?? ''} className="select-standard">
          <option value="">— None —</option>
          {refData.currencies.map((c) => (
            <option key={c.id} value={c.id}>{c.code}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}settlement_currency_exchange_rate`}>Settlement Currency Exchange Rate</FieldLabel>
        <input id={`${prefix}settlement_currency_exchange_rate`} name={`${prefix}settlement_currency_exchange_rate`} type="number" step="0.00001" defaultValue={flight.settlement_currency_exchange_rate ?? ''} className="input-standard" />
      </div>

      {ShowSectionTitles && <SectionTitle title="Supplier" />}
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}supplier_id`}>Supplier</FieldLabel>
        <select id={`${prefix}supplier_id`} name={`${prefix}supplier_id`} defaultValue={flight.supplier_id ?? ''} className="select-standard">
          <option value="">— None —</option>
          {refData.suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {getSupplierLabel(refData, s.id)}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}airline_contract_id`}>Airline Contract ID</FieldLabel>
        <input id={`${prefix}airline_contract_id`} name={`${prefix}airline_contract_id`} type="text" defaultValue={flight.airline_contract_id ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}air_service_id`}>Air Service ID</FieldLabel>
        <input id={`${prefix}air_service_id`} name={`${prefix}air_service_id`} type="text" defaultValue={flight.air_service_id ?? ''} className="input-standard" />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}service_type_id`}>Service Type ID</FieldLabel>
        <input id={`${prefix}service_type_id`} name={`${prefix}service_type_id`} type="text" defaultValue={flight.service_type_id ?? ''} className="input-standard" />
      </div>
    </div>
  )
}

/* ─── Shared UI Helpers ───────────────────────────────────── */

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
