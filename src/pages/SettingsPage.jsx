import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import Button from '../components/ui/Button.jsx'
import Switch from '../components/ui/Switch.jsx'
import { Field, Input } from '../components/ui/FormControls.jsx'
import { apiFetch } from '../lib/api.js'
import { clientAppOrigin, getPortal, PORTAL } from '../lib/portal.js'
import { formatAccessRoleLabel } from '../lib/accessRoles.js'
import { useAppStore } from '../stores/appStore.js'
import { useAuthStore } from '../stores/authStore.js'
import { brandBreadcrumbs } from '../lib/breadcrumbs.js'

const EMAIL_TABS = [
  { id: 'configuration', label: 'Configuration' },
  { id: 'test', label: 'Test send' },
]

const EMPTY_EMAIL = {
  enabled: false,
  fromEmail: '',
  fromName: '',
  apiKey: '',
  apiKeySet: false,
  apiKeySource: 'none',
}

function ClientSettingsPage() {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Settings"
        description="Workspace preferences on the client portal."
        breadcrumbs={brandBreadcrumbs('Pages', 'Settings')}
      />
      <div className="flex flex-col gap-6 px-6 pb-10">
        <Panel title="Your account">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="glass-inset p-4">
              <p className="text-xs font-medium text-ink-muted">Signed in as</p>
              <p className="mt-1 text-sm font-semibold text-ink">{user?.displayName || '—'}</p>
              <p className="text-xs text-ink-muted">{user?.email || '—'}</p>
              <p className="mt-2 text-xs text-ink-muted">
                Access role: {formatAccessRoleLabel(user?.accessRoleKey)}
              </p>
            </div>
            <div className="glass-inset p-4">
              <p className="text-xs font-medium text-ink-muted">Client portal</p>
              <p className="mt-1 font-mono text-xs text-ink">{clientAppOrigin().replace(/^https?:\/\//, '')}</p>
              <Link to="/account" className="mt-3 inline-block text-xs font-medium text-primary-600 hover:underline">
                Open full account view →
              </Link>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function AdminSettingsPage() {
  const [tab, setTab] = useState('configuration')

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Settings" />
      <div className="flex flex-1 flex-col overflow-y-auto p-4 md:p-6">
        <Panel title="Email configuration" bodyClassName="p-0">
          <div className="border-b border-line px-4 py-3">
            <div className="inline-flex gap-1 rounded-lg border border-line bg-surface p-0.5" role="tablist" aria-label="Email settings">
              {EMAIL_TABS.map(({ id, label }) => {
                const active = tab === id
                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setTab(id)}
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                      active ? 'bg-white text-ink shadow-card' : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="p-4">
            {tab === 'configuration' && <EmailConfigurationTab />}
            {tab === 'test' && <EmailTestTab />}
          </div>
        </Panel>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  if (getPortal() === PORTAL.CLIENT) {
    return <ClientSettingsPage />
  }

  if (getPortal() !== PORTAL.ADMIN) {
    return (
      <div className="flex min-h-0 flex-1 flex-col">
        <PageHeader title="Settings" />
      </div>
    )
  }

  return <AdminSettingsPage />
}

function EmailConfigurationTab() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [form, setForm] = useState(EMPTY_EMAIL)
  const [saving, setSaving] = useState(false)

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

  const keyHint =
    form.apiKeySource === 'env'
      ? 'Using SENDGRID_API_KEY from the API environment. Paste a key here to override it.'
      : form.apiKeySource === 'saved'
        ? 'A key is saved. Leave this blank to keep it.'
        : 'Create a key in SendGrid. It starts with SG. and is stored encrypted.'

  return (
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
        <Input value={form.fromName} onChange={set('fromName')} placeholder="deepe" />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save email'}
        </Button>
      </div>
    </form>
  )
}

function EmailTestTab() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [testTo, setTestTo] = useState('')
  const [testing, setTesting] = useState(false)

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

  return (
    <div className="grid max-w-xl grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
      <Field label="Send a test to">
        <Input type="email" value={testTo} onChange={(event) => setTestTo(event.target.value)} placeholder="you@example.com" />
      </Field>
      <Button type="button" onClick={sendTest} disabled={testing}>
        {testing ? 'Sending…' : 'Send test'}
      </Button>
    </div>
  )
}
