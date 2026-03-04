import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  statusId: number
  bookingStatuses: Array<{ id: string | number; name?: string }>
  size?: 'sm' | 'md'
}

export function StatusBadge({ statusId, bookingStatuses, size = 'sm' }: StatusBadgeProps) {
  const status = bookingStatuses.find(s => s.id.toString() === statusId.toString())
  if (!status) return null

  const code = status.id
  let colorClass = 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'

  if (code === 2025) {
    colorClass = 'bg-emerald-500/10 text-emerald-500'
  } else if (code === 2030) {
    colorClass = 'bg-yellow-500/10 text-yellow-500'
  } else if (code === 2026 || code === 2477) {
    colorClass = 'bg-destructive/10 text-destructive'
  }

  const sizeClass = size === 'md' 
    ? 'px-4 py-1.5 text-sm font-semibold' 
    : 'px-2.5 py-0.5 text-xs font-medium'

  return (
    <span className={cn("inline-flex items-center rounded-full shadow-sm whitespace-nowrap", colorClass, sizeClass)}>
      {status.name}
    </span>
  )
}