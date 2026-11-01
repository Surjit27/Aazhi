import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { thClass, tdClass } from '../../features/explorer/ExplorerInsights.jsx'
import { adminAppOrigin, clientAppOrigin } from '../../lib/appHost.js'

const ROLES = [
  {
    id: 'admin',
    label: 'Administrator',
    signInUrl: adminAppOrigin(),
    description: 'Manage roles, client users, and admin users.',
    permissions: ['Create client accounts', 'Create admin accounts', 'View all users', 'Platform settings'],
  },
  {
    id: 'client',
    label: 'Client',
    signInUrl: clientAppOrigin(),
    description: 'End-user portal on the client hostname.',
    permissions: ['View client portal', 'Account settings'],
  },
]

export default function AdminRolesPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader title="Roles" description="Role definitions and which hostname each role uses." />

      <div className="p-4 md:p-6">
        <Panel title="Role catalog" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead className="bg-surface">
                <tr className="border-b border-line">
                  <th className={thClass}>Role</th>
                  <th className={thClass}>Sign-in URL</th>
                  <th className={thClass}>Summary</th>
                  <th className={thClass}>Permissions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ROLES.map((role) => (
                  <tr key={role.id} className="align-top hover:bg-surface/80">
                    <td className={tdClass}>
                      <Badge tone={role.id === 'admin' ? 'primary' : 'neutral'}>{role.label}</Badge>
                      <p className="mt-1 font-mono text-[11px] text-ink-subtle">{role.id}</p>
                    </td>
                    <td className={`${tdClass} font-mono text-xs`}>
                      <a href={`${role.signInUrl}/login`} className="text-primary-700 hover:underline">
                        {role.signInUrl}/login
                      </a>
                    </td>
                    <td className={`${tdClass} text-xs text-ink-muted`}>{role.description}</td>
                    <td className={tdClass}>
                      <ul className="list-inside list-disc text-xs text-ink-muted">
                        {role.permissions.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>
    </div>
  )
}
