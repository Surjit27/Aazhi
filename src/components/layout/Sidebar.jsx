import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Settings, Shield, UserCog, Users, Database } from 'lucide-react'
import { getAppSurface } from '../../lib/appHost.js'
import { useAuthStore } from '../../stores/authStore.js'

export const ADMIN_NAV = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/roles', label: 'Roles', icon: Shield },
  { to: '/admin/client-users', label: 'Client user management', icon: Users },
  { to: '/admin/admin-users', label: 'Admin user management', icon: UserCog },
  { to: '/settings', label: 'Settings', icon: Settings },
]

const CLIENT_NAV = [
  { to: '/client', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onNavigate }) {
  const role = useAuthStore((s) => s.user?.role)
  const surface = getAppSurface()
  const isAdminConsole = surface === 'admin' && role === 'admin'
  const nav = isAdminConsole ? ADMIN_NAV : CLIENT_NAV

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex w-56 flex-col border-r border-line bg-white transition-transform duration-200 md:static md:translate-x-0 ${
        open ? 'translate-x-0 shadow-pop' : '-translate-x-full'
      }`}
    >
      <div className="flex h-12 items-center gap-2.5 border-b border-line px-4">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-600 text-white">
          <Database size={14} />
        </div>
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink">{isAdminConsole ? 'Aazhi Admin' : 'Aazhi Client'}</span>
          <span className="block truncate text-[10px] text-ink-subtle">{isAdminConsole ? 'admin.localhost' : 'localhost'}</span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 scrollbar-thin" aria-label="Main">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
                isActive ? 'bg-primary-50 font-medium text-primary-700' : 'text-ink-muted hover:bg-surface hover:text-ink'
              }`
            }
          >
            <Icon size={16} strokeWidth={1.75} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line p-3 text-[11px] text-ink-subtle">
        {isAdminConsole ? 'User & role management console' : 'Client portal'}
      </div>
    </aside>
  )
}
