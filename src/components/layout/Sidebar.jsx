import { NavLink, useMatch, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { ChevronDown, Database, FolderTree, Workflow } from 'lucide-react'
import { getPortal, PORTAL } from '../../lib/portal.js'
import { useAuthStore } from '../../stores/authStore.js'
import { useFeatureFlagsStore } from '../../stores/featureFlagsStore.js'
import { ADMIN_NAV, CLIENT_NAV } from '../../routes/index.jsx'
import { backendBasePath, isClientBlockedBackend } from '../../data/backends.js'

const linkClass = ({ isActive }) =>
  `flex items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] transition-colors ${
    isActive
      ? 'bg-primary-50 font-medium text-primary-600'
      : 'text-ink-muted hover:bg-white/70 hover:text-ink'
  }`

function NavSection({ label, open, onToggle, children }) {
  return (
    <>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="mt-3 flex w-full cursor-pointer items-center gap-1.5 px-3 py-1 text-left text-[11px] font-semibold tracking-wide text-ink-subtle uppercase"
      >
        <ChevronDown size={12} className={`transition-transform ${open ? '' : '-rotate-90'}`} />
        {label}
      </button>
      {open && <div className="mt-0.5 flex flex-col gap-0.5">{children}</div>}
    </>
  )
}

function AdminSidebarNav({ onNavigate }) {
  const location = useLocation()
  const historyItems = ADMIN_NAV.filter((item) => item.to.startsWith('/admin/history/'))
  const accessItems = ADMIN_NAV.filter(
    (item) => item.to !== '/overview' && item.to !== '/settings' && !item.to.startsWith('/admin/history/'),
  )
  const topItems = ADMIN_NAV.filter((item) => item.to === '/overview' || item.to === '/settings')
  const accessOpenByRoute = accessItems.some((item) => location.pathname.startsWith(item.to))
  const historyOpenByRoute = historyItems.some((item) => location.pathname.startsWith(item.to))
  const [accessOpen, setAccessOpen] = useState(accessOpenByRoute)
  const [historyOpen, setHistoryOpen] = useState(historyOpenByRoute)

  return (
    <>
      <p className="px-3 pt-2 text-[11px] font-semibold tracking-wide text-ink-subtle uppercase">Dashboards</p>
      {topItems
        .filter((item) => item.to === '/overview')
        .map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate} className={linkClass}>
            <Icon size={16} strokeWidth={1.75} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}

      <NavSection label="Access" open={accessOpen} onToggle={() => setAccessOpen((v) => !v)}>
        {accessItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={linkClass}>
            <Icon size={16} strokeWidth={1.75} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </NavSection>

      <NavSection label="History" open={historyOpen} onToggle={() => setHistoryOpen((v) => !v)}>
        {historyItems.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onNavigate} className={linkClass}>
            <Icon size={16} strokeWidth={1.75} />
            <span className="truncate">{label}</span>
          </NavLink>
        ))}
      </NavSection>

      <p className="mt-3 px-3 text-[11px] font-semibold tracking-wide text-ink-subtle uppercase">Pages</p>
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
  const flags = useFeatureFlagsStore((s) => s.flags)
  const flagsLoaded = useFeatureFlagsStore((s) => s.loaded)
  const isNavEnabled = useFeatureFlagsStore((s) => s.isNavEnabled)
  void flags
  void flagsLoaded
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
      <p className="px-3 pt-2 text-[11px] font-semibold tracking-wide text-ink-subtle uppercase">Workspace</p>
      {CLIENT_NAV.filter((item) => isNavEnabled(item.to, item.flagKey)).map(({ to, label, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} onClick={onNavigate} className={linkClass}>
          <Icon size={16} strokeWidth={1.75} />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
      {scoped.length > 0 && (
        <>
          <p className="mt-3 px-3 text-[11px] font-semibold tracking-wide text-ink-subtle uppercase">This backend</p>
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
      className={`bg-sidebar fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-line/90 transition-transform duration-200 md:static md:translate-x-0 ${
        open ? 'translate-x-0 shadow-pop' : '-translate-x-full'
      }`}
    >
      <div className="flex h-14 items-center gap-2.5 border-b border-line/80 bg-white/50 px-4 backdrop-blur-sm">
        <div className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-primary-600 text-white shadow-sm">
          <Database size={15} />
        </div>
        <div className="min-w-0">
          <span className="block truncate text-sm font-semibold text-ink">Aazhi</span>
          <span className="block truncate text-[10px] text-ink-subtle">
            {isAdminConsole ? 'Admin' : 'Client'} · {isAdminConsole ? 'admin.localhost' : 'localhost'}
          </span>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 scrollbar-thin" aria-label="Main">
        {isAdminConsole ? <AdminSidebarNav onNavigate={onNavigate} /> : <ClientSidebarNav onNavigate={onNavigate} />}
      </nav>
    </aside>
  )
}
