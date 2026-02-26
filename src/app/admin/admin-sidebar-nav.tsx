'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type NavItem = {
  title: string
  href: string
  show: boolean
}

type NavGroup = {
  title: string
  items: NavItem[]
  show: boolean
}

export function AdminSidebarNav({ groups }: { groups: NavGroup[] }) {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path /*|| pathname.startsWith(path + '/')*/

  return (
    <nav className="p-2 space-y-1">
      {groups.filter(g => g.show).map((group, idx) => (
        <div key={idx} className="space-y-1">
          <div className={`pb-2 ${idx === 0 ? 'pt-0' : 'pt-4'}`}>
            <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.title}
            </h3>
          </div>
          {group.items.filter(item => item.show).map((item, idy) => (
            <Link
              key={idy}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ml-2 ${isActive(item.href)
                ? 'bg-accent text-accent-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
            >
              <span className="w-1 h-1 rounded-full bg-muted-foreground/50 mr-1" />
              {item.title}
            </Link>
          ))}
        </div>
      ))}
    </nav>
  )
}
