import { useEffect, useState } from 'react'
import { Plus, Trash } from 'lucide-react'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import Button from '../components/ui/Button.jsx'
import Switch from '../components/ui/Switch.jsx'
import Modal from '../components/ui/Modal.jsx'
import Badge from '../components/ui/Badge.jsx'
import { Field, Input, Select, Textarea } from '../components/ui/FormControls.jsx'
import { apiFetch } from '../lib/api.js'
import { getPortal, PORTAL } from '../lib/portal.js'
import { useAppStore } from '../stores/appStore.js'
import { RECURRENCES, SCHEDULE_TARGETS, TRIGGER_TYPES } from '../data/schedules.js'

const EMPTY_EMAIL = {
  enabled: false,
  fromEmail: '',
  fromName: '',
  apiKey: '',
  apiKeySet: false,
  apiKeySource: 'none',
}

const EMPTY_JOB = {
  name: '',
  trigger: 'time',
  recurrence: 'daily',
  startAt: '',
  eventName: '',
  dependsOn: '',
  target: SCHEDULE_TARGETS[0].id,
  payload: '{\n}',
  enabled: true,
}

export default function SettingsPage() {
  if (getPortal() !== PORTAL.ADMIN) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader title="Settings" />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Settings" />
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 md:p-6">
        <EmailSettings />
        <JobTriggerSettings />
      </div>
    </div>
  )
}

function EmailSettings() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [form, setForm] = useState(EMPTY_EMAIL)
  const [testTo, setTestTo] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    apiFetch('/api/settings/email')
      .then(({ email }) => setForm({ ...EMPTY_EMAIL, ...email, apiKey: '' }))
      .catch((err) => pushToast({ tone: 'danger', title: 'Could not load email settings', body: err.message }))
  }, [pushToast])

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    try {
      const { email } = await apiFetch('/api/settings/email', {
        method: 'PUT',
        body: {
          enabled: form.enabled,
          fromEmail: form.fromEmail,
          fromName: form.fromName,
          apiKey: form.apiKey || undefined,
        },
      })
      setForm({ ...EMPTY_EMAIL, ...email, apiKey: '' })
      pushToast({ title: 'Email settings saved' })
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not save email settings', body: err.message })
    } finally {
      setSaving(false)
    }
  }

  const sendTest = async () => {
    setTesting(true)
    try {
      const result = await apiFetch('/api/settings/email/test', { method: 'POST', body: { to: testTo } })
      pushToast({ title: 'Test email sent', body: result.to })
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not send test email', body: err.message })
    } finally {
      setTesting(false)
    }
  }

  const keyHint =
    form.apiKeySource === 'env'
      ? 'Using SENDGRID_API_KEY from the API environment. Paste a key here to override it.'
      : form.apiKeySource === 'saved'
        ? 'A key is saved. Leave this blank to keep it.'
        : 'Create a key in SendGrid. It starts with SG. and is stored encrypted.'

  return (
    <Panel title="Email configuration" bodyClassName="p-4">
      <form className="grid max-w-xl grid-cols-1 gap-4" onSubmit={save}>
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-ink">Enabled</span>
          <Switch checked={form.enabled} onChange={(enabled) => setForm((current) => ({ ...current, enabled }))} label="Enable email" />
        </div>
        <Field label="SendGrid API key" hint={keyHint}>
          <Input type="password" value={form.apiKey} onChange={set('apiKey')} autoComplete="off" placeholder="SG." />
        </Field>
        <Field label="From address">
          <Input type="email" value={form.fromEmail} onChange={set('fromEmail')} placeholder="noreply@example.com" required={form.enabled} />
        </Field>
        <Field label="From name">
          <Input value={form.fromName} onChange={set('fromName')} placeholder="Aazhi" />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving…' : 'Save email'}</Button>
        </div>
      </form>
      <div className="mt-4 grid max-w-xl grid-cols-1 gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field label="Send a test to">
          <Input type="email" value={testTo} onChange={(event) => setTestTo(event.target.value)} placeholder="you@example.com" />
        </Field>
        <Button type="button" onClick={sendTest} disabled={testing}>{testing ? 'Sending…' : 'Send test'}</Button>
      </div>
    </Panel>
  )
}

