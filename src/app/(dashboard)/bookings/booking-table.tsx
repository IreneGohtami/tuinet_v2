
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Loader2,
  Calendar,
  ExternalLink,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Globe,
  DollarSign,
  Monitor,
  RefreshCw
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown'
import { useTransition } from 'react'

interface Booking {
  id: number
  locator: string
  booking_reference_id: string | null
  reference: string | null
  created_at: string
  total_amount: number
  status_id: number
  currency_id: number
  sales_channel_value: string | null
  passenger_email: string
  passenger_name: string
  region_code: string | null
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
}

interface BookingTableProps {
  initialBookings: Booking[]
  totalCount: number
  pageSize: number
  currentPage: number
  searchQuery: string
  referenceData: ReferenceData
  activeFilters: {
    bookingReferenceId?: string
    dateFrom?: string
    dateTo?: string
    airlines?: string[]
    regions?: string[]
    currencies?: string[]
    customerEmail?: string
  }
}

export function BookingTable({
  initialBookings,
  totalCount,
  pageSize,
  currentPage,
  searchQuery: initialSearchQuery,
  referenceData,
  activeFilters
}: BookingTableProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showFilters, setShowFilters] = useState(false)
  const [isPending, startTransition] = useTransition()

  // Local state for filters being edited
  const [filters, setFilters] = useState({
    bookingReferenceId: activeFilters.bookingReferenceId || initialSearchQuery || '',
    dateFrom: activeFilters.dateFrom || '',
    dateTo: activeFilters.dateTo || '',
    airlines: activeFilters.airlines || [],
    regions: activeFilters.regions || [],
    currencies: activeFilters.currencies || [],
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
      // Combined search / reference
      if (filters.bookingReferenceId) params.set('ref', filters.bookingReferenceId)

      if (filters.dateFrom) params.set('from', filters.dateFrom)
      if (filters.dateTo) params.set('to', filters.dateTo)
      if (filters.customerEmail) params.set('email', filters.customerEmail)

      filters.airlines.forEach(a => params.append('airlines', a))
      filters.regions.forEach(r => params.append('regions', r))
      filters.currencies.forEach(c => params.append('currencies', c))

      params.set('page', '1')
      router.push(`?${params.toString()}`)
    })
  }

  const clearFilters = () => {
    startTransition(() => {
      setFilters({
        bookingReferenceId: '',
        dateFrom: '',
        dateTo: '',
        airlines: [],
        regions: [],
        currencies: [],
        customerEmail: ''
      })
      router.push('/bookings')
    })
  }

  const toggleMultiSelect = (type: 'airlines' | 'regions' | 'currencies', value: string) => {
    setFilters(prev => {
      const current = [...prev[type]] as string[]
      const index = current.indexOf(value)
      if (index > -1) {
        current.splice(index, 1)
      } else {
        current.push(value)
      }
      return { ...prev, [type]: current }
    })
  }

  const getStatusBadge = (statusId: number) => {
    const statuses: Record<number, { label: string, color: string }> = {
      1: { label: 'Active', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
      2: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' },
      3: { label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
    }
    const status = statuses[statusId] || { label: 'Unknown', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' }
    return (
      <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", status.color)}>
        {status.label}
      </span>
    )
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
            {(filters.airlines.length > 0 || filters.regions.length > 0 || filters.currencies.length > 0) && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary text-primary-foreground rounded-full">
                {filters.airlines.length + filters.regions.length + filters.currencies.length}
              </span>
            )}
            {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        <div className="text-sm text-muted-foreground whitespace-nowrap">
          Total: <span className="font-semibold text-foreground">{totalCount}</span> bookings
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
                  className="w-full pl-9 pr-3 py-2 text-sm bg-secondary/20 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary h-10"
                  value={filters.bookingReferenceId}
                  onChange={(e) => setFilters(prev => ({ ...prev, bookingReferenceId: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Date Range (From - To)</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm bg-secondary/20 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary h-10"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
                <input
                  type="date"
                  className="w-full px-3 py-2 text-sm bg-secondary/20 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary h-10"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
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
                  className="w-full pl-9 pr-3 py-2 text-sm bg-secondary/20 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary h-10"
                  value={filters.customerEmail}
                  onChange={(e) => setFilters(prev => ({ ...prev, customerEmail: e.target.value }))}
                />
              </div>
            </div>


            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-foreground">Sales Channel</label>
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
                />
              </div>
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
      <div className="relative rounded-md border border-border bg-card shadow-sm overflow-hidden">
        {isPending && (
          <div className="absolute inset-0 z-20 bg-background/40 backdrop-blur-[1px] flex items-center justify-center animate-in fade-in duration-200">
            <div className="flex flex-col items-center gap-2 p-4 bg-card border border-border rounded-lg shadow-xl">
              <RefreshCw className="h-6 w-6 text-primary animate-spin" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">Updating results...</span>
            </div>
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[1000px]">
            <thead className="border-b border-border bg-secondary/30">
              <tr className="text-left text-muted-foreground select-none">
                <th className="p-4 font-semibold">Booking Ref</th>
                <th className="p-4 font-semibold">Customer</th>
                <th className="p-4 font-semibold">Details</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold text-right">Amount</th>
                <th className="p-4 font-semibold text-center">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {initialBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-secondary/40 transition-colors group">
                  <td
                    className="p-4 cursor-pointer"
                    onClick={() => router.push(`/bookings/${booking.id}`)}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold text-base text-foreground group-hover:text-primary transition-colors underline-offset-4 group-hover:underline">
                        {booking.booking_reference_id || booking.reference || 'None'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-medium text-foreground">{booking.passenger_name}</span>
                      <span className="text-xs text-muted-foreground">{booking.passenger_email}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Monitor className="h-3 w-3" />
                        Channel: <span className="text-foreground font-medium">{booking.sales_channel_value || 'Direct'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" />
                        Region: <span className="text-foreground font-medium">{booking.region_code || 'N/A'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(booking.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground/60 ml-4.5">
                        {new Date(booking.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-foreground">
                        {booking.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                        {referenceData.currencies.find(c => c.id.toString() === booking.currency_id.toString())?.symbol || booking.currency_id} {referenceData.currencies.find(c => c.id.toString() === booking.currency_id.toString())?.code || ''}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {getStatusBadge(booking.status_id)}
                  </td>
                  <td className="p-4 text-right">
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
                  <td colSpan={7} className="p-20 text-center text-muted-foreground">
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
