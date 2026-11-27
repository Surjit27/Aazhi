import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { Field, Input, Select } from '../../components/ui/FormControls.jsx'
import { apiFetch } from '../../lib/api.js'
import { useAppStore } from '../../stores/appStore.js'

const thClass = 'px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-ink-subtle'
const tdClass = 'px-3 py-2.5 text-sm text-ink'

export default function EmailProvidersPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [providers, setProviders] = useState([])
  const [types, setTypes] = useState([])
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ provider: 'sendgrid', name: '' })

  const load = useCallback(() => {
    return Promise.all([
      apiFetch('/api/settings/email-providers').then((r) => setProviders(r.providers ?? [])),
      apiFetch('/api/settings/email-provider-types').then((r) => setTypes(r.types ?? [])),
    ]).catch((e) => pushToast({ tone: 'danger', title: 'Could not load email providers', body: e.message }))
  }, [pushToast])

  useEffect(() => {
    load()
  }, [load])

  const onCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await apiFetch('/api/settings/email-providers', { method: 'POST', body: form })
      setOpen(false)
      setForm({ provider: 'sendgrid', name: '' })
      pushToast({ title: 'Email provider created' })
      load()
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Create failed', body: err.message })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="px-6 pb-10 pt-2">
      <Panel
        title="Email providers"
        description="SendGrid today — configure, preview, and test from the provider row."
        bodyClassName="p-0"
        actions={
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus size={16} />
            Create email provider
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="bg-surface">
              <tr className="border-b border-line">
                <th className={thClass}>Name</th>
                <th className={thClass}>Type</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>From</th>
                <th className={thClass}>API key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {providers.map((row) => (
                <tr key={row.id}>
                  <td className={tdClass}>
                    <Link
                      to={`/settings/email/${row.id}`}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {row.name}
                    </Link>
                    {row.isDefault ? (
                      <Badge tone="primary" className="ml-2">
                        Default
                      </Badge>
                    ) : null}
                  </td>
                  <td className={tdClass}>{row.providerLabel}</td>
                  <td className={tdClass}>
                    <Badge tone={row.status === 'active' ? 'success' : 'neutral'}>{row.status}</Badge>
                  </td>
                  <td className={`${tdClass} font-mono text-xs`}>{row.fromEmail || '—'}</td>
                  <td className={tdClass}>{row.apiKeyMasked || '—'}</td>
                </tr>
              ))}
              {!providers.length ? (
                <tr>
                  <td colSpan={5} className="px-3 py-8 text-center text-sm text-ink-muted">
                    No providers yet. Create SendGrid to get started.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title="Create email provider">
        <form className="grid gap-4 p-1" onSubmit={onCreate}>
          <Field label="Provider type">
            <Select value={form.provider} onChange={(e) => setForm((c) => ({ ...c, provider: e.target.value }))}>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Display name">
            <Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="Production SendGrid" />
          </Field>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}