import { Link } from 'react-router-dom'
import { FolderGit2, Layers, Sparkles } from 'lucide-react'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useAppStore } from '../stores/appStore.js'
import { architectureLabel, backendBasePath, backendsVisibleToClient } from '../data/backends.js'
import { relativeTime } from '../utils/format.js'

export default function BackendsHubOverviewPage() {
  const backends = backendsVisibleToClient(useAppStore((s) => s.backends))
  const indexed = backends.filter((b) => b.status === 'indexed').length
  const routes = backends.reduce((n, b) => n + (b.stats?.routes ?? 0), 0)
  const functions = backends.reduce((n, b) => n + (b.stats?.functions ?? 0), 0)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Backends overview"
        description="Reverse-engineering workspace — all services, events, and automation in one place."
        breadcrumbs={['deepe', 'Backends', 'Overview']}
        actions={
          <Link
            to="/backends/registry"
            className="inline-flex h-8 cursor-pointer items-center justify-center gap-2 rounded-md border border-primary-600 bg-primary-600 px-3 text-[13px] font-medium text-white shadow-sm hover:bg-primary-700"
          >
            <Layers size={14} /> Open registry
          </Link>
        }
      />

      <div className="flex flex-col gap-6 px-6 pb-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Services" value={String(backends.length)} icon={Layers} tone="primary" hint="Visible in registry" />
          <StatCard label="Indexed" value={String(indexed)} icon={FolderGit2} tone="success" hint="Ready for explorer" />
          <StatCard
            label="Symbols"
            value={`${routes} routes · ${functions} fn`}
            icon={Sparkles}
            tone="neutral"
            hint="Across all backends"
          />
        </div>

        <Panel title="Your services" description="Open a backend for per-service overview, explorer, and workflow.">
          <ul className="divide-y divide-line">
            {backends.length === 0 ? (
              <li className="p-5 text-sm text-ink-muted">No backends yet — add one from the registry.</li>
            ) : (
              backends.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink">{b.name}</p>
                    <p className="text-xs text-ink-muted">{b.description}</p>
                    <p className="mt-1 text-[11px] text-ink-subtle">
                      {architectureLabel(b.architecture)}
                      {b.git?.lastSyncAt ? ` · synced ${relativeTime(b.git.lastSyncAt)}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={b.status === 'indexed' ? 'success' : b.status === 'error' ? 'danger' : 'warning'}>
                      {b.status}
                    </Badge>
                    <Link
                      to={backendBasePath(b.id)}
                      className="inline-flex h-7 items-center justify-center rounded-md border border-line bg-white px-2.5 text-xs font-medium text-ink shadow-sm hover:bg-surface"
                    >
                      Open
                    </Link>
                  </div>
                </li>
              ))
            )}
          </ul>
        </Panel>

        <Panel title="Next step" bodyClassName="p-4 text-xs text-ink-muted leading-relaxed">
          <p>
            Use <strong className="font-medium text-ink">Registry</strong> under Backends in the sidebar to add Git
            services, then open a service for explorer and workflow views.
          </p>
        </Panel>
      </div>
    </div>
  )
}
