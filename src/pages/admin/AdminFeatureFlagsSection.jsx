import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Panel } from '../../components/ui/Panel.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Switch from '../../components/ui/Switch.jsx'
import { Field, Input, Textarea } from '../../components/ui/FormControls.jsx'
import { apiFetch } from '../../lib/api.js'
import { useAppStore } from '../../stores/appStore.js'

const thClass = 'px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-ink-subtle'
const tdClass = 'px-3 py-2.5 text-sm text-ink'

const EMPTY = { key: '', label: '', description: '', navPath: '', sortOrder: '0' }

export default function AdminFeatureFlagsSection() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [flags, setFlags] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY)

  const load = useCallback(() => {
    return apiFetch('/api/admin/feature-flags')
      .then((r) => setFlags(r.flags ?? []))
      .catch((e) => pushToast({ tone: 'danger', title: 'Could not load feature flags', body: e.message }))
  }, [pushToast])

  useEffect(() => {
    load()
  }, [load])

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
    <div className="px-6 pb-10 pt-2">
      <Panel
        title="Client portal feature flags"
        description="Defaults apply to every client user unless a per-user override is set via the API."
        bodyClassName="p-0"
        actions={
          <Button type="button" onClick={() => setOpen(true)}>
            <Plus size={16} />
            Add flag
          </Button>
        }
      >
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
            <Input value={form.navPath} onChange={(e) => setForm((f) => ({ ...f, navPath: e.target.value }))} placeholder="/projects" />
          </Field>
          <Field label="Sort order">
            <Input type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}