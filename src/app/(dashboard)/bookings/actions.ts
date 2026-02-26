
'use server'

import { createClient } from '@/lib/supabase/server'

export interface BookingFilters {
  page?: number
  pageSize?: number
  searchQuery?: string
  bookingReferenceId?: string
  dateFrom?: string
  dateTo?: string
  airlines?: string[]
  regions?: string[]
  currencies?: string[]
  customerEmail?: string
}

export interface BookingRow {
  id: number
  booking_reference_id: string | null
  locator: string
  created_at: string
  total_amount: number
  status_id: number
  currency_id: number
  region_code: string | null
  sales_channel_value: string | null
  reference: string | null
  booking_passengers?: {
    email: string | null
    first_name: string | null
    last_name1: string | null
  }[]
  booking_flights?: {
    airline_locator: string | null
  }[]
}

export async function getBookings({
  page = 1,
  pageSize = 10,
  searchQuery = '',
  bookingReferenceId,
  dateFrom,
  dateTo,
  airlines,
  regions,
  currencies,
  customerEmail
}: BookingFilters) {
  const supabase = await createClient()

  // Base query with joins
  // By default we use left join (no !inner) so bookings without passengers still show
  // But if a filter is applied to a joined table, we must use !inner for Supabase to filter correctly
  let passengerJoin = 'booking_passengers(email, first_name, last_name1)'
  let flightJoin = 'booking_flights(airline_locator)'

  if (customerEmail) {
    passengerJoin = 'booking_passengers!inner(email, first_name, last_name1)'
  }

  // Airlines filter is now Sales Channel filter, which is on the bookings table directly
  // flightJoin remains left join unless we need to filter by something else in flights later

  const selectStr = `*, ${passengerJoin}, ${flightJoin}`

  let query = supabase
    .from('bookings')
    .select(selectStr, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (searchQuery) {
    query = query.or(`booking_reference_id.ilike.%${searchQuery}%,reference.ilike.%${searchQuery}%`)
  }

  if (bookingReferenceId) {
    query = query.or(`booking_reference_id.ilike.%${bookingReferenceId}%,reference.ilike.%${bookingReferenceId}%`)
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

  const [airlinesRes, regionsRes, currenciesRes] = await Promise.all([
    supabase.from('settings_airlines').select('id, code, name'),
    supabase.from('settings_regions').select('id, code'),
    supabase.from('settings_currencies').select('id, code, name, symbol')
  ])

  return {
    airlines: airlinesRes.data || [],
    regions: regionsRes.data || [],
    currencies: currenciesRes.data || []
  }
}

export async function getBookingById(id: number) {
  const supabase = await createClient()

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
    supabase.from('booking_flights').select('*').eq('booking_id', id),
    supabase.from('booking_hotels').select('*').eq('booking_id', id),
    supabase.from('booking_tours').select('*').eq('booking_id', id),
    supabase.from('booking_transfers').select('*').eq('booking_id', id),
    supabase.from('booking_other_services').select('*').eq('booking_id', id),
    supabase.from('booking_invoices').select('*, booking_invoice_details(*)').eq('booking_id', id),
    supabase.from('booking_pvp_details').select('*').eq('booking_id', id)
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
