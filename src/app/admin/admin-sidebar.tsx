
import { AdminSidebarNav } from './admin-sidebar-nav'
import { getModulePermissions } from '@/lib/rbac'

export async function AdminSidebar() {
  const [usersPerm, bookingsPerm, settingsPerm, reportsPerm] = await Promise.all([
    getModulePermissions('users'),
    getModulePermissions('bookings'),
    getModulePermissions('settings'),
    getModulePermissions('reports')
  ])

  const groups = [
    {
      title: 'User Management',
      show: usersPerm.canRead || usersPerm.canCreate || usersPerm.canUpdate || usersPerm.canDelete,
      items: [
        { title: 'Users', href: '/admin/users', show: usersPerm.canRead },
        { title: 'Roles', href: '/admin/users/roles', show: usersPerm.canRead }
      ]
    },
    {
      title: 'Settings',
      show: settingsPerm.canRead,
      items: [
        { title: 'Airlines', href: '/admin/settings/airlines', show: settingsPerm.canRead },
        { title: 'Regions', href: '/admin/settings/regions', show: settingsPerm.canRead },
        { title: 'Currencies', href: '/admin/settings/currencies', show: settingsPerm.canRead },
        { title: 'Email Templates', href: '/admin/email-templates', show: settingsPerm.canRead }
      ]
    },
    {
      title: 'Operations',
      show: bookingsPerm.canRead || reportsPerm.canRead,
      items: [
        { title: 'Reports', href: '/admin/reports', show: reportsPerm.canRead }
      ]
    }
  ]

  return (
    <aside className="w-64 flex-shrink-0 hidden md:block">
      <div className="rounded-lg border border-border bg-card text-card-foreground shadow-sm h-full">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold tracking-tight">Admin Console</h2>
        </div>
        <AdminSidebarNav groups={groups} />
      </div>
    </aside>
  )
}
