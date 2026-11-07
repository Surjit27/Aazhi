import { useEffect, useState } from 'react'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { thClass, tdClass } from '../../features/explorer/ExplorerInsights.jsx'
import { apiFetch } from '../../lib/api.js'
import { useAppStore } from '../../stores/appStore.js'

export default function ClientAccessRolesPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [roles, setRoles] = useState([])

  useEffect(() => {
    apiFetch('/api/client/access/roles')
      .then((r) => setRoles(r.roles ?? []))
      .catch((e) => pushToast({ tone: 'danger', title: 'Failed to load roles', body: e.message }))
  }, [pushToast])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Roles"
        description="Client workspace roles. New sign-ups receive Super admin by default."
        breadcrumbs={['deepe', 'Access', 'Roles']}
      />
      <div className="p-4 md:p-6">
        <Panel title={`Client roles (${roles.length})`} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse">
              <thead className="bg-surface">
                <tr className="border-b border-line">
                  <th className={thClass}>Role</th>
                  <th className={thClass}>Key</th>
                  <th className={thClass}>Portal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td className={tdClass}>
                      <Badge tone={role.key === 'super_admin' ? 'primary' : 'neutral'}>{role.label}</Badge>
                    </td>
                    <td className={`${tdClass} font-mono text-xs`}>{role.key}</td>
                    <td className={`${tdClass} font-mono text-xs`}>{role.portal}</td>
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
