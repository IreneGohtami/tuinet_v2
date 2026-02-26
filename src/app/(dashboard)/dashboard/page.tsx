
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const displayName = user?.user_metadata?.full_name || user.email?.split('@')[0] || 'User'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Welcome to TUINET V2, {displayName}</h1>
        <p className="text-muted-foreground">Manage your airline&apos;s bookings and logistics from one central hub.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for future widgets */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="font-semibold text-foreground">Quick Stats</h3>
          <p className="text-sm text-muted-foreground mt-2">No data available yet.</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-2">Platform Overview</h3>
          <p className="text-sm text-muted-foreground">Access your daily operations, monitor performance, and manage your airline&apos;s profiles.</p>
        </div>
      </div>
    </div>
  )
}
