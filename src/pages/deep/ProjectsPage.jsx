import { Link } from 'react-router-dom'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { MOCK_PROJECTS } from '../../data/deepBackend.js'

export default function ProjectsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader title="Projects" description="Group backends, flows, and schedules by initiative." breadcrumbs={['deepe', 'Projects']} />
      <div className="px-6 pb-10">
        <Panel title="Workspace projects" bodyClassName="p-0">
          <ul className="divide-y divide-line">
            {MOCK_PROJECTS.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{p.name}</p>
                  <p className="text-xs text-ink-muted">
                    {p.backends} backends · {p.flows} flows · updated {p.updatedAt}
                  </p>
                </div>
                <Link to="/deep/explorer" className="text-xs font-medium text-primary-700 hover:underline">
                  Open explorer
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
        <p className="mt-4 text-xs text-ink-muted">
          <Badge tone="primary">Mock</Badge> Project CRUD will use per-client schema tables later.
        </p>
      </div>
    </div>
  )
}
