
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Calendar,
  ExternalLink,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Globe,
  Plane,
  RefreshCw,
  Hotel,
  Map,
  Car
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown'
import { DatePicker } from '@/components/ui/date-picker'
import { StatusBadge } from '@/components/ui/status-badge'
import { useTransition } from 'react'

interface Booking {
  id: number
  locator: string
  booking_reference: string | null
  created_at: string
  total_amount: number
  status_id: number
  admin_status: string
  currency_id: number
  sales_channel_value: string | null
  passenger_email: string
  passenger_name: string
  region_code: string | null
  booking_flights?: any[]
  booking_hotels?: any[]
  booking_tours?: any[]
  booking_transfers?: any[]
}

interface ReferenceItem {
  id: string | number
  code: string
  name?: string
  symbol?: string
}

interface ReferenceData {
  airlines: ReferenceItem[]
  regions: ReferenceItem[]
  currencies: ReferenceItem[]
  bookingStatuses: ReferenceItem[]
}

interface BookingTableProps {
  initialBookings: Booking[]
  totalCount: number
  pageSize: number
  currentPage: number
  referenceData: ReferenceData
  activeFilters: {
    bookingReference?: string
    dateFrom?: string
    dateTo?: string
    airlines?: string[]
    regions?: string[]
    currencies?: string[]
    bookingStatuses?: string[]
    customerEmail?: string
  }
}

