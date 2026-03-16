
import { getBookingById, getReferenceData } from '../actions'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft,
  Plane,
  Hotel,
  Ticket,
  Car,
  FileText,
  Users,
  Info,
  Calendar,
  MapPin,
  Tag
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'
import { FlightDetailDialog } from './flight-detail-dialog'
import { HotelDetailDialog } from './hotel-detail-dialog'
import { PvpDetailDialog } from './pvp-detail-dialog'
import {
  type RefData,
  getCurrencyCode as getRefCurrencyCode,
  getCountryName as getRefCountryName,
  getStatusName as getRefStatusName,
  formatDate
} from './utils'

interface PageProps {
  params: Promise<{ id: string }>
}

interface Passenger {
  id: number
  title?: string
  first_name: string
  last_name1: string
  last_name2?: string
  passenger_type?: string
  gender?: string
  phone?: string
  email?: string
  birth_date?: string
  nationality_country_id?: number
  document_type?: string
  document_number?: string
  document_issue_date?: string
  document_expiry_date?: string
  is_main_passenger: boolean
}

interface Flight {
  id: number
  description?: string
  pnr_code?: string
  departure_terminal?: string
  arrival_terminal?: string
  adult_count: number
  child_count: number
  infant_count: number
  cabin_class?: string
  cost_currency_id?: number
  cost_currency_exchange_rate?: number
  cost_per_pax?: number
  price_with_taxes?: number
  pvp_per_pax?: number
  item_status_id?: number
  destination_id?: number
  adult_baggage?: string
  child_baggage?: string
  infant_baggage?: string
  airline_contract_ids?: string
}

interface HotelService {
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

interface Tour {
  id: number
  description: string
  tour_date: string
}

interface Transfer {
  id: number
  description: string
  pickup_location?: string
}

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
  confirmation_ref?: string | null
  supplier_locator?: string | null
  net_commissionable?: string | null
  in_voucher?: boolean | null
}

interface InvoiceDetail {
  tax_base: number
  vat: number
}

interface Invoice {
  id: number
  invoice_number?: string
  invoice_date: string
  booking_invoice_details?: InvoiceDetail[]
}

