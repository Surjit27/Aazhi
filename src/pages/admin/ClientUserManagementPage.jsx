import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api.js'
import { clientAppOrigin } from '../../lib/portal.js'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Field, Input } from '../../components/ui/FormControls.jsx'
import UserDirectoryTable from '../../features/admin/UserDirectoryTable.jsx'
import { useAppStore } from '../../stores/appStore.js'

const EMPTY = { email: '', password: '', displayName: '' }

export default function ClientUserManagementPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [users, setUsers] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const load = () =>
    apiFetch('/api/auth/users?role=client')
      .then((r) => setUsers(r.users))
      .catch((e) => pushToast({ tone: 'danger', title: 'Failed to load clients', body: e.message }))

  useEffect(() => {
    load()
  }, [pushToast])

  const openAsClient = async (user) => {
    try {
      const { code } = await apiFetch('/api/auth/impersonate', { method: 'POST', body: { userId: user.id } })
      window.open(`${clientAppOrigin()}/session#${code}`, '_blank', 'noopener')
      pushToast({ title: 'Client tab opened', body: `${user.email} — one-time link, expires in 60 seconds` })
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not open client session', body: err.message })
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiFetch('/api/auth/users', { method: 'POST', body: { ...form, role: 'client' } })
      pushToast({ title: 'Client user created', body: form.email })
      setForm(EMPTY)
      setOpen(false)
      load()
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not create client', body: err.message })
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Client user management"
        actions={
          <Button variant="primary" onClick={() => setOpen(true)}>
            Create users
          </Button>
        }
      />

      <div className="flex flex-col gap-5 p-4 md:p-6">
        <Panel title={`Client users (${users.length})`} bodyClassName="p-0">
          <UserDirectoryTable
            users={users}
            emptyMessage="No client users yet."
            onImpersonate={openAsClient}
          />
        </Panel>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create client user"
        footer={
          <>
            <Button type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-client-user" variant="primary">
              Create users
            </Button>
          </>
        }
      >
        <form id="create-client-user" className="flex flex-col gap-4" onSubmit={onSubmit}>
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
        </form>
      </Modal>
    </div>
  )
}
