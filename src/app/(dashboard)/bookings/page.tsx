import { Suspense } from 'react'
import { getBookings, getReferenceData } from './actions'
import { BookingTable } from './booking-table'
import { Loader2 } from 'lucide-react'

export const metadata = {
  title: 'Bookings | TUINET V2',
  description: 'Manage and monitor your airline bookings.',
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function BookingsPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const page = Number(resolvedParams.page) || 1
  const search = typeof resolvedParams.search === 'string' ? resolvedParams.search : ''
  const pageSize = 10

  // Filters from URL
  const bookingReference = typeof resolvedParams.ref === 'string' ? resolvedParams.ref : undefined
  const dateFrom = typeof resolvedParams.from === 'string' ? resolvedParams.from : undefined
  const dateTo = typeof resolvedParams.to === 'string' ? resolvedParams.to : undefined

  const getArrayParam = (param: string | string[] | undefined) => {
    if (!param) return undefined
    return Array.isArray(param) ? param : [param]
  }

  const airlines = getArrayParam(resolvedParams.airlines)
  const regions = getArrayParam(resolvedParams.regions)
  const currencies = getArrayParam(resolvedParams.currencies)
  const bookingStatuses = getArrayParam(resolvedParams.bookingStatuses)
  const customerEmail = typeof resolvedParams.email === 'string' ? resolvedParams.email : undefined

  // Fetch bookings and reference data in parallel
  const [bookingsData, refData] = await Promise.all([
    getBookings({
      page,
      pageSize,
      searchQuery: search,
      bookingReference,
      dateFrom,
      dateTo,
      airlines,
      regions,
      currencies,
      bookingStatuses,
      customerEmail
    }),
    getReferenceData()
  ])

  const { data: initialBookings, count: totalCount, error } = bookingsData

  if (error) {
    return (
      <div className="p-4 rounded-md bg-destructive/10 text-destructive">
        Error loading bookings: {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Manage Bookings</h2>
        <p className="text-muted-foreground">Monitor and manage all bookings in one central view.</p>
      </div>

      <Suspense fallback={
        <div className="flex items-center justify-center p-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <BookingTable
          initialBookings={initialBookings}
          totalCount={totalCount || 0}
          pageSize={pageSize}
          currentPage={page}
          searchQuery={search}
          referenceData={refData}
          activeFilters={{
            bookingReference,
            dateFrom,
            dateTo,
            airlines,
            regions,
            currencies,
            bookingStatuses,
            customerEmail
          }}
        />
      </Suspense>
    </div>
  )
}
