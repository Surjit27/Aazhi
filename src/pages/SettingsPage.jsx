import { useEffect, useState } from 'react'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import Button from '../components/ui/Button.jsx'
import Switch from '../components/ui/Switch.jsx'
import { Field, Input } from '../components/ui/FormControls.jsx'
import { apiFetch } from '../lib/api.js'
import { getPortal, PORTAL } from '../lib/portal.js'
import { useAppStore } from '../stores/appStore.js'

const EMPTY = {
  enabled: false,
  fromEmail: '',
  fromName: '',
  apiKey: '',
  apiKeySet: false,
  apiKeySource: 'none',
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
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <EmailSettings />
      </div>
    </div>
  )
}

function EmailSettings() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [form, setForm] = useState(EMPTY)
  const [testTo, setTestTo] = useState('')
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  useEffect(() => {
    apiFetch('/api/settings/email')
      .then(({ email }) => setForm({ ...EMPTY, ...email, apiKey: '' }))
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
      setForm({ ...EMPTY, ...email, apiKey: '' })
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
