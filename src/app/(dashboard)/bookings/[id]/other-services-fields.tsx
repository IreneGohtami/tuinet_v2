import { type RefData, getCurrencyCode, getCountryName, getStatusName, formatDate } from './utils'
import { InfoRow, SectionTitle, FieldLabel } from './pvp-detail-dialog'

interface OtherService {
  id: number
  description?: string | null
  service_date?: string | null
  item_status_id?: number | null
  supplier_id?: number | null
  destination_id?: number | null
  adult_count?: number | null
  child_count?: number | null
  infant_count?: number | null
  cost_per_pax?: number | null
  pvp_per_pax?: number | null
  cost_currency_id?: number | null
  cost_currency_exchange_rate?: number | null
  settlement_currency_id?: number | null
  settlement_currency_exchange_rate?: number | null
  confirmation_ref?: string | null
  supplier_locator?: string | null
  net_commissionable?: string | null
  in_voucher?: boolean | null
}

interface OtherServiceViewFieldsProps {
  otherService: OtherService
  refData: RefData
  ShowSectionTitles?: boolean
  serviceName?: string
}

interface OtherServiceEditFieldsProps {
  otherService: OtherService
  refData: RefData
  prefix: string
  ShowSectionTitles?: boolean
  serviceName?: string
  pvpPerPaxOverride?: React.ReactNode
}

export function OtherServiceViewFields({ otherService, refData, ShowSectionTitles = true, serviceName }: OtherServiceViewFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {ShowSectionTitles && <SectionTitle title="Service Details" />}
      <InfoRow label="Description" value={otherService.description || serviceName} />
      <InfoRow label="Service Date" value={formatDate(otherService.service_date)} />
      <InfoRow label="Status" value={getStatusName(refData, otherService.item_status_id)} />
      <InfoRow label="Destination" value={getCountryName(refData, otherService.destination_id)} />
      <InfoRow label="Confirmation Ref" value={otherService.confirmation_ref} />
      <InfoRow label="Supplier Locator" value={otherService.supplier_locator} />

      {ShowSectionTitles && <SectionTitle title="Passengers" />}
      <InfoRow label="Adults" value={otherService.adult_count} />
      <InfoRow label="Children" value={otherService.child_count} />
      <InfoRow label="Infants" value={otherService.infant_count} />

      {ShowSectionTitles && <SectionTitle title="Pricing" />}
      <InfoRow label="Cost per Pax" value={otherService.cost_per_pax} />
      <InfoRow label="Cost Currency" value={getCurrencyCode(refData, otherService.cost_currency_id)} />
      <InfoRow label="Cost Exchange Rate" value={otherService.cost_currency_exchange_rate} />
      <InfoRow label="PVP per Pax" value={otherService.pvp_per_pax} />
      <InfoRow label="In Voucher" value={otherService.in_voucher ? 'Yes' : 'No'} />
    </div>
  )
}

