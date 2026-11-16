import { useEffect, useMemo, useState } from 'react'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { tdClass } from '../../features/explorer/ExplorerInsights.jsx'
import { apiFetch } from '../../lib/api.js'
import { accessRoleBadgeTone } from '../../lib/accessRoles.js'
import { useAppStore } from '../../stores/appStore.js'
import { useClientTable } from '../../hooks/useClientTable.js'
import { LegacyTableFooter, SortableLegacyTh } from '../../features/tables/legacyTable.jsx'
import { brandBreadcrumbs } from '../../lib/breadcrumbs.js'

export default function ClientAccessRolesPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [roles, setRoles] = useState([])

  useEffect(() => {
    apiFetch('/api/client/access/roles')
      .then((r) => setRoles(r.roles ?? []))
      .catch((e) => pushToast({ tone: 'danger', title: 'Failed to load roles', body: e.message }))
  }, [pushToast])

  const accessors = useMemo(
    () => ({
      label: (r) => r.label,
      key: (r) => r.key,
      portal: (r) => r.portal,
    }),
    [],
  )
  const table = useClientTable(roles, { pageSize: 15, accessors, defaultSort: { key: 'label', direction: 'asc' } })

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Roles"
        description="Client workspace roles. New sign-ups receive Super admin by default."
        breadcrumbs={brandBreadcrumbs('Access', 'Roles')}
      />
      <div className="p-4 md:p-6">
        <Panel title={`Client roles (${roles.length})`} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] border-collapse">
              <thead className="bg-surface">
                <tr className="border-b border-line">
                  <SortableLegacyTh sortKey="label" thProps={table.thProps}>
                    Role
                  </SortableLegacyTh>
                  <SortableLegacyTh sortKey="key" thProps={table.thProps}>
                    Key
                  </SortableLegacyTh>
                  <SortableLegacyTh sortKey="portal" thProps={table.thProps}>
                    Portal
                  </SortableLegacyTh>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {table.rows.map((role) => (
                  <tr key={role.id}>
                    <td className={tdClass}>
                      <Badge tone={accessRoleBadgeTone(role.key)}>{role.label}</Badge>
                    </td>
                    <td className={`${tdClass} font-mono text-xs`}>{role.key}</td>
                    <td className={`${tdClass} font-mono text-xs`}>{role.portal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <LegacyTableFooter table={table} itemLabel="role" />
          </div>
        </Panel>
      </div>
    </div>
  )
}