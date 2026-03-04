
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
  ArrowRight
} from 'lucide-react'
import { StatusBadge } from '@/components/ui/status-badge'

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
  provider_locator?: string
  price_with_taxes?: number
  adult_count: number
  child_count: number
  infant_count: number
  departure_terminal?: string
  arrival_terminal?: string
  airline_locator?: string
}

interface HotelService {
  id: number
  description?: string
  check_in_date: string
  check_out_date: string
  pvp_per_pax?: number
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
  const invoices = booking.invoices as Invoice[]

  const getCountryName = (countryId?: number) => {
    if (!countryId) return null
    return refData.countries.find(c => c.id === countryId)?.name
  }

  const formatDate = (dateInput: string | Date) => {
    if (!dateInput) return 'N/A'
    const date = new Date(dateInput)
    if (isNaN(date.getTime())) return 'N/A'
    const d = String(date.getDate()).padStart(2, '0')
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const y = date.getFullYear()
    return `${d}/${m}/${y}`
  }

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
          {/* Flights */}
          {flights.length > 0 && (
            <section className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
              <div className="bg-secondary/30 px-6 py-4 flex items-center justify-between border-b border-border">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Plane className="h-5 w-5 text-primary" /> Flights
                </h3>
                <span className="text-xs font-semibold bg-background px-2 py-1 rounded-md border border-border">
                  {flights.length} Service{flights.length > 1 ? 's' : ''}
                </span>
              </div>
              <div className="p-6 space-y-6">
                {flights.map((f) => (
                  <div key={f.id} className="border border-border/60 rounded-xl p-5 hover:bg-secondary/5 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Plane className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-lg">{f.description || 'Flight Service'}</p>
                          <p className="text-xs text-muted-foreground uppercase font-medium">Provider Ref: <span className="text-foreground">{f.provider_locator || 'N/A'}</span></p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-extrabold text-primary">{f.price_with_taxes?.toLocaleString()} {booking.currency_id}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Service Price</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4 pt-4 border-t border-border/40">
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">Adults / Kids / Inf</p>
                        <p className="font-semibold">{f.adult_count} / {f.child_count} / {f.infant_count}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">Departure</p>
                        <p className="font-semibold">{f.departure_terminal || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">Arrival</p>
                        <p className="font-semibold">{f.arrival_terminal || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest mb-1">Airline Ref</p>
                        <p className="font-semibold">{f.airline_locator || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
              </div>
              <div className="p-6 space-y-6">
                {hotels.map((h) => (
                  <div key={h.id} className="border border-border/60 rounded-xl p-5 hover:bg-secondary/5 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg">{h.description || 'Hotel Service'}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(h.check_in_date)}</span>
                          <ArrowRight className="h-3 w-3" />
                          <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> {formatDate(h.check_out_date)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{h.pvp_per_pax?.toLocaleString()} {booking.currency_id}</p>
                        <p className="text-[10px] text-muted-foreground">Per PAX</p>
                      </div>
                    </div>
                  </div>
                ))}
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
