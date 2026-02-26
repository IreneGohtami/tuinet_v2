
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function SiteHeaderNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <nav className="flex items-center gap-6 text-sm">
      <Link
        href="/dashboard"
        className={`relative py-1 transition-colors ${isActive('/dashboard')
          ? 'text-foreground font-medium'
          : 'text-foreground/60 hover:text-foreground/80'
          }`}
      >
        Dashboard
        {isActive('/dashboard') && (
          <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary mx-auto w-6 rounded-full" />
        )}
      </Link>
      <Link
        href="/bookings"
        className={`relative py-1 transition-colors ${isActive('/bookings')
          ? 'text-foreground font-medium'
          : 'text-foreground/60 hover:text-foreground/80'
          }`}
      >
        Manage Bookings
        {isActive('/bookings') && (
          <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary mx-auto w-6 rounded-full" />
        )}
      </Link>
      {isAdmin && (
        <Link
          href="/admin"
          className={`relative py-1 transition-colors ${isActive('/admin')
            ? 'text-foreground font-medium'
            : 'text-foreground/60 hover:text-foreground/80'
            }`}
        >
          Settings
          {isActive('/admin') && (
            <span className="absolute -bottom-1 left-0 right-0 h-[2px] bg-primary mx-auto w-6 rounded-full" />
          )}
        </Link>
      )}
    </nav>
  )
}
