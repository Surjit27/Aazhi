import { Link } from 'react-router-dom'
import { Shield, Users } from 'lucide-react'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import { useAuthStore } from '../../stores/authStore.js'

export default function ClientAccessPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Access"
        description="Roles and user management for your tenant. New clients receive the Super admin role by default."
        breadcrumbs={['deepe', 'Access']}
      />

      <div className="flex flex-col gap-6 px-6 pb-10">
        <Panel
          title="Your tenant"
          description="Each client gets an isolated PostgreSQL schema — separate tables from other clients and from platform admin data."
        >
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="glass-inset p-4">
              <p className="text-xs font-medium text-ink-muted">Signed in as</p>
              <p className="mt-1 text-sm font-semibold text-ink">{user?.displayName ?? '—'}</p>
              <p className="text-xs text-ink-muted">{user?.email ?? '—'}</p>
            </div>
            <div className="glass-inset p-4">
              <p className="text-xs font-medium text-ink-muted">Schema pattern</p>
              <p className="mt-1 font-mono text-xs text-ink">client_&lt;uuid&gt;</p>
              <p className="mt-1 text-xs text-ink-muted">
                Tables include workspace_meta, mock_servers, scheduler_events, injection_batches, execution_runs, activity_events (History).
              </p>
            </div>
          </div>
        </Panel>

        <Panel title="Manage access" bodyClassName="p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/access/roles"
              className="glass-inset flex gap-3 rounded-lg p-4 hover:border-primary-100 hover:bg-primary-50/40"
            >
              <Shield size={18} className="shrink-0 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-ink">Roles</p>
                <p className="text-xs text-ink-muted">Super admin and member roles for this workspace.</p>
              </div>
            </Link>
            <Link
              to="/access/users"
              className="glass-inset flex gap-3 rounded-lg p-4 hover:border-primary-100 hover:bg-primary-50/40"
            >
              <Users size={18} className="shrink-0 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-ink">User management</p>
                <p className="text-xs text-ink-muted">Invite team members under your tenant schema.</p>
              </div>
            </Link>
          </div>
        </Panel>
      </div>
    </div>
  )
}
