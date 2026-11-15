import { useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../lib/api.js'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/FormControls.jsx'
import { tdClass } from '../../features/explorer/ExplorerInsights.jsx'
import { useClientTable } from '../../hooks/useClientTable.js'
import { LegacyTableFooter, SortableLegacyTh } from '../../features/tables/legacyTable.jsx'
import { useAppStore } from '../../stores/appStore.js'
import { useAuthStore } from '../../stores/authStore.js'

const EMPTY = { email: '', password: '', displayName: '', accessRoleKey: 'member' }

export default function ClientAccessUsersPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const me = useAuthStore((s) => s.user)
  const [users, setUsers] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const isSuperAdmin = me?.accessRoleKey === 'super_admin' || !me?.accessRoleKey

  const load = () =>
    apiFetch('/api/client/access/users')
      .then((r) => setUsers(r.users ?? []))
      .catch((e) => pushToast({ tone: 'danger', title: 'Failed to load users', body: e.message }))

  useEffect(() => {
    load()
  }, [pushToast])

  const accessors = useMemo(
    () => ({
      email: (u) => u.email,
      displayName: (u) => u.displayName,
      accessRoleKey: (u) => u.accessRoleKey,
    }),
    [],
  )
  const table = useClientTable(users, { pageSize: 15, accessors, defaultSort: { key: 'email', direction: 'asc' } })

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiFetch('/api/client/access/users', { method: 'POST', body: form })
      pushToast({ title: 'User invited', body: form.email })
      setForm(EMPTY)
      setOpen(false)
      load()
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not invite user', body: err.message })
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="User management"
        description="Users in your tenant schema workspace. Super admin can invite members."
        breadcrumbs={['deepe', 'Access', 'Users']}
        actions={
          isSuperAdmin ? (
            <Button variant="primary" onClick={() => setOpen(true)}>
              Invite user
            </Button>
          ) : null
        }
      />
      <div className="p-4 md:p-6">
        <Panel title={`Users (${users.length})`} bodyClassName="p-0">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="bg-surface">
              <tr className="border-b border-line">
                <SortableLegacyTh sortKey="email" thProps={table.thProps}>
                  Email
                </SortableLegacyTh>
                <SortableLegacyTh sortKey="displayName" thProps={table.thProps}>
                  Name
                </SortableLegacyTh>
                <SortableLegacyTh sortKey="accessRoleKey" thProps={table.thProps}>
                  Access role
                </SortableLegacyTh>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {table.rows.map((u) => (
                <tr key={u.id}>
                  <td className={tdClass}>{u.email}</td>
                  <td className={tdClass}>{u.displayName || '—'}</td>
                  <td className={tdClass}>
                    <Badge tone={u.accessRoleKey === 'super_admin' ? 'primary' : 'neutral'}>
                      {u.accessRoleKey === 'super_admin' ? 'Super admin' : 'Member'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <LegacyTableFooter table={table} itemLabel="user" />
        </Panel>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Invite user"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={onSubmit}>
              Create user
            </Button>
          </>
        }
      >
        <form className="grid gap-4" onSubmit={onSubmit}>
          <Field label="Email">
            <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </Field>
          <Field label="Password">
            <Input type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} />
          </Field>
          <Field label="Display name">
            <Input value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} />
          </Field>
          <Field label="Access role">
            <Select value={form.accessRoleKey} onChange={(e) => setForm((f) => ({ ...f, accessRoleKey: e.target.value }))}>
              <option value="member">Member</option>
              <option value="super_admin">Super admin</option>
            </Select>
          </Field>
        </form>
      </Modal>
    </div>
  )
}
