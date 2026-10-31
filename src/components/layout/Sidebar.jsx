import { NavLink, useMatch } from 'react-router-dom'
import {
  Activity,
  Calendar,
  Database,
  FolderTree,
  GitBranch,
  Layers,
  Server,
  Settings,
  Sparkles,
  Upload,
  Workflow,
} from 'lucide-react'
import { backendBasePath } from '../../data/backends.js'

export const NAV_ITEMS = [
  { to: '/backends', label: 'Backends', icon: Layers },
  { to: '/mocks', label: 'Mock Servers', icon: Server },
  { to: '/scheduler', label: 'Event Scheduler', icon: Calendar },
  { to: '/injection', label: 'Data Injection', icon: Upload },
  { to: '/monitor', label: 'Execution Monitor', icon: Activity },
  { to: '/git', label: 'Git Integration', icon: GitBranch },
  { to: '/assistant', label: 'AI Assistant', icon: Sparkles },
  { to: '/settings', label: 'Settings', icon: Settings },
]

function backendNavItems(backendId) {
  const base = backendBasePath(backendId)
  return [
    { to: base, label: 'Overview', icon: Database, end: true },
    { to: `${base}/explorer`, label: 'Backend Explorer', icon: FolderTree },
    { to: `${base}/workflow`, label: 'Visual Workflow', icon: Workflow },
  ]
}

export default function Sidebar({ open, onNavigate }) {
  const nested = useMatch('/backends/:backendId/*')
  const root = useMatch('/backends/:backendId')
  const backendId = nested?.params?.backendId ?? root?.params?.backendId
  const scoped = backendId ? backendNavItems(backendId) : []

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
        <span className="text-sm font-semibold text-ink">Preflight AI</span>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-2 scrollbar-thin" aria-label="Main">
        {NAV_ITEMS.slice(0, 1).map(({ to, label, icon: Icon, end }) => (
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

        {scoped.length > 0 && (
          <>
            <p className="mt-3 mb-1 px-2.5 text-[10px] font-semibold tracking-wide text-ink-subtle uppercase">This backend</p>
            {scoped.map(({ to, label, icon: Icon, end }) => (
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
          </>
        )}

        <p className="mt-3 mb-1 px-2.5 text-[10px] font-semibold tracking-wide text-ink-subtle uppercase">Workspace</p>
        {NAV_ITEMS.slice(1).map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
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
        Prototype UI — each backend has its own explorer and workflow.
      </div>
    </aside>
  )
}
