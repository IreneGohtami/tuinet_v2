
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { UserNav } from './user-nav'
import { SiteHeaderNav } from './site-header-nav'
import { canAccessAdmin } from '@/lib/rbac'

export async function SiteHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const showAdminLink = await canAccessAdmin()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block"><span className="text-primary">TUI</span>NET</span>
          </Link>
          <SiteHeaderNav isAdmin={showAdminLink} />
        </div>

        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Search or other items */}
          </div>
          <nav className="flex items-center">
            {user ? (
              <UserNav email={user.email} />
            ) : (
              <Link href="/login" className="text-sm font-medium transition-colors hover:text-primary">Login</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
