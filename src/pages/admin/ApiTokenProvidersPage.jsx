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

export default function ApiTokenProvidersPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [providers, setProviders] = useState([])
  const [types, setTypes] = useState([])
  const [storageNote, setStorageNote] = useState('')
  const [open, setOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({ provider: 'openai', name: '' })

  const load = useCallback(() => {
    return Promise.all([
      apiFetch('/api/settings/api-tokens').then((r) => setProviders(r.providers ?? [])),
      apiFetch('/api/settings/api-token-types').then((r) => {
        setTypes(r.types ?? [])
        setStorageNote(r.storageNote ?? '')
      }),
    ]).catch((e) => pushToast({ tone: 'danger', title: 'Could not load API tokens', body: e.message }))
  }, [pushToast])

  useEffect(() => {
    load()
  }, [load])

  const onCreate = async (e) => {
    e.preventDefault()
    setCreating(true)
    try {
      await apiFetch('/api/settings/api-tokens', { method: 'POST', body: form })
      setOpen(false)
      setForm({ provider: 'openai', name: '' })
      pushToast({ title: 'API token provider created' })
      load()
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Create failed', body: err.message })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="px-6 pb-10 pt-2">
      {storageNote ? <p className="mb-3 text-xs text-ink-muted">{storageNote}</p> : null}
      <Panel
        title="Model API tokens"
        description="OpenAI, Gemini, Claude, Cursor, Cerebras, Groq, Mistral, OpenRouter."
        bodyClassName="p-0"
        actions={
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus size={16} />
            Create API token
          </Button>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] border-collapse">
            <thead className="bg-surface">
              <tr className="border-b border-line">
                <th className={thClass}>Name</th>
                <th className={thClass}>Provider</th>
                <th className={thClass}>Status</th>
                <th className={thClass}>Free allowance</th>
                <th className={thClass}>Best for</th>
                <th className={thClass}>Key</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line bg-white">
              {providers.map((row) => (
                <tr key={row.id}>
                  <td className={tdClass}>
                    <Link
                      to={`/settings/api/${row.id}`}
                      className="font-medium text-primary-600 hover:underline"
                    >
                      {row.name}
                    </Link>
                  </td>
                  <td className={tdClass}>{row.providerLabel}</td>
                  <td className={tdClass}>
                    <Badge tone={row.status === 'active' ? 'success' : 'neutral'}>{row.status}</Badge>
                  </td>
                  <td className={`${tdClass} text-xs text-ink-muted`}>{row.freeAllowance || '—'}</td>
                  <td className={`${tdClass} text-xs text-ink-muted`}>{row.bestFor || '—'}</td>
                  <td className={tdClass}>{row.apiKeyMasked || '—'}</td>
                </tr>
              ))}
              {!providers.length ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-sm text-ink-muted">
                    No API tokens yet. Create a provider row to store a key.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title="Create API token">
        <form className="grid gap-4" onSubmit={onCreate}>
          <Field label="Provider">
            <Select value={form.provider} onChange={(e) => setForm((c) => ({ ...c, provider: e.target.value }))}>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Display name">
            <Input value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} placeholder="Team OpenAI" />
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