function JobTriggerSettings() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [triggers, setTriggers] = useState([])
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_JOB)

  const load = () =>
    apiFetch('/api/settings/job-triggers')
      .then((data) => setTriggers(data.triggers))
      .catch((err) => pushToast({ tone: 'danger', title: 'Could not load job triggers', body: err.message }))

  useEffect(() => {
    load()
  }, [pushToast])

  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }))

  const save = async (event) => {
    event.preventDefault()
    try {
      await apiFetch('/api/settings/job-triggers', { method: 'POST', body: form })
      pushToast({ title: 'Job trigger created', body: form.name })
      setForm(EMPTY_JOB)
      setOpen(false)
      load()
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not create job trigger', body: err.message })
    }
  }

  const remove = async (row) => {
    try {
      await apiFetch(`/api/settings/job-triggers/${row.id}`, { method: 'DELETE' })
      pushToast({ title: 'Job trigger deleted', body: row.name })
      load()
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not delete job trigger', body: err.message })
    }
  }

  return (
    <Panel
      title="Job triggers"
      actions={<Button variant="primary" size="sm" onClick={() => setOpen(true)}><Plus size={13} /> New trigger</Button>}
      bodyClassName="p-0"
    >
      {triggers.length === 0 ? (
        <p className="px-4 py-6 text-sm text-ink-muted">No job triggers yet.</p>
      ) : (
        <ul className="divide-y divide-line">
          {triggers.map((row) => (
            <li key={row.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-medium text-ink">{row.name}</p>
                  <Badge tone="primary">{TRIGGER_TYPES[row.trigger]?.label ?? row.trigger}</Badge>
                  {!row.enabled && <Badge tone="neutral">Disabled</Badge>}
                </div>
                <p className="mt-0.5 font-mono text-xs text-ink-muted">{row.target}</p>
              </div>
              <Button size="sm" variant="ghost" aria-label={`Delete ${row.name}`} onClick={() => remove(row)}>
                <Trash size={13} />
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="New job trigger"
        width="max-w-xl"
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={save}>Save trigger</Button>
          </div>
        }
      >
        <form className="grid grid-cols-1 gap-4 sm:grid-cols-2" onSubmit={save}>
          <Field label="Name" className="sm:col-span-2">
            <Input value={form.name} onChange={set('name')} required />
          </Field>
          <Field label="Trigger">
            <Select value={form.trigger} onChange={set('trigger')}>
              {Object.entries(TRIGGER_TYPES).map(([id, item]) => (
                <option key={id} value={id}>{item.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Target">
            <Select value={form.target} onChange={set('target')}>
              {SCHEDULE_TARGETS.map((item) => (
                <option key={item.id} value={item.id}>{item.id}</option>
              ))}
            </Select>
          </Field>
          {form.trigger === 'time' && (
            <>
              <Field label="Recurrence">
                <Select value={form.recurrence} onChange={set('recurrence')}>
                  {RECURRENCES.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Start at">
                <Input
                  type="datetime-local"
                  value={form.startAt ? String(form.startAt).slice(0, 16) : ''}
                  onChange={(event) => setForm((current) => ({ ...current, startAt: event.target.value ? `${event.target.value}:00Z` : '' }))}
                  required
                />
              </Field>
            </>
          )}
          {form.trigger === 'event' && (
            <Field label="Event name" className="sm:col-span-2">
              <Input value={form.eventName} onChange={set('eventName')} placeholder="order.confirmed" required />
            </Field>
          )}
          {form.trigger === 'dependency' && (
            <Field label="Runs after" className="sm:col-span-2">
              <Select value={form.dependsOn} onChange={set('dependsOn')} required>
                <option value="">Choose a job</option>
                {triggers.map((row) => (
                  <option key={row.id} value={row.id}>{row.name}</option>
                ))}
              </Select>
            </Field>
          )}
          <Field label="Payload (JSON)" className="sm:col-span-2">
            <Textarea rows={4} value={form.payload} onChange={set('payload')} />
          </Field>
        </form>
      </Modal>
    </Panel>
  )
}
