import { useEffect, useMemo, useState } from 'react'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Field, Input, Select } from '../../components/ui/FormControls.jsx'
import { tdClass } from '../../features/explorer/ExplorerInsights.jsx'
import { useClientTable } from '../../hooks/useClientTable.js'
import { LegacyTableFooter, SortableLegacyTh } from '../../features/tables/legacyTable.jsx'
import { apiFetch } from '../../lib/api.js'
import { adminAppOrigin, clientAppOrigin, PORTAL } from '../../lib/portal.js'
import { summarizePermissions } from '../../lib/rolePermissions.js'
import RolePermissionsModal from '../../components/admin/RolePermissionsModal.jsx'
import { useAppStore } from '../../stores/appStore.js'

const EMPTY = { key: '', label: '', portal: PORTAL.CLIENT }

export default function AdminRolesPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [roles, setRoles] = useState([])
  const [open, setOpen] = useState(false)
  const [permRole, setPermRole] = useState(null)
  const [form, setForm] = useState(EMPTY)

  const load = () =>
    apiFetch('/api/auth/roles')
      .then((r) => setRoles(r.roles))
      .catch((e) => pushToast({ tone: 'danger', title: 'Failed to load roles', body: e.message }))

  useEffect(() => {
    load()
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

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiFetch('/api/auth/roles', { method: 'POST', body: form })
      pushToast({ title: 'Role created', body: form.key })
      setForm(EMPTY)
      setOpen(false)
      load()
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not create role', body: err.message })
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Roles"
        description="Portal roles and per-page permissions (Settings, Feature flags, history, and more)."
        actions={
          <Button variant="primary" onClick={() => setOpen(true)}>
            Create role
          </Button>
        }
      />

      <div className="p-4 md:p-6">
        <Panel title={`Roles (${roles.length})`} bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
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
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                    Page permissions
                  </th>
                  <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
                    Sign-in URL
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {table.rows.map((role) => {
                  const origin = role.portal === PORTAL.ADMIN ? adminAppOrigin() : clientAppOrigin()
                  return (
                    <tr key={role.id} className="hover:bg-surface/80">
                      <td className={tdClass}>
                        <Badge tone={role.portal === PORTAL.ADMIN ? 'primary' : 'neutral'}>{role.label}</Badge>
                      </td>
                      <td className={`${tdClass} font-mono text-xs`}>{role.key}</td>
                      <td className={`${tdClass} font-mono text-xs`}>{role.portal}</td>
                      <td className={tdClass}>
                        <p className="text-xs text-ink-muted">{summarizePermissions(role.portal, role.permissions)}</p>
                        <Button size="sm" variant="secondary" className="mt-1" onClick={() => setPermRole(role)}>
                          Edit permissions
                        </Button>
                      </td>
                      <td className={`${tdClass} font-mono text-xs`}>
                        <a href={`${origin}/login`} className="text-primary-700 hover:underline">
                          {origin}/login
                        </a>
                      </td>
                    </tr>
                  )
                })}
                {table.total === 0 && (
                  <tr>
                    <td colSpan={5} className={`${tdClass} py-8 text-center text-xs text-ink-muted`}>
                      No roles yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            <LegacyTableFooter table={table} itemLabel="role" />
          </div>
        </Panel>
      </div>

      <RolePermissionsModal
        role={permRole}
        portal={permRole?.portal ?? PORTAL.ADMIN}
        catalogPath={
          permRole ? `/api/auth/roles/permissions/catalog?portal=${encodeURIComponent(permRole.portal)}` : ''
        }
        patchPath={permRole ? `/api/auth/roles/${encodeURIComponent(permRole.key)}/permissions` : ''}
        open={Boolean(permRole)}
        onClose={() => setPermRole(null)}
        onSaved={() => load()}
      />

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create role"
        footer={
          <>
            <Button type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-role" variant="primary">
              Create role
            </Button>
          </>
        }
      >
        <form id="create-role" className="flex flex-col gap-4" onSubmit={onSubmit}>
          <Field label="Key" hint="Lowercase, for example sales_manager">
            <Input value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} required />
          </Field>
          <Field label="Label">
            <Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} required />
          </Field>
          <Field label="Portal">
            <Select value={form.portal} onChange={(e) => setForm((f) => ({ ...f, portal: e.target.value }))}>
              <option value={PORTAL.CLIENT}>Client (client.localhost)</option>
              <option value={PORTAL.ADMIN}>Admin (admin.localhost)</option>
            </Select>
          </Field>
        </form>
      </Modal>
    </div>
  )
}
