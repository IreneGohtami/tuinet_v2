import { getBookingStatuses } from '../../reference-data-actions'
import { getModulePermissions } from '@/lib/rbac'
import { CreateBookingStatusDialog } from './create-booking-status-dialog'
import { EditBookingStatusDialog } from './edit-booking-status-dialog'
import { DeleteBookingStatusDialog } from './delete-booking-status-dialog'
import { BookingStatusSearch } from './booking-status-search'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default async function BookingStatusesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const currentPage = Number(resolvedSearchParams.page) || 1
  const searchQuery = resolvedSearchParams.search || ''
  const pageSize = 10

  const [{ data: statuses, count, error }, permissions] = await Promise.all([
    getBookingStatuses({ page: currentPage, pageSize, search: searchQuery }),
    getModulePermissions('settings')
  ])

  if (error) {
    return <div className="text-destructive p-4">Error loading booking statuses: {typeof error === 'string' ? error : 'Unknown error'}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Booking Statuses</h2>
          <p className="text-muted-foreground">Manage reference data for booking statuses.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <BookingStatusSearch initialQuery={searchQuery} />
          {permissions.canCreate && <CreateBookingStatusDialog />}
        </div>
      </div>

      <div className="table-container">
        <table className="table-standard">
          <thead className="table-head-standard">
            <tr>
              <th className="table-th-standard">Code</th>
              <th className="table-th-standard">Name</th>
              <th className="table-th-standard text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map((status: any) => (
              <tr key={status.id} className="table-row-standard">
                <td className="table-td-standard font-bold font-mono text-primary">{status.code}</td>
                <td className="table-td-standard text-foreground">{status.name || '-'}</td>
                <td className="table-td-standard text-right">
                  <div className="flex justify-end gap-2">
                    {permissions.canUpdate && <EditBookingStatusDialog status={status} />}
                    {permissions.canDelete && <DeleteBookingStatusDialog status={status} />}
                  </div>
                </td>
              </tr>
            ))}
            {statuses.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <p className="text-muted-foreground">No booking statuses found matching your search.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {count > pageSize && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{(currentPage - 1) * pageSize + 1}</span> to <span className="font-medium text-foreground">{Math.min(currentPage * pageSize, count)}</span> of <span className="font-medium text-foreground">{count}</span> results
          </p>
          <div className="flex items-center gap-2">
            <Link
              href={`?page=${currentPage - 1}${searchQuery ? `&search=${searchQuery}` : ''}`}
              className={cn(
                "btn-secondary h-8 px-2 flex items-center gap-1",
                currentPage <= 1 && "pointer-events-none opacity-50"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Link>
            <span className="text-sm font-medium px-2">Page {currentPage} of {Math.ceil(count / pageSize)}</span>
            <Link
              href={`?page=${currentPage + 1}${searchQuery ? `&search=${searchQuery}` : ''}`}
              className={cn(
                "btn-secondary h-8 px-2 flex items-center gap-1",
                currentPage >= Math.ceil(count / pageSize) && "pointer-events-none opacity-50"
              )}
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