export function OtherServiceEditFields({ otherService, refData, prefix, ShowSectionTitles = true, serviceName, pvpPerPaxOverride }: OtherServiceEditFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {ShowSectionTitles && <SectionTitle title="Service Details" />}
      <div className="col-span-2 space-y-1">
        <FieldLabel htmlFor={`${prefix}description`}>Description</FieldLabel>
        <input
          id={`${prefix}description`}
          name={`${prefix}description`}
          type="text"
          value={serviceName || otherService.description || ''}
          className="input-standard bg-muted/30 border-b border-border/60"
          readOnly
        />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}service_date`}>Service Date</FieldLabel>
        <input
          id={`${prefix}service_date`}
          name={`${prefix}service_date`}
          type="date"
          defaultValue={otherService.service_date?.split('T')[0] || ''}
          className="input-standard"
        />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}destination_id`}>Destination</FieldLabel>
        <select
          id={`${prefix}destination_id`}
          name={`${prefix}destination_id`}
          defaultValue={otherService.destination_id || ''}
          className="select-standard"
        >
          <option value="">— Select Destination —</option>
          {refData.countries.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}confirmation_ref`}>Confirmation Ref</FieldLabel>
        <input
          id={`${prefix}confirmation_ref`}
          name={`${prefix}confirmation_ref`}
          type="text"
          defaultValue={otherService.confirmation_ref || ''}
          className="input-standard"
        />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}supplier_locator`}>Supplier Locator</FieldLabel>
        <input
          id={`${prefix}supplier_locator`}
          name={`${prefix}supplier_locator`}
          type="text"
          defaultValue={otherService.supplier_locator || ''}
          className="input-standard"
        />
      </div>

      {ShowSectionTitles && <SectionTitle title="Passengers" />}
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}adult_count`}>Adults</FieldLabel>
        <input
          id={`${prefix}adult_count`}
          name={`${prefix}adult_count`}
          type="number"
          defaultValue={otherService.adult_count || 0}
          className="input-standard"
        />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}child_count`}>Children</FieldLabel>
        <input
          id={`${prefix}child_count`}
          name={`${prefix}child_count`}
          type="number"
          defaultValue={otherService.child_count || 0}
          className="input-standard"
        />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}infant_count`}>Infants</FieldLabel>
        <input
          id={`${prefix}infant_count`}
          name={`${prefix}infant_count`}
          type="number"
          defaultValue={otherService.infant_count || 0}
          className="input-standard"
        />
      </div>

      {ShowSectionTitles && <SectionTitle title="Pricing" />}
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}cost_per_pax`}>Cost per Pax</FieldLabel>
        <input
          id={`${prefix}cost_per_pax`}
          name={`${prefix}cost_per_pax`}
          type="number"
          step="0.01"
          defaultValue={otherService.cost_per_pax || ''}
          className="input-standard"
        />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}cost_currency_id`}>Cost Currency</FieldLabel>
        <select
          id={`${prefix}cost_currency_id`}
          name={`${prefix}cost_currency_id`}
          defaultValue={otherService.cost_currency_id || ''}
          className="select-standard"
        >
          <option value="">— Select Currency —</option>
          {refData.currencies.map((c) => (
            <option key={c.id} value={c.id}>{c.code}</option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}cost_currency_exchange_rate`}>Cost Exchange Rate</FieldLabel>
        <input
          id={`${prefix}cost_currency_exchange_rate`}
          name={`${prefix}cost_currency_exchange_rate`}
          type="number"
          step="0.00001"
          defaultValue={otherService.cost_currency_exchange_rate || ''}
          className="input-standard"
        />
      </div>
      <div className="space-y-1">
        <FieldLabel htmlFor={`${prefix}pvp_per_pax`}>PVP per Pax</FieldLabel>
        {pvpPerPaxOverride || (
          <input
            id={`${prefix}pvp_per_pax`}
            name={`${prefix}pvp_per_pax`}
            type="number"
            step="0.01"
            defaultValue={otherService.pvp_per_pax || ''}
            className="input-standard"
          />
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <input
          id={`${prefix}in_voucher`}
          name={`${prefix}in_voucher`}
          type="checkbox"
          defaultChecked={otherService.in_voucher || false}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <FieldLabel htmlFor={`${prefix}in_voucher`}>In Voucher</FieldLabel>
      </div>
    </div>
  )
}

export function parseOtherServiceFormData(formData: FormData, prefix: string) {
  const get = (key: string) => formData.get(`${prefix}${key}`)
  const getNum = (key: string) => {
    const val = get(key)
    return val ? parseFloat(val as string) : null
  }
  const getInt = (key: string) => {
    const val = get(key)
    return val ? parseInt(val as string) : null
  }

  return {
    service_date: get('service_date') as string | null,
    destination_id: getInt('destination_id'),
    confirmation_ref: get('confirmation_ref') as string | null,
    supplier_locator: get('supplier_locator') as string | null,
    adult_count: getInt('adult_count'),
    child_count: getInt('child_count'),
    infant_count: getInt('infant_count'),
    pvp_per_pax: getNum('pvp_per_pax'),
    cost_per_pax: getNum('cost_per_pax'),
    cost_currency_id: getInt('cost_currency_id'),
    cost_currency_exchange_rate: getNum('cost_currency_exchange_rate'),
    settlement_currency_id: getInt('settlement_currency_id'),
    settlement_currency_exchange_rate: getNum('settlement_currency_exchange_rate'),
    in_voucher: formData.get(`${prefix}in_voucher`) === 'on'
  }
}
