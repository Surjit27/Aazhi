import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { thClass, tdClass } from '../../features/explorer/ExplorerInsights.jsx'
import { adminAppOrigin, clientAppOrigin, PORTAL, ROLE } from '../../lib/portal.js'

const ROLES = [
  {
    id: ROLE.ADMIN,
    label: 'Administrator',
    portal: PORTAL.ADMIN,
    signInUrl: adminAppOrigin(),
    description: 'Internal staff console on the admin hostname.',
    access: 'All routes on admin.localhost (user management, roles overview, settings).',
  },
  {
    id: ROLE.CLIENT,
    label: 'Client',
    portal: PORTAL.CLIENT,
    signInUrl: clientAppOrigin(),
    description: 'End-user portal on the client hostname.',
    access: 'Client overview and settings on localhost only.',
  },
]

export default function AdminRolesPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Roles"
        description="Two global roles — hostname selects portal; API rejects login when role and portal do not match."
      />

      <div className="p-4 md:p-6">
        <Panel title="Role catalog" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] border-collapse">
              <thead className="bg-surface">
                <tr className="border-b border-line">
                  <th className={thClass}>Role</th>
                  <th className={thClass}>Portal (hostname)</th>
                  <th className={thClass}>Sign-in URL</th>
                  <th className={thClass}>Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {ROLES.map((role) => (
                  <tr key={role.id} className="align-top hover:bg-surface/80">
                    <td className={tdClass}>
                      <Badge tone={role.id === ROLE.ADMIN ? 'primary' : 'neutral'}>{role.label}</Badge>
                      <p className="mt-1 font-mono text-[11px] text-ink-subtle">{role.id}</p>
                    </td>
                    <td className={`${tdClass} font-mono text-xs`}>{role.portal}.localhost</td>
                    <td className={`${tdClass} font-mono text-xs`}>
                      <a href={`${role.signInUrl}/login`} className="text-primary-700 hover:underline">
                        {role.signInUrl}/login
                      </a>
                    </td>
                    <td className={`${tdClass} text-xs text-ink-muted`}>{role.access}</td>
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
