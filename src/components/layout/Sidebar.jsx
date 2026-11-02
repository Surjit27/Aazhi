import { NavLink, useMatch, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { ChevronDown, Database, FolderTree, Workflow } from 'lucide-react'
import { getPortal, PORTAL } from '../../lib/portal.js'
import { useAuthStore } from '../../stores/authStore.js'
import { ADMIN_NAV, CLIENT_NAV } from '../../routes/index.jsx'
import { backendBasePath, isClientBlockedBackend } from '../../data/backends.js'

const linkClass = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] transition-colors ${
    isActive ? 'bg-primary-50 font-medium text-primary-700' : 'text-ink-muted hover:bg-surface hover:text-ink'
  }`

function AdminSidebarNav({ onNavigate }) {
  const location = useLocation()
  const accessItems = ADMIN_NAV.filter((item) => item.to !== '/overview' && item.to !== '/settings')
  const topItems = ADMIN_NAV.filter((item) => item.to === '/overview' || item.to === '/settings')
  const accessOpenByRoute = accessItems.some((item) => location.pathname.startsWith(item.to))
  const [open, setOpen] = useState(accessOpenByRoute)

  return (
    <>
      {topItems
        .filter((item) => item.to === '/overview')
        .map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate} className={linkClass}>
            <Icon size={16} strokeWidth={1.75} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="mt-1 flex w-full cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] font-medium text-ink hover:bg-surface"
      >
        <ChevronDown size={14} className={`shrink-0 text-ink-subtle transition-transform ${open ? '' : '-rotate-90'}`} />
        <span className="truncate">Access</span>
      </button>
      {open &&
        accessItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={linkClass}>
            <Icon size={16} strokeWidth={1.75} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}

      {topItems
        .filter((item) => item.to === '/settings')
        .map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={linkClass}>
            <Icon size={16} strokeWidth={1.75} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
    </>
  )
}

function ClientSidebarNav({ onNavigate }) {
  const nested = useMatch('/backends/:backendId/*')
  const root = useMatch('/backends/:backendId')
  const backendId = nested?.params?.backendId ?? root?.params?.backendId
  const scoped =
    backendId && !isClientBlockedBackend(backendId)
      ? [
          { to: backendBasePath(backendId), label: 'Overview', icon: Database, end: true },
          { to: `${backendBasePath(backendId)}/explorer`, label: 'Backend explorer', icon: FolderTree },
          { to: `${backendBasePath(backendId)}/workflow`, label: 'Visual workflow', icon: Workflow },
        ]
      : []

  return (
    <>
      {CLIENT_NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate} className={linkClass}>
          <Icon size={16} strokeWidth={1.75} />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
      {scoped.length > 0 && (
        <>
          <p className="mt-3 mb-1 px-2.5 text-[10px] font-semibold tracking-wide text-ink-subtle uppercase">This backend</p>
          {scoped.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={onNavigate} className={linkClass}>
              <Icon size={16} strokeWidth={1.75} />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </>
      )}
    </>
  )
}

export default function Sidebar({ open, onNavigate }) {
  const role = useAuthStore((s) => s.user?.role)
  const portal = getPortal()
  const isAdminConsole = portal === PORTAL.ADMIN && role === 'admin'

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
        {isAdminConsole ? <AdminSidebarNav onNavigate={onNavigate} /> : <ClientSidebarNav onNavigate={onNavigate} />}
      </nav>

      <div className="border-t border-line p-3 text-[11px] text-ink-subtle">
        {isAdminConsole ? 'User and role management only' : 'Client workspace — Mock servers is the home page'}
      </div>
    </aside>
  )
}
