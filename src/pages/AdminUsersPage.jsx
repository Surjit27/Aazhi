import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api.js'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/FormControls.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useAppStore } from '../stores/appStore.js'
import { thClass, tdClass } from '../features/explorer/ExplorerInsights.jsx'

export default function AdminUsersPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [users, setUsers] = useState([])
  const [form, setForm] = useState({ email: '', password: '', displayName: '' })

  const load = () =>
    apiFetch('/api/auth/users?role=client')
      .then((r) => setUsers(r.users))
      .catch((e) => pushToast({ tone: 'danger', title: 'Failed to load users', body: e.message }))

  useEffect(() => {
    load()
  }, [])

  const createClient = async (e) => {
    e.preventDefault()
    try {
      await apiFetch('/api/auth/users', { method: 'POST', body: form })
      pushToast({ title: 'Client created', body: form.email })
      setForm({ email: '', password: '', displayName: '' })
      load()
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not create user', body: err.message })
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader title="Users" description="Create and manage client accounts (stored in PostgreSQL)." />

      <div className="grid gap-5 p-6 lg:grid-cols-2">
        <Panel title="New client user">
          <form className="flex flex-col gap-3 p-4" onSubmit={createClient}>
            <Field label="Email">
              <Input value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} required />
            </Field>
            <Field label="Display name">
              <Input value={form.displayName} onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))} />
            </Field>
            <Field label="Temporary password" hint="Minimum 8 characters">
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
                minLength={8}
              />
            </Field>
            <Button type="submit" variant="primary">
              Create client
            </Button>
          </form>
        </Panel>

        <Panel title="Client accounts" bodyClassName="p-0">
          <table className="w-full border-collapse">
            <thead className="bg-surface">
              <tr className="border-b border-line">
                <th className={thClass}>Email</th>
                <th className={thClass}>Name</th>
                <th className={thClass}>Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className={`${tdClass} font-mono text-xs`}>{u.email}</td>
                  <td className={tdClass}>{u.displayName}</td>
                  <td className={tdClass}>
                    <Badge tone="primary">{u.role}</Badge>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td className={`${tdClass} text-xs text-ink-muted`} colSpan={3}>
                    No client users yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Panel>
      </div>
    </div>
  )
}
