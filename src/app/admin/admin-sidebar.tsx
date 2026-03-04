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
        { title: 'Users', href: '/admin/users', show: usersPerm.canRead, iconName: 'users' },
        { title: 'Roles', href: '/admin/users/roles', show: usersPerm.canRead, iconName: 'shield' }
      ]
    },
    {
      title: 'Settings',
      show: settingsPerm.canRead,
      items: [
        { title: 'Airlines (+SMTP)', href: '/admin/settings/airlines', show: settingsPerm.canRead, iconName: 'plane' },
        { title: 'Booking Statuses', href: '/admin/settings/booking-statuses', show: settingsPerm.canRead, iconName: 'list' },
        { title: 'Email Templates', href: '/admin/email-templates', show: settingsPerm.canRead, iconName: 'mail' },
        { title: 'Countries', href: '/admin/settings/countries', show: settingsPerm.canRead, iconName: 'globe' },
        { title: 'Currencies', href: '/admin/settings/currencies', show: settingsPerm.canRead, iconName: 'coins' },
        { title: 'Regions', href: '/admin/settings/regions', show: settingsPerm.canRead, iconName: 'map' }
      ]
    },
    {
      title: 'Operations',
      show: bookingsPerm.canRead || reportsPerm.canRead,
      items: [
        { title: 'Reports', href: '/admin/reports', show: reportsPerm.canRead, iconName: 'chart' }
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
