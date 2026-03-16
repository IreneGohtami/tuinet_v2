'use server'

import { createClient } from '@/lib/supabase/server'

export interface BookingFilters {
  page?: number
  pageSize?: number
  bookingReference?: string
  dateFrom?: string
  dateTo?: string
  airlines?: string[]
  regions?: string[]
  currencies?: string[]
  bookingStatuses?: string[]
  customerEmail?: string
}

export interface BookingRow {
  id: number
  booking_reference: string | null
  locator: string
  created_at: string
  total_amount: number
  status_id: number
  admin_status: string
  currency_id: number
  region_code: string | null
  sales_channel_value: string | null
  booking_passengers?: {
    email: string | null
    first_name: string | null
    last_name1: string | null
  }[]
  booking_flights?: any[]
  booking_hotels?: any[]
  booking_tours?: any[]
  booking_transfers?: any[]
}

export async function getBookings({
  page = 1,
  pageSize = 10,
  bookingReference,
  dateFrom,
  dateTo,
  airlines,
  regions,
  currencies,
  bookingStatuses,
  customerEmail
}: BookingFilters) {
  const supabase = await createClient()

  // Base query with joins
  // By default we use left join (no !inner) so bookings without passengers still show
  // But if a filter is applied to a joined table, we must use !inner for Supabase to filter correctly
  let passengerJoin = 'booking_passengers(email, first_name, last_name1)'
  let flightJoin = 'booking_flights(id)'
  let hotelJoin = 'booking_hotels(id)'
  let tourJoin = 'booking_tours(id)'
  let transferJoin = 'booking_transfers(id)'

  if (customerEmail) {
    passengerJoin = 'booking_passengers!inner(email, first_name, last_name1)'
  }

  const selectStr = `*, ${passengerJoin}, ${flightJoin}, ${hotelJoin}, ${tourJoin}, ${transferJoin}`

  let query = supabase
    .from('bookings')
    .select(selectStr, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (bookingReference) {
    query = query.or(`booking_reference.ilike.%${bookingReference}%`)
  }

  if (dateFrom) {
    query = query.gte('created_at', dateFrom)
  }

  if (dateTo) {
    query = query.lte('created_at', dateTo)
  }

  if (regions && regions.length > 0) {
    query = query.in('region_code', regions)
  }

  if (currencies && currencies.length > 0) {
    query = query.in('currency_id', currencies)
  }

  if (airlines && airlines.length > 0) {
    query = query.in('sales_channel_value', airlines)
  }

  if (bookingStatuses && bookingStatuses.length > 0) {
    query = query.in('status_id', bookingStatuses)
  }

  if (customerEmail) {
    query = query.ilike('booking_passengers.email', `%${customerEmail}%`)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await query.range(from, to)

  if (error) {
    console.error('Error fetching bookings:', error)
    return { data: [], count: 0, error: error.message }
  }

  const transformedData = (data as unknown as BookingRow[]).map((booking) => ({
    ...booking,
    passenger_email: booking.booking_passengers?.[0]?.email || 'N/A',
    passenger_name: booking.booking_passengers?.[0]
      ? `${booking.booking_passengers[0].first_name} ${booking.booking_passengers[0].last_name1}`
      : 'N/A'
  }))

  return { data: transformedData, count: count || 0 }
}

export async function getReferenceData() {
  const supabase = await createClient()

  const [airlinesRes, regionsRes, currenciesRes, bookingStatusesRes, bookingItemStatusesRes, countriesRes, suppliersRes] = await Promise.all([
    supabase.from('setting_airlines').select('id, code, name').order('code', { ascending: true }),
    supabase.from('setting_regions').select('id, code').order('code', { ascending: true }),
    supabase.from('setting_currencies').select('id, code, symbol').order('code', { ascending: true }),
    supabase.from('setting_booking_statuses').select('id, code, name').order('name', { ascending: true }),
    supabase.from('setting_booking_item_statuses').select('id, code, name').order('name', { ascending: true }),
    supabase.from('setting_countries').select('id, name').order('name', { ascending: true }),
    supabase.from('inventory_suppliers').select('id, cif, provider_code').order('provider_code', { ascending: true })
  ])

  return {
    airlines: airlinesRes.data || [],
    regions: regionsRes.data || [],
    currencies: currenciesRes.data || [],
    bookingStatuses: bookingStatusesRes.data || [],
    bookingItemStatuses: bookingItemStatusesRes.data || [],
    countries: countriesRes.data || [],
    suppliers: suppliersRes.data || []
  }
}

export async function getBookingById(id: number) {
  const supabase = await createClient()

  //const flightsRes = await supabase.rpc('get_grouped_booking_flights', { booking_id_param: id })

  const [
    bookingRes,
    passengersRes,
    flightsRes,
    hotelsRes,
    toursRes,
    transfersRes,
    otherServicesRes,
    invoicesRes,
    pvpDetailsRes
  ] = await Promise.all([
    supabase.from('bookings').select('*').eq('id', id).single(),
    supabase.from('booking_passengers').select('*').eq('booking_id', id),
    supabase.from('booking_flights').select('*').eq('booking_id', id).order('id', { ascending: true }),
    supabase.from('booking_hotels').select('*').eq('booking_id', id),
    supabase.from('booking_tours').select('*').eq('booking_id', id),
    supabase.from('booking_transfers').select('*').eq('booking_id', id),
    supabase.from('booking_other_services').select('*').eq('booking_id', id),
    supabase.from('booking_invoices').select('*, booking_invoice_details(*)').eq('booking_id', id),
    supabase.from('booking_pvp_details').select('*').eq('booking_id', id).order('id', { ascending: true })
  ])

  if (bookingRes.error) {
    console.error(`Error fetching booking ${id}:`, bookingRes.error)
    return { data: null, error: bookingRes.error.message }
  }

  return {
    data: {
      ...bookingRes.data,
      passengers: passengersRes.data || [],
      flights: flightsRes.data || [],
      hotels: hotelsRes.data || [],
      tours: toursRes.data || [],
      transfers: transfersRes.data || [],
      other_services: otherServicesRes.data || [],
      invoices: invoicesRes.data || [],
      pvp_details: pvpDetailsRes.data || []
    }
  }
}

export interface PvpDetailUpdatePayload {
  name?: string | null
  component?: string | null
  direction?: string | null
  passenger_count?: number | null
  pvp_per_pax?: number | null
  tax_type?: string | null
  tax_rate?: string | null
  tax_amount?: number | null
  net_commissionable?: string | null
  is_invoiced?: boolean | null
}

export interface ComponentUpdatePayload {
  id: number
  type: string
  fields: Record<string, any>
}

export async function updatePvpDetailWithComponents(
  pvpId: number,
  pvpPayload: PvpDetailUpdatePayload,
  componentUpdates?: ComponentUpdatePayload[]
) {
  const supabase = await createClient()

  // 1. Update PVP Detail
  if (Object.keys(pvpPayload).length > 0) {
    const { error: pvpError } = await supabase
      .from('booking_pvp_details')
      .update(pvpPayload)
      .eq('id', pvpId)

    if (pvpError) {
      console.error(`Error updating PVP Detail ${pvpId}:`, pvpError)
      return { success: false, error: pvpError.message }
    }
  }

  // 2. Loop through componentUpdates and update respective tables
  if (componentUpdates && componentUpdates.length > 0) {
    for (const comp of componentUpdates) {
      let tableName = ''
      if (comp.type === 'Flight') tableName = 'booking_flights'
      else if (comp.type === 'Hotel') tableName = 'booking_hotels'
      else if (comp.type === 'Tour') tableName = 'booking_tours'
      else if (comp.type === 'Transfer') tableName = 'booking_transfers'
      else if (comp.type === 'Others') tableName = 'booking_other_services'

      if (tableName) {
        const { error: compError } = await supabase
          .from(tableName)
          .update(comp.fields)
          .eq('id', comp.id)

        if (compError) {
          console.error(`Error updating ${tableName} ${comp.id}:`, compError)
        }
      }
    }
  }

  return { success: true }
}

export interface FlightUpdatePayload {
  description?: string | null
  pnr_code?: string | null
  cabin_class?: string | null
  departure_terminal?: string | null
  arrival_terminal?: string | null
  item_status_id?: number | null
  destination_id?: number | null
  adult_count?: number | null
  child_count?: number | null
  infant_count?: number | null
  adult_baggage?: string | null
  child_baggage?: string | null
  infant_baggage?: string | null
  cost_per_pax?: number | null
  pvp_per_pax?: number | null
  price_with_taxes?: number | null
  cost_currency_id?: number | null
  cost_currency_exchange_rate?: number | null
  settlement_currency_id?: number | null
  settlement_currency_exchange_rate?: number | null
  supplier_id?: number | null
  is_waitlisted?: boolean | null
}

export async function updateBookingFlight(id: number, payload: FlightUpdatePayload) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('booking_flights')
    .update(payload)
    .eq('id', id)

  if (error) {
    console.error(`Error updating booking flight ${id}:`, error)
    return { success: false, error: error.message }
  }
  return { success: true }
}
export interface HotelUpdatePayload {
  description?: string | null
  check_in_date?: string | null
  check_out_date?: string | null
  item_status_id?: number | null
  hotel_contract_id?: number | null
  hotel_feature_id?: number | null
  board_basis_id?: number | null
  adult_count?: number | null
  child_count?: number | null
  infant_count?: number | null
  room_count?: number | null
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

export async function updateBookingHotel(id: number, payload: HotelUpdatePayload) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('booking_hotels')
    .update(payload)
    .eq('id', id)

  if (error) {
    console.error(`Error updating booking hotel ${id}:`, error)
    return { success: false, error: error.message }
  }
  return { success: true }
}
