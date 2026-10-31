import { NavLink, Outlet, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useEffect } from 'react'
import { BackendExplorerProvider } from '../../context/BackendExplorerContext.jsx'
import { useAppStore } from '../../stores/appStore.js'
import { backendBasePath } from '../../data/backends.js'

const TABS = [
  { segment: '', label: 'Overview', end: true },
  { segment: 'explorer', label: 'Backend Explorer' },
  { segment: 'workflow', label: 'Visual Workflow' },
]

export default function BackendLayout() {
  const { backendId } = useParams()
  const navigate = useNavigate()
  const backends = useAppStore((s) => s.backends)
  const setBackend = useAppStore((s) => s.setBackend)
  const backend = backends.find((b) => b.id === backendId)

  useEffect(() => {
    if (backendId) setBackend(backendId)
  }, [backendId, setBackend])

  if (!backend) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm font-medium text-ink">Backend not found</p>
        <button
          type="button"
          onClick={() => navigate('/backends')}
          className="cursor-pointer text-sm text-primary-700 hover:underline"
        >
          Back to all backends
        </button>
      </div>
    )
  }

  const base = backendBasePath(backendId)

  return (
    <BackendExplorerProvider backendId={backendId}>
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="border-b border-line bg-white px-4 py-2.5 md:px-6">
          <nav className="mb-2 flex flex-wrap items-center gap-1 text-xs text-ink-muted" aria-label="Breadcrumb">
            <button
              type="button"
              onClick={() => navigate('/backends')}
              className="cursor-pointer font-medium text-primary-700 hover:underline"
            >
              Backends
            </button>
            <ChevronRight size={12} className="text-ink-subtle" />
            <span className="font-medium text-ink">{backend.name}</span>
          </nav>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold text-ink">{backend.name}</h1>
              <p className="text-xs text-ink-muted">{backend.description}</p>
            </div>
            <div className="flex gap-1 rounded-lg border border-line bg-surface p-0.5" role="tablist">
              {TABS.map(({ segment, label, end }) => {
                const to = segment ? `${base}/${segment}` : base
                return (
                  <NavLink
                    key={segment || 'overview'}
                    to={to}
                    end={end}
                    role="tab"
                    className={({ isActive }) =>
                      `rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        isActive ? 'bg-white text-ink shadow-card' : 'text-ink-muted hover:text-ink'
                      }`
                    }
                  >
                    {label}
                  </NavLink>
                )
              })}
            </div>
          </div>
        </div>
        <Outlet context={{ backend }} />
      </div>
    </BackendExplorerProvider>
  )
}
