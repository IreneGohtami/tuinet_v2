import { getCurrencies } from '../../reference-data-actions'
import { getModulePermissions } from '@/lib/rbac'
import { CreateCurrencyDialog } from './create-currency-dialog'
import { EditCurrencyDialog } from './edit-currency-dialog'
import { DeleteCurrencyDialog } from './delete-currency-dialog'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

import { CurrencySearch } from './currency-search'

export default async function CurrenciesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const resolvedSearchParams = await searchParams
  const currentPage = Number(resolvedSearchParams.page) || 1
  const searchQuery = resolvedSearchParams.search || ''
  const pageSize = 10

  const [{ data: currencies, count, error }, permissions] = await Promise.all([
    getCurrencies({ page: currentPage, pageSize, search: searchQuery }),
    getModulePermissions('settings')
  ])

  if (error) {
    return <div className="text-destructive p-4">Error loading currencies: {typeof error === 'string' ? error : 'Unknown error'}</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Currencies</h2>
          <p className="text-muted-foreground">Manage reference data for currencies.</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <CurrencySearch initialQuery={searchQuery} />
          {permissions.canCreate && <CreateCurrencyDialog />}
        </div>
      </div>

      <div className="rounded-md border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-secondary/50">
            <tr className="text-left text-muted-foreground uppercase text-xs tracking-wider">
              <th className="p-4 font-semibold">Code</th>
              <th className="p-4 font-semibold">Name</th>
              <th className="p-4 font-semibold text-center">Symbol</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {currencies.map((currency: any) => (
              <tr key={currency.id} className="hover:bg-secondary/10 transition-colors group">
                <td className="p-4 font-bold font-mono text-foreground">{currency.code}</td>
                <td className="p-4 text-foreground">{currency.name || '-'}</td>
                <td className="p-4 text-center font-medium">{currency.symbol || '-'}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2">
                    {permissions.canUpdate && <EditCurrencyDialog currency={currency} />}
                    {permissions.canDelete && <DeleteCurrencyDialog currency={currency} />}
                  </div>
                </td>
              </tr>
            ))}
            {currencies.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center">
                  <p className="text-muted-foreground">No currencies found matching your search.</p>
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
