
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { useTransition } from 'react'

export function CurrencySearch({ initialQuery }: { initialQuery: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(initialQuery)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (query === initialQuery) return

    const timer = setTimeout(() => {
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString())
        if (query) {
          params.set('search', query)
        } else {
          params.delete('search')
        }
        params.set('page', '1') // Reset to page 1 on new search
        router.push(`?${params.toString()}`)
      })
    }, 300)

    return () => clearTimeout(timer)
  }, [query, initialQuery, router, searchParams])

  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search code or name..."
        className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      />
      {isPending && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
        </div>
      )}
    </div>
  )
}
