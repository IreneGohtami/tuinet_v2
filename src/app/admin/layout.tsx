
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './admin-sidebar'
import { SiteHeader } from '@/components/site-header'
import { canAccessAdmin } from '@/lib/rbac'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user has permission to access admin
  if (!await canAccessAdmin()) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <div className="flex flex-1 container max-w-screen-2xl mx-auto px-4 py-6 gap-6">
        <AdminSidebar />
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}
