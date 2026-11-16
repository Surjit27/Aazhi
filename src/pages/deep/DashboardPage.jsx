import { Link } from 'react-router-dom'
import { Activity, FolderKanban, Layers, Workflow } from 'lucide-react'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import { MOCK_CONNECTED_BACKENDS, MOCK_PROJECTS } from '../../data/deepBackend.js'
import { brandBreadcrumbs } from '../../lib/breadcrumbs.js'

export default function DashboardPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Dashboard"
        description="Deep Backend workspace overview — discovery, flows, and execution at a glance."
        breadcrumbs={brandBreadcrumbs('Dashboard')}
      />
      <div className="flex flex-col gap-6 px-6 pb-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <StatCard label="Projects" value={String(MOCK_PROJECTS.length)} icon={FolderKanban} tone="primary" />
          <StatCard label="Backends" value={String(MOCK_CONNECTED_BACKENDS.length)} icon={Layers} tone="success" />
          <StatCard label="Execution flows" value="6" icon={Workflow} tone="neutral" />
          <StatCard label="Recent runs" value="3" icon={Activity} tone="warning" hint="Last 24h (mock)" />
        </div>
        <Panel title="Quick start">
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <Link to="/deep/explorer" className="glass-inset rounded-lg p-4 hover:border-primary-100">
              <p className="text-sm font-semibold text-ink">Backend Explorer</p>
              <p className="text-xs text-ink-muted">Connect a repo and run Architecture Discovery.</p>
            </Link>
            <Link to="/deep/flow-studio" className="glass-inset rounded-lg p-4 hover:border-primary-100">
              <p className="text-sm font-semibold text-ink">Flow playground</p>
              <p className="text-xs text-ink-muted">2D canvas for repos, files, dependencies, and syntax (link repos in Explorer).</p>
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  )
}
