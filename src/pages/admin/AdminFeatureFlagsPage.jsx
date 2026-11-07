import { useEffect, useState } from 'react'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Switch from '../../components/ui/Switch.jsx'
import { Field, Input, Textarea } from '../../components/ui/FormControls.jsx'
import { thClass, tdClass } from '../../features/explorer/ExplorerInsights.jsx'
import { apiFetch } from '../../lib/api.js'
import { useAppStore } from '../../stores/appStore.js'

const EMPTY = { key: '', label: '', description: '', navPath: '', sortOrder: '0' }

export default function AdminFeatureFlagsPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [flags, setFlags] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const load = () =>
    apiFetch('/api/admin/feature-flags')
      .then((r) => setFlags(r.flags))
      .catch((e) => pushToast({ tone: 'danger', title: 'Could not load feature flags', body: e.message }))

  useEffect(() => {
    load()
  }, [pushToast])

  const toggleDefault = async (flag) => {
    try {
      const { flag: updated } = await apiFetch(`/api/admin/feature-flags/${encodeURIComponent(flag.key)}`, {
        method: 'PATCH',
        body: { defaultEnabled: !flag.defaultEnabled },
      })
      setFlags((rows) => rows.map((r) => (r.key === updated.key ? updated : r)))
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not update flag', body: err.message })
    }
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    try {
      await apiFetch('/api/admin/feature-flags', {
        method: 'POST',
        body: {
          key: form.key,
          label: form.label,
          description: form.description,
          navPath: form.navPath,
          sortOrder: Number(form.sortOrder) || 0,
          defaultEnabled: true,
        },
      })
      pushToast({ title: 'Feature flag created', body: form.key })
      setForm(EMPTY)
      setOpen(false)
      load()
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not create flag', body: err.message })
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Feature flags"
        actions={
          <Button variant="primary" onClick={() => setOpen(true)}>
            Add flag
          </Button>
        }
      />
      <div className="p-4 md:p-6">
        <Panel title="Client portal services" bodyClassName="p-0">
          <p className="border-b border-line px-4 py-3 text-xs text-ink-muted">
            Toggle defaults for all clients. Per-client PostgreSQL schemas are provisioned when a client user is created (
            <span className="font-mono">client_&lt;uuid&gt;</span>).
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead className="bg-surface">
                <tr className="border-b border-line">
                  <th className={thClass}>Label</th>
                  <th className={thClass}>Key</th>
                  <th className={thClass}>Nav path</th>
                  <th className={thClass}>Default on</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {flags.map((flag) => (
                  <tr key={flag.key} className="hover:bg-surface/80">
                    <td className={tdClass}>
                      <p className="text-sm font-medium text-ink">{flag.label}</p>
                      {flag.description && <p className="text-xs text-ink-muted">{flag.description}</p>}
                    </td>
                    <td className={`${tdClass} font-mono text-xs`}>{flag.key}</td>
                    <td className={`${tdClass} font-mono text-xs text-ink-muted`}>{flag.navPath || '—'}</td>
                    <td className={tdClass}>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={flag.defaultEnabled}
                          onChange={() => toggleDefault(flag)}
                          label={`Default for ${flag.key}`}
                        />
                        <Badge tone={flag.defaultEnabled ? 'success' : 'neutral'}>{flag.defaultEnabled ? 'On' : 'Off'}</Badge>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New feature flag"
        footer={
          <>
            <Button type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="create-feature-flag" variant="primary">
              Create
            </Button>
          </>
        }
      >
        <form id="create-feature-flag" className="flex flex-col gap-4" onSubmit={onSubmit}>
          <Field label="Key" hint="e.g. client.reports">
            <Input value={form.key} onChange={(e) => setForm((f) => ({ ...f, key: e.target.value }))} required />
          </Field>
          <Field label="Label">
            <Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} required />
          </Field>
          <Field label="Description">
            <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          </Field>
          <Field label="Client nav path" hint="Optional — hide sidebar item when off">
            <Input value={form.navPath} onChange={(e) => setForm((f) => ({ ...f, navPath: e.target.value }))} placeholder="/reports" />
          </Field>
          <Field label="Sort order">
            <Input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