export function BookingTable({
  initialBookings,
  totalCount,
  pageSize,
  currentPage,
  referenceData,
  activeFilters
}: BookingTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Local state for filters being edited
  const [filters, setFilters] = useState({
    bookingReference: activeFilters.bookingReference || '',
    dateFrom: activeFilters.dateFrom || '',
    dateTo: activeFilters.dateTo || '',
    airlines: activeFilters.airlines || [],
    regions: activeFilters.regions || [],
    currencies: activeFilters.currencies || [],
    bookingStatuses: activeFilters.bookingStatuses || [],
    customerEmail: activeFilters.customerEmail || ''
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  const handlePageChange = (page: number) => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', page.toString())
      router.push(`?${params.toString()}`)
    })
  }

  const applyFilters = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    startTransition(() => {

      const params = new URLSearchParams()

      if (filters.bookingReference) params.set('ref', filters.bookingReference)
      if (filters.dateFrom) params.set('from', filters.dateFrom)
      if (filters.dateTo) params.set('to', filters.dateTo)
      if (filters.customerEmail) params.set('email', filters.customerEmail)

      filters.airlines.forEach(a => params.append('airlines', a))
      filters.regions.forEach(r => params.append('regions', r))
      filters.currencies.forEach(c => params.append('currencies', c))
      filters.bookingStatuses.forEach(s => params.append('bookingStatuses', s))

      params.set('page', '1')
      router.push(`?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    startTransition(() => {
      setFilters({
        bookingReference: '',
        dateFrom: '',
        dateTo: '',
        airlines: [],
        regions: [],
        currencies: [],
        bookingStatuses: [],
        customerEmail: ''
      })
      router.push('/bookings')
    })
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex w-full max-w-2xl gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border transition-all",
              showFilters || Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : !!v)
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background border-border text-foreground hover:bg-secondary"
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            {(filters.airlines.length > 0 || filters.regions.length > 0 || filters.currencies.length > 0 || filters.bookingStatuses.length > 0) && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
                {filters.airlines.length + filters.regions.length + filters.currencies.length + filters.bookingStatuses.length}
              </span>
            )}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground whitespace-nowrap">
            Total: <span className="font-semibold text-foreground">{totalCount}</span> bookings
          </div>
          <button
            onClick={() => startTransition(() => router.refresh())}
            disabled={isPending}
            className="btn-action h-8 w-8 text-muted-foreground hover:text-primary transition-all active:scale-95"
            title="Refresh bookings"
          >
            <RefreshCw className={cn("h-4 w-4", isPending && "animate-spin text-primary")} />
          </button>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="p-6 bg-card border border-border rounded-lg shadow-sm space-y-6 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Row 1: ID, Dates */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Booking Reference / Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Ref or ID..."
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary h-10"
                  value={filters.bookingReference}
                  onChange={(e) => setFilters(prev => ({ ...prev, bookingReference: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Date Range (From - To)</label>
              <div className="flex gap-2">
                <DatePicker
                  value={filters.dateFrom}
                  onChange={(val) => setFilters(prev => ({ ...prev, dateFrom: val }))}
                  placeholder="From Date"
                />
                <DatePicker
                  value={filters.dateTo}
                  onChange={(val) => setFilters(prev => ({ ...prev, dateTo: val }))}
                  placeholder="To Date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Customer Email</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="customer@example.com"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary h-10"
                  value={filters.customerEmail}
                  onChange={(e) => setFilters(prev => ({ ...prev, customerEmail: e.target.value }))}
                />
              </div>
            </div>


            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Sales Channel (Airline)</label>
              <MultiSelectDropdown
                label="Sales Channel"
                options={referenceData.airlines}
                selectedValues={filters.airlines}
                onChange={(values) => setFilters(prev => ({ ...prev, airlines: values }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Regions</label>
                <MultiSelectDropdown
                  label="Regions"
                  options={referenceData.regions}
                  selectedValues={filters.regions}
                  onChange={(values) => setFilters(prev => ({ ...prev, regions: values }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Currencies</label>
                <MultiSelectDropdown
                  label="Currencies"
                  options={referenceData.currencies}
                  selectedValues={filters.currencies}
                  onChange={(values) => setFilters(prev => ({ ...prev, currencies: values }))}
                  valueKey="id"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Booking Status</label>
              <MultiSelectDropdown
                label="Booking Status"
                options={referenceData.bookingStatuses}
                selectedValues={filters.bookingStatuses}
                onChange={(values) => setFilters(prev => ({ ...prev, bookingStatuses: values }))}
                valueKey="id"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              onClick={clearFilters}
              className="btn-secondary"
            >
              Reset All
            </button>
            <button
              onClick={() => applyFilters()}
              className="btn-primary"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="table-container">
        {isPending && (
          <div className="absolute inset-0 z-20 bg-background/40 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-lg shadow-xl">
              <RefreshCw className="h-6 w-6 text-primary animate-spin" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Updating results...</span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="table-standard min-w-[1000px]">
            <thead className="table-head-standard">
              <tr>
                <th className="table-th-standard">Booking Ref</th>
                <th className="table-th-standard">Customer</th>
                <th className="table-th-standard">Items</th>
                <th className="table-th-standard">Details</th>
                <th className="table-th-standard">Date</th>
                <th className="table-th-standard text-right">Amount</th>
                <th className="table-th-standard text-center">Status</th>
                <th className="table-th-standard text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {initialBookings.map((booking) => (
                <tr key={booking.id} className="table-row-standard group">
                  <td
                    className="table-td-standard cursor-pointer"
                    onClick={() => router.push(`/bookings/${booking.id}`)}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors underline-offset-4 group-hover:underline">
                        {booking.booking_reference || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="table-td-standard">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{booking.passenger_name}</span>
                      <span className="text-xs text-muted-foreground">{booking.passenger_email}</span>
                    </div>
                  </td>
                  <td className="table-td-standard">
                    <div className="flex items-center gap-1.5">
                      {booking.booking_flights && booking.booking_flights.length > 0 && (
                        <span title="Flight">
                          <Plane className="h-4 w-4 text-blue-500" />
                        </span>
                      )}
                      {booking.booking_hotels && booking.booking_hotels.length > 0 && (
                        <span title="Hotel">
                          <Hotel className="h-4 w-4 text-green-500" />
                        </span>
                      )}
                      {booking.booking_tours && booking.booking_tours.length > 0 && (
                        <span title="Tour/Activity">
                          <Map className="h-4 w-4 text-orange-500" />
                        </span>
                      )}
                      {booking.booking_transfers && booking.booking_transfers.length > 0 && (
                        <span title="Transfer">
                          <Car className="h-4 w-4 text-purple-500" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="table-td-standard">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Plane className="h-3 w-3" />
                        Channel: <span className="text-foreground font-medium">{booking.sales_channel_value || 'Direct'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        Region: <span className="text-foreground font-medium">{booking.region_code || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="table-td-standard">
                    <div className="flex flex-col text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {(() => {
                          const date = new Date(booking.created_at)
                          const d = String(date.getDate()).padStart(2, '0')
                          const m = String(date.getMonth() + 1).padStart(2, '0')
                          const y = date.getFullYear()
                          return `${y}/${m}/${d}`
                        })()}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60 ml-4.5">
                        {new Date(booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>
                  <td className="table-td-standard text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-foreground">
                        {booking.total_amount.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                        {referenceData.currencies.find(c => c.id.toString() === booking.currency_id.toString())?.code || ''}
                      </span>
                    </div>
                  </td>
                  <td className="table-td-standard text-center">
                    <div className="flex flex-col gap-1">
                      <StatusBadge statusId={booking.status_id} bookingStatuses={referenceData.bookingStatuses} />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {booking.admin_status || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="table-td-standard text-right">
                    <button
                      onClick={() => router.push(`/bookings/${booking.id}`)}
                      className="p-2 hover:bg-primary/10 rounded-md transition-colors group"
                      title="View details"
                    >
                      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </button>
                  </td>
                </tr>
              ))}
              {initialBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-20 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-4 bg-secondary/20 rounded-full">
                        <Search className="h-10 w-10 text-muted-foreground/20" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xl font-semibold text-foreground">No bookings found</p>
                        <p className="text-sm">Try adjusting your filters or search terms.</p>
                      </div>
                      <button
                        onClick={clearFilters}
                        className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:underline"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium">{Math.min(currentPage * pageSize, totalCount)}</span> of <span className="font-medium">{totalCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center px-4 py-2 bg-secondary/50 rounded-md text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md hover:bg-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
