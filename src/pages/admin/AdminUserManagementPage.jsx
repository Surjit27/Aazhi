import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api.js'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import { Field, Input } from '../../components/ui/FormControls.jsx'
import UserDirectoryTable from '../../features/admin/UserDirectoryTable.jsx'
import { useAppStore } from '../../stores/appStore.js'

export default function AdminUserManagementPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })

  const load = () =>
    apiFetch('/api/auth/users?role=admin')
      .then((r) => setUsers(r.users))
      .catch((e) => pushToast({ tone: 'danger', title: 'Failed to load admins', body: e.message }))

  useEffect(() => {
    load()
  }, [pushToast])

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiFetch('/api/auth/users', { method: 'POST', body: { ...form, role: 'admin' } })
      pushToast({ title: 'Admin user created', body: form.email })
      setForm({ email: '', password: '', displayName: '' })
      load()
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not create admin', body: err.message })
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Admin user management"
        description="Accounts that sign in at admin.localhost — stored in PostgreSQL."
      />

      <div className="flex flex-col gap-5 p-4 md:p-6">
        <Panel title="Create admin user">
          <form className="grid gap-4 p-4 md:grid-cols-2 lg:grid-cols-4 lg:items-end" onSubmit={onSubmit}>
            <Field label="Email">
              <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </Field>
            <Field label="Display name">
              <Input value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} />
            </Field>
            <Field label="Password" hint="Min. 8 characters">
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
              />
            </Field>
            <Button type="submit" variant="primary" className="h-9">
              Add admin
            </Button>
          </form>
        </Panel>

        <Panel title={`Administrators (${users.length})`} bodyClassName="p-0">
          <UserDirectoryTable users={users} emptyMessage="No admin users besides the seeded account." />
        </Panel>
      </div>
    </div>
  )
}