interface PvpDetail {
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

export default async function BookingDetailPage({ params }: PageProps) {
  const { id } = await params
  const bookingId = parseInt(id)

  if (isNaN(bookingId)) {
    notFound()
  }

  const [{ data: booking, error }, refData] = await Promise.all([
    getBookingById(bookingId),
    getReferenceData()
  ])

  if (error || !booking) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <h2 className="text-2xl font-bold text-destructive">Error</h2>
        <p className="text-muted-foreground">{error || 'Booking not found'}</p>
        <Link href="/bookings" className="text-primary hover:underline">
          Return to Bookings
        </Link>
      </div>
    )
  }

  const currencyCode = refData.currencies.find(c => c.id.toString() === booking.currency_id.toString())?.code || booking.currency_id

  // Cast related arrays to their types
  const passengers = booking.passengers as Passenger[]
  const flights = booking.flights as Flight[]
  const hotels = booking.hotels as HotelService[]
  const tours = booking.tours as Tour[]
  const transfers = booking.transfers as Transfer[]
  const otherServices = booking.other_services as OtherService[]
  const invoices = booking.invoices as Invoice[]
  const pvpDetails = booking.pvp_details as PvpDetail[]

  const getCountryName = (id?: number | null) => getRefCountryName(refData as unknown as RefData, id)
  const getBookingItemStatusName = (id?: number | null) => getRefStatusName(refData as unknown as RefData, id) || 'N/A'
  const getCurrencyCode = (id?: number | null) => getRefCurrencyCode(refData as unknown as RefData, id)

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-4">
          <Link
            href="/bookings"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Bookings
          </Link>
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
              Booking <span className="text-primary">{booking.booking_reference || 'N/A'}</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge statusId={booking.status_id} bookingStatuses={refData.bookingStatuses} size="md" />
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar: General Info & Passengers */}
        <div className="lg:col-span-1 space-y-8">
          {/* General Info */}
          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden relative">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" /> General Information
            </h3>
            <div className="space-y-5">
              <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Created At</span>
                <span className="font-semibold">{formatDate(booking.created_at)}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Region</span>
                <span className="font-semibold uppercase">{booking.region_code || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-border/50 pb-2">
                <span className="text-muted-foreground">Sales Channel</span>
                <span className="font-semibold">{booking.sales_channel_value || 'Direct'}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="font-bold text-primary text-lg">
                  {currencyCode} {(booking.total_amount as number).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </section>

          {/* Passengers */}
          <section className="bg-card border border-border rounded-2xl p-6 shadow-sm overflow-hidden">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Passengers
            </h3>
            <div className="space-y-4">
              {passengers.map((p) => (
                <div key={p.id} className="p-4 bg-secondary/20 rounded-xl border border-border/50 hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-2">
                    <div className="font-bold">
                      {p.title && <span className="text-xs text-muted-foreground mr-1">{p.title}</span>}
                      {p.first_name} {p.last_name1} {p.last_name2}
                    </div>
                    <div className="flex items-center gap-1">
                      {p.is_main_passenger && (
                        <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Main</span>
                      )}
                      {p.passenger_type && (
                        <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full uppercase tracking-tighter">{p.passenger_type}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground mt-2 space-y-1">
                    {p.gender && <div className="flex items-center gap-1.5"><Users className="h-3 w-3" /> {p.gender}</div>}
                    {p.birth_date && <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Born: {formatDate(p.birth_date)}</div>}
                    {getCountryName(p.nationality_country_id) && <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3" /> {getCountryName(p.nationality_country_id)}</div>}
                    {p.phone && <div className="flex items-center gap-1.5"><Info className="h-3 w-3" /> {p.phone}</div>}
                    {p.is_main_passenger && p.email && <div className="flex items-center gap-1.5"><Info className="h-3 w-3" /> {p.email}</div>}
                    {p.document_type && p.document_number && p.document_number !== 'X' && (
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3 w-3" />
                        <span className="text-xs">{p.document_type}: {p.document_number}</span>
                        {p.document_issue_date && <span className="text-xs"> (Issued: {formatDate(p.document_issue_date)})</span>}
                        {p.document_expiry_date && <span className="text-xs"> (Expires: {formatDate(p.document_expiry_date)})</span>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {passengers.length === 0 && (
                <p className="text-sm text-muted-foreground italic text-center py-4">No passengers registered</p>
              )}
            </div>
          </section>
        </div>

        {/* Column 2 & 3: Tabs for Services */}
        <div className="lg:col-span-2 space-y-8">

          {/* PVP Details */}
          {pvpDetails.length > 0 && (
            <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-secondary/30 px-6 py-4 flex items-center justify-between border-b border-border">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Tag className="h-5 w-5 text-primary" /> PVP Details (All Components)
                </h3>
                <span className="text-sm font-semibold px-2 py-1 ">
                  <span className="text-muted-foreground">{pvpDetails.length} items</span>
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="table-standard">
                  <thead className="table-head-standard">
                    <tr>
                      <th className="table-th-standard">Name</th>
                      <th className="table-th-standard">Component</th>
                      <th className="table-th-standard">Pax</th>
                      <th className="table-th-standard text-right">PVP/Pax</th>
                      <th className="table-th-standard"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const compTypeCounts: Record<string, number> = {}
                      return pvpDetails.map((pvp) => {
                        const compType = pvp.component || 'Other'
                        const occurrenceIndex = compTypeCounts[compType] || 0
                        compTypeCounts[compType] = occurrenceIndex + 1

                        const getRelatedComponent = () => {
                          if (compType === 'Flight') return flights.filter(f => f.pvp_per_pax !== 0) // Only display/edit non-zero PVP segments
                          if (compType === 'Hotel') return hotels[occurrenceIndex]
                          if (compType === 'Tour') return tours[occurrenceIndex]
                          if (compType === 'Transfer') return transfers[occurrenceIndex]
                          if (compType === 'Others') return otherServices[occurrenceIndex]
                          return null
                        }

                        return (
                          <tr key={pvp.id} className="table-row-standard">
                            <td className="table-td-standard">
                              <div className="font-medium">{pvp.name || '-'}</div>
                            </td>
                            <td className="table-td-standard">
                              <div className="font-medium">{pvp.component || '-'}</div>
                              <span className="text-xs text-muted-foreground">{pvp.direction || ''}</span>
                            </td>
                            <td className="table-td-standard">
                              <span className="text-xs">{pvp.passenger_count || '-'}</span>
                            </td>
                            <td className="table-td-standard text-right">
                              <div className="space-y-1">
                                {pvp.pvp_per_pax ? pvp.pvp_per_pax.toLocaleString() : '-'}
                                {pvp.pvp_per_pax ? <div className="text-[10px] text-muted-foreground">{currencyCode}</div> : null}
                              </div>
                            </td>
                            <td className="table-td-standard text-right">
                              <div className="flex justify-end">
                                <PvpDetailDialog pvpDetail={pvp} relatedComponent={getRelatedComponent()} refData={refData as unknown as RefData} mode="view" />
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    })()}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Flights */}
          {flights.length > 0 && (
            <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-secondary/30 px-6 py-4 flex items-center justify-between border-b border-border">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" /> Flights
                </h3>
                <span className="text-sm font-semibold px-2 py-1 ">
                  <span className="text-muted-foreground">PNR: </span> {flights[0]?.pnr_code || 'N/A'}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="table-standard">
                  <thead className="table-head-standard">
                    <tr>
                      <th className="table-th-standard">Class</th>
                      <th className="table-th-standard">Status</th>
                      <th className="table-th-standard">Route</th>
                      <th className="table-th-standard">Pax</th>
                      <th className="table-th-standard text-right">Cost/Pax</th>
                      <th className="table-th-standard text-right">Total Cost</th>
                      <th className="table-th-standard"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.map((f) => (
                      <tr key={f.id} className="table-row-standard">
                        <td className="table-td-standard">{f.cabin_class || 'N/A'}</td>
                        <td className="table-td-standard">
                          {getBookingItemStatusName(f.item_status_id)}
                        </td>
                        <td className="table-td-standard">
                          {getCountryName(f.destination_id) || 'N/A'}
                        </td>
                        <td className="table-td-standard">
                          <div className="text-xs space-y-1">
                            {f.adult_count > 0 && (
                              <div>
                                <div>Adult ({f.adult_count})</div>
                                {f.adult_baggage && <div className="text-muted-foreground">{f.adult_baggage}</div>}
                              </div>
                            )}
                            {f.child_count > 0 && (
                              <div>
                                <div>Child ({f.child_count})</div>
                                {f.child_baggage && <div className="text-muted-foreground">{f.child_baggage}</div>}
                              </div>
                            )}
                            {f.infant_count > 0 && (
                              <div>
                                <div>Infant ({f.infant_count})</div>
                                {f.infant_baggage && <div className="text-muted-foreground">{f.infant_baggage}</div>}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="table-td-standard text-right">
                          <div className="space-y-1">
                            {f.cost_per_pax ? f.cost_per_pax.toLocaleString() : '-'}
                            {f.cost_per_pax ? <div className="text-xs text-muted-foreground">{currencyCode}</div> : null}
                          </div>
                        </td>
                        <td className="table-td-standard text-right">
                          <div className="space-y-1">
                            {f.price_with_taxes ? f.price_with_taxes.toLocaleString() : '-'}
                            {f.price_with_taxes ? <div className="text-xs text-muted-foreground">{currencyCode}</div> : null}
                          </div>
                        </td>
                        <td className="table-td-standard text-right">
                          <div className="flex justify-end">
                            <FlightDetailDialog flight={f} refData={refData} mode="view" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Hotels */}
          {hotels.length > 0 && (
            <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-secondary/30 px-6 py-4 flex items-center justify-between border-b border-border">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-primary" /> Hotels
                </h3>
                <span className="text-sm font-semibold px-2 py-1 ">
                  <span className="text-muted-foreground">Confirmation: </span> {hotels[0]?.confirmation_ref || 'N/A'}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="table-standard">
                  <thead className="table-head-standard">
                    <tr>
                      <th className="table-th-standard">Hotel Name</th>
                      <th className="table-th-standard">Status</th>
                      <th className="table-th-standard">Check In - Out</th>
                      <th className="table-th-standard">Pax</th>
                      <th className="table-th-standard text-right">PVP/Pax</th>
                      <th className="table-th-standard text-right">Cost/Pax</th>
                      <th className="table-th-standard"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {hotels.map((h) => (
                      <tr key={h.id} className="table-row-standard">
                        <td className="table-td-standard">
                          <div className="font-medium">{h.description || 'Hotel Service'}</div>
                        </td>
                        <td className="table-td-standard">
                          {getBookingItemStatusName(h.item_status_id)}
                        </td>
                        <td className="table-td-standard">
                          <div className="text-xs space-y-0.5">
                            <div className="flex items-center gap-1">
                              <span>{formatDate(h.check_in_date)} - {formatDate(h.check_out_date)}</span>
                            </div>
                          </div>
                        </td>
                        <td className="table-td-standard">
                          <div className="text-xs space-y-0.5">
                            <div className="text-xs space-y-1">
                              {h.adult_count > 0 && (
                                <div>Adult ({h.adult_count})</div>
                              )}
                              {h.child_count > 0 && (
                                <div>Child ({h.child_count})</div>
                              )}
                              {h.infant_count > 0 && (
                                <div>Infant ({h.infant_count})</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="table-td-standard text-right">
                          <div className="space-y-1">
                            {h.pvp_per_pax ? h.pvp_per_pax.toLocaleString() : '-'}
                            {h.pvp_per_pax ? <div className="text-[10px] text-muted-foreground">{currencyCode}</div> : null}
                          </div>
                        </td>
                        <td className="table-td-standard text-right">
                          <div className="space-y-1">
                            {h.cost_per_pax ? h.cost_per_pax.toLocaleString() : '-'}
                            {h.cost_per_pax ? <div className="text-[10px] text-muted-foreground">{getCurrencyCode(h.cost_currency_id)}</div> : null}
                          </div>
                        </td>
                        <td className="table-td-standard text-right">
                          <div className="flex justify-end">
                            <HotelDetailDialog hotel={h} refData={refData} mode="view" />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Tours & Transfers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tours */}
            {tours.length > 0 && (
              <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-secondary/30 px-6 py-3 border-b border-border">
                  <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                    <Ticket className="h-4 w-4 text-primary" /> Tours
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {tours.map((t) => (
                    <div key={t.id} className="text-sm border-b border-border/40 pb-3 last:border-0 last:pb-0">
                      <p className="font-bold">{t.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="h-3 w-3" /> {formatDate(t.tour_date)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Transfers */}
            {transfers.length > 0 && (
              <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="bg-secondary/30 px-6 py-3 border-b border-border">
                  <h3 className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                    <Car className="h-4 w-4 text-primary" /> Transfers
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {transfers.map((tr) => (
                    <div key={tr.id} className="text-sm border-b border-border/40 pb-3 last:border-0 last:pb-0">
                      <p className="font-bold">{tr.description}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> Pick-up: {tr.pickup_location || 'N/A'}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* PVP Details - Others */}
          {booking.pvp_details && booking.pvp_details.filter((pvp: any) => pvp.component === 'Others').length > 0 && (
            <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-secondary/30 px-6 py-4 flex items-center justify-between border-b border-border">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" /> Other Services
                </h3>
                <span className="text-xs font-semibold bg-background px-2 py-1 rounded-md border border-border">
                  {booking.other_services?.length || 0} Service{(booking.other_services?.length || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="table-standard">
                  <thead className="table-head-standard">
                    <tr>
                      <th className="table-th-standard">Description</th>
                      <th className="table-th-standard">Date</th>
                      <th className="table-th-standard">Status</th>
                      <th className="table-th-standard text-right">Price/Pax</th>
                      <th className="table-th-standard">Destination</th>
                      <th className="table-th-standard">Pax</th>
                    </tr>
                  </thead>
                  <tbody>
                    {booking.other_services?.map((service: any) => (
                      <tr key={service.id} className="table-row-standard">
                        <td className="table-td-standard font-medium">{service.description || 'N/A'}</td>
                        <td className="table-td-standard">{service.service_date ? formatDate(service.service_date) : 'N/A'}</td>
                        <td className="table-td-standard">
                          {getBookingItemStatusName(service.item_status_id)}
                        </td>
                        <td className="table-td-standard text-right font-semibold">
                          {service.pvp_per_pax ? `${service.pvp_per_pax.toLocaleString()} ${currencyCode}` : 'N/A'}
                        </td>
                        <td className="table-td-standard">
                          {getCountryName(service.destination_id) || 'N/A'}
                        </td>
                        <td className="table-td-standard">
                          <div className="text-xs space-y-1">
                            {service.adult_count > 0 && (
                              <div>Adult ({service.adult_count})</div>
                            )}
                            {service.child_count > 0 && (
                              <div>Child ({service.child_count})</div>
                            )}
                            {service.infant_count > 0 && (
                              <div>Infant ({service.infant_count})</div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )) || (
                      <tr>
                        <td colSpan={6} className="table-td-standard py-8 text-center text-muted-foreground italic">No other services found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Invoices */}
          <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            <div className="bg-secondary/30 px-6 py-4 border-b border-border">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" /> Invoices
              </h3>
            </div>
            <div className="p-6">
              <div className="table-container">
                <table className="table-standard">
                  <thead className="table-head-standard">
                    <tr>
                      <th className="table-th-standard">Inv Number</th>
                      <th className="table-th-standard">Date</th>
                      <th className="table-th-standard text-right">Base</th>
                      <th className="table-th-standard text-right">VAT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="table-row-standard">
                        <td className="table-td-standard font-medium">{inv.invoice_number || 'PENDING'}</td>
                        <td className="table-td-standard text-muted-foreground">{formatDate(inv.invoice_date)}</td>
                        <td className="table-td-standard text-right font-medium">
                          {inv.booking_invoice_details?.reduce((acc: number, d: InvoiceDetail) => acc + (Number(d.tax_base) || 0), 0).toLocaleString()}
                        </td>
                        <td className="table-td-standard text-right font-medium text-primary">
                          {inv.booking_invoice_details?.reduce((acc: number, d: InvoiceDetail) => acc + (Number(d.vat) || 0), 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                    {invoices.length === 0 && (
                      <tr>
                        <td colSpan={4} className="table-td-standard py-8 text-center text-muted-foreground italic">No invoices found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
