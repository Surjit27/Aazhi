import { Link } from 'react-router-dom'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import { clientAppOrigin, getPortal, PORTAL } from '../lib/portal.js'
import { formatAccessRoleLabel } from '../lib/accessRoles.js'
import { useAuthStore } from '../stores/authStore.js'
import { brandBreadcrumbs } from '../lib/breadcrumbs.js'
import PersonalSettingsPanel from '../components/settings/PersonalSettingsPanel.jsx'
import PasswordChangePanel from '../components/settings/PasswordChangePanel.jsx'

function ClientSettingsPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Settings"
        description="Workspace preferences on the client portal."
        breadcrumbs={brandBreadcrumbs('Pages', 'Settings')}
      />
      <div className="flex flex-col gap-6 px-6 py-6">
        <Panel title="Your account">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="glass-inset p-4">
              <p className="text-xs font-medium text-ink-muted">Signed in as</p>
              <p className="mt-1 text-sm font-semibold text-ink">{user?.displayName || '—'}</p>
              <p className="text-xs text-ink-muted">{user?.email || '—'}</p>
              <p className="mt-2 text-xs text-ink-muted">Access role: {formatAccessRoleLabel(user?.accessRoleKey)}</p>
            </div>
            <div className="glass-inset p-4">
              <p className="text-xs font-medium text-ink-muted">Client portal</p>
              <p className="mt-1 font-mono text-xs text-ink">{clientAppOrigin().replace(/^https?:\/\//, '')}</p>
              <Link to="/account" className="mt-3 inline-block text-xs font-medium text-primary-600 hover:underline">
                Open full account view →
              </Link>
            </div>
          </div>
        </Panel>
        <PersonalSettingsPanel />
        <PasswordChangePanel />
      </div>
    </div>
  )
}

/** Client portal settings only; admin uses AdminSettingsLayout + nested routes. */
export default function SettingsPage() {
  if (getPortal() === PORTAL.CLIENT) {
    return <ClientSettingsPage />
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Settings" />
    </div>
  )
}