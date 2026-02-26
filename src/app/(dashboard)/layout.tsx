
import { SiteHeader } from '@/components/site-header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 container max-w-screen-2xl mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
