import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, RefreshCw } from 'lucide-react'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Switch from '../components/ui/Switch.jsx'
import PillTabNav from '../components/ui/PillTabNav.jsx'
import { Field, Input, Select } from '../components/ui/FormControls.jsx'
import { apiFetch } from '../lib/api.js'
import { clientAppOrigin, getPortal, PORTAL } from '../lib/portal.js'
import { formatAccessRoleLabel } from '../lib/accessRoles.js'
import { useAppStore } from '../stores/appStore.js'
import { useAuthStore } from '../stores/authStore.js'
import { brandBreadcrumbs } from '../lib/breadcrumbs.js'
import {
  AI_MODELS,
  AI_SCAN_DEPTHS,
  saveAiSettings,
  usePlatformSettingsStore,
} from '../stores/platformSettingsStore.js'

const SETTINGS_TABS = [
  { id: 'email', label: 'SendGrid email' },
  { id: 'ai', label: 'AI configuration' },
]

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
  apiKeyMasked: null,
  apiKeySavedInDatabase: false,
  storageTable: 'email_settings',
  storageColumn: null,
  updatedAt: null,
}

const thClass = 'px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-ink-subtle'
const tdClass = 'px-3 py-2.5 text-sm text-ink'

function formatSettingsTimestamp(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString()
}

function apiKeySourceLabel(source) {
  if (source === 'saved') return 'Database (encrypted)'
  if (source === 'env') return 'API environment'
  return 'Not configured'
}

function SendGridSavedKeysTable({ email }) {
  const rows = [
    {
      label: 'PostgreSQL table',
      value: (
        <span className="font-mono text-xs">
          public.{email.storageTable ?? 'email_settings'}
          {email.storageColumn ? (
            <>
              <span className="text-ink-muted"> · </span>
              {email.storageColumn}
            </>
          ) : null}
        </span>
      ),
    },
    {
      label: 'API key',
      value: email.apiKeyMasked ? (
        <span className="font-mono text-xs">{email.apiKeyMasked}</span>
      ) : (
        <span className="text-ink-muted">No key</span>
      ),
    },
    {
      label: 'Key source',
      value: (
        <Badge tone={email.apiKeySet ? 'success' : 'neutral'}>{apiKeySourceLabel(email.apiKeySource)}</Badge>
      ),
    },
    {
      label: 'From address',
      value: email.fromEmail || '—',
    },
    {
      label: 'From name',
      value: email.fromName || '—',
    },
    {
      label: 'Last saved',
      value: <span className="text-xs tabular-nums text-ink-muted">{formatSettingsTimestamp(email.updatedAt)}</span>,
    },
    {
      label: 'Delivery',
      value: <Badge tone={email.enabled ? 'success' : 'neutral'}>{email.enabled ? 'Enabled' : 'Disabled'}</Badge>,
    },
  ]

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <table className="w-full min-w-[320px] border-collapse">
        <thead className="bg-surface">
          <tr className="border-b border-line">
            <th className={thClass}>Setting</th>
            <th className={thClass}>Current value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line bg-white">
          {rows.map((row) => (
            <tr key={row.label}>
              <td className={`${tdClass} w-[40%] text-xs font-medium text-ink-muted`}>{row.label}</td>
              <td className={tdClass}>{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-line bg-surface px-3 py-2 text-[11px] text-ink-subtle">
        Keys pasted in the form below are encrypted at rest; only a masked suffix is shown here.
      </p>
    </div>
  )
}

function SettingsPillBar({ tab, onTab }) {
  return (
    <div className="border-b border-line px-6 pb-4 pt-2">
      <PillTabNav tabs={SETTINGS_TABS} value={tab} onChange={onTab} ariaLabel="Settings sections" />
    </div>
  )
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
      <div className="flex flex-col gap-6 px-6 py-6">
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
  const [tab, setTab] = useState('email')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Settings"
        description="SendGrid delivery and AI worker defaults."
        breadcrumbs={brandBreadcrumbs('Admin', 'Settings')}
      />
      <SettingsPillBar tab={tab} onTab={setTab} />
      <div className="flex flex-col gap-6 px-6 pb-10 pt-2">
        {tab === 'email' && <AdminEmailSettingsSection />}
        {tab === 'ai' && <AdminAiSettingsSection />}
      </div>
    </div>
  )
}

function AdminEmailSettingsSection() {
  const [emailTab, setEmailTab] = useState('configuration')

  return (
    <Panel
      title="SendGrid"
      description="Transactional email for invites, alerts, and admin notifications."
      bodyClassName="p-0"
    >
      <div className="border-b border-line px-4 py-3">
        <PillTabNav tabs={EMAIL_TABS} value={emailTab} onChange={setEmailTab} ariaLabel="Email settings" />
      </div>
      <div className="p-4">
        {emailTab === 'configuration' && <EmailConfigurationTab />}
        {emailTab === 'test' && <EmailTestTab />}
      </div>
    </Panel>
  )
}

function AdminAiSettingsSection() {
  const ai = usePlatformSettingsStore((s) => s.ai)
  const pushToast = useAppStore((s) => s.pushToast)
  const [aiDraft, setAiDraft] = useState(ai)
  const [workerStatus, setWorkerStatus] = useState(null)
  const [pinging, setPinging] = useState(false)

  useEffect(() => {
    setAiDraft(ai)
  }, [ai])

  const pingWorker = async () => {
    const base = aiDraft.workerBaseUrl.replace(/\/$/, '')
    setPinging(true)
    setWorkerStatus(null)
    try {
      const res = await fetch(`${base}/health`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const body = await res.json()
      setWorkerStatus({ ok: true, body })
      pushToast({ title: 'AI worker reachable', body: body.service ?? 'health OK' })
    } catch (err) {
      setWorkerStatus({ ok: false, error: err.message })
      pushToast({ tone: 'danger', title: 'AI worker unreachable', body: err.message })
    } finally {
      setPinging(false)
    }
  }

  return (
    <>
      <Panel title="AI worker service" description="Python indexing and decode API used by BullMQ jobs.">
        <div className="grid gap-4 p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
            <Field
              label="Base URL"
              hint="Use /ai-worker in Vite dev (proxied to port 4100). In production, set VITE_AI_WORKER_URL."
            >
              <Input
                value={aiDraft.workerBaseUrl}
                onChange={(e) => setAiDraft((c) => ({ ...c, workerBaseUrl: e.target.value }))}
                placeholder="/ai-worker"
              />
            </Field>
            <Button type="button" variant="secondary" onClick={pingWorker} disabled={pinging}>
              {pinging ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              {pinging ? 'Checking…' : 'Test connection'}
            </Button>
          </div>
          {workerStatus && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge tone={workerStatus.ok ? 'success' : 'danger'}>
                {workerStatus.ok ? 'Connected' : 'Unreachable'}
              </Badge>
              {workerStatus.ok && workerStatus.body?.postgres_schema ? (
                <span className="text-ink-muted">Schema: {workerStatus.body.postgres_schema}</span>
              ) : null}
              {workerStatus.error ? <span className="text-danger-700">{workerStatus.error}</span> : null}
            </div>
          )}
        </div>
      </Panel>

      <Panel title="Agent defaults" description="Starting values for reverse-engineer runs and the assistant.">
        <form
          className="grid max-w-xl grid-cols-1 gap-4 p-5"
          onSubmit={(e) => {
            e.preventDefault()
            saveAiSettings(aiDraft, pushToast)
          }}
        >
          <Field label="Default model">
            <Select
              value={aiDraft.defaultModel}
              onChange={(e) => setAiDraft((c) => ({ ...c, defaultModel: e.target.value }))}
            >
              {AI_MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Repository scan depth">
            <Select
              value={aiDraft.scanDepth}
              onChange={(e) => setAiDraft((c) => ({ ...c, scanDepth: e.target.value }))}
            >
              {AI_SCAN_DEPTHS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Max tokens per step" hint="Upper bound for decode / summarization calls.">
            <Input
              type="number"
              min={512}
              max={128000}
              value={aiDraft.maxTokens}
              onChange={(e) => setAiDraft((c) => ({ ...c, maxTokens: Number(e.target.value) || 4096 }))}
            />
          </Field>
          <div className="glass-inset rounded-lg p-4">
            <p className="text-[10px] font-semibold uppercase text-ink-subtle">Model API keys</p>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">
              Set <span className="font-mono">OPENAI_API_KEY</span> and <span className="font-mono">GOOGLE_API_KEY</span> on the
              Python API (<span className="font-mono">.env</span>). Keys are not stored in the browser.
            </p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              Save AI settings
            </Button>
          </div>
        </form>
      </Panel>
    </>
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
    <div className="grid max-w-2xl grid-cols-1 gap-5">
      <SendGridSavedKeysTable email={form} />
      <form className="grid grid-cols-1 gap-4" onSubmit={save}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-ink">Enabled</span>
        <Switch checked={form.enabled} onChange={(enabled) => setForm((current) => ({ ...current, enabled }))} label="Enable email" />
      </div>
      <Field label="SendGrid API key" hint={keyHint}>
        <Input type="password" value={form.apiKey} onChange={set('apiKey')} autoComplete="off" placeholder="SG." />
      </Field>
      <Field
        label="From address"
        hint="Must match a verified Sender Identity in SendGrid (Settings → Sender Authentication). Use that exact email here—not a placeholder domain."
      >
        <Input type="email" value={form.fromEmail} onChange={set('fromEmail')} placeholder="noreply@yourdomain.com" required={form.enabled} />
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
    </div>
  )
}

function EmailTestTab() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [testTo, setTestTo] = useState('')
  const [testing, setTesting] = useState(false)
  const [fromEmail, setFromEmail] = useState('')

  useEffect(() => {
    apiFetch('/api/settings/email')
      .then(({ email }) => setFromEmail(email.fromEmail || ''))
      .catch(() => setFromEmail(''))
  }, [])

  const sendTest = async () => {
    setTesting(true)
    try {
      const result = await apiFetch('/api/settings/email/test', { method: 'POST', body: { to: testTo } })
      const body = [
        `To: ${result.to}`,
        result.from ? `From: ${result.from}` : null,
        result.messageId ? `SendGrid ID: ${result.messageId}` : null,
        result.deliveryNote || 'Check inbox and spam. In SendGrid: Email Activity.',
      ]
        .filter(Boolean)
        .join(' · ')
      pushToast({ title: 'SendGrid accepted the test', body })
    } catch (err) {
      const body = String(err.message ?? '')
      const senderIdentity = /sender identity|verified sender/i.test(body)
      pushToast({
        tone: 'danger',
        title: senderIdentity ? 'From address not verified in SendGrid' : 'Could not send test email',
        body: senderIdentity
          ? `${body} In SendGrid: Settings → Sender Authentication → verify Single Sender or authenticate your domain, then set the same From address here.`
          : body,
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="grid max-w-2xl grid-cols-1 gap-4">
      <div className="rounded-lg border border-warning-50 bg-warning-50/40 p-4 text-sm text-ink">
        <p className="font-medium text-ink">Sender identity must match SendGrid</p>
        <p className="mt-2 text-xs leading-relaxed text-ink-muted">
          Current <span className="font-medium text-ink">From address</span>:{' '}
          <span className="font-mono">{fromEmail || '(none saved—set on Configuration tab)'}</span>
        </p>
        <ol className="mt-3 list-decimal space-y-1.5 pl-4 text-xs text-ink-muted">
          <li>
            Open{' '}
            <a
              href="https://app.sendgrid.com/settings/sender_auth/senders"
              target="_blank"
              rel="noreferrer"
              className="font-medium text-primary-600 hover:underline"
            >
              SendGrid → Single Sender Verification
            </a>{' '}
            (same login as the account that owns your API key).
          </li>
          <li>
            Create or open the sender for <span className="font-mono">{fromEmail || 'your From email'}</span> and complete
            verification (link in the inbox for that address).
          </li>
          <li>
            Save the <strong>same</strong> address on the Configuration tab, then run test send again.
          </li>
        </ol>
        <a
          href="https://sendgrid.com/docs/for-developers/sending-email/sender-identity/"
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-block text-xs font-medium text-primary-600 hover:underline"
        >
          SendGrid sender identity docs →
        </a>
        <p className="mt-3 border-t border-warning-50 pt-3 text-xs text-ink-muted">
          API <strong className="text-ink">200</strong> means SendGrid accepted the message, not that it is in your inbox yet. Check{' '}
          <strong>Spam</strong>, wait a few minutes, then{' '}
          <a
            href="https://app.sendgrid.com/email_activity"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary-600 hover:underline"
          >
            Email Activity
          </a>{' '}
          for <em>Delivered</em>, <em>Deferred</em>, or <em>Bounce</em>.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <Field label="Send a test to">
          <Input type="email" value={testTo} onChange={(event) => setTestTo(event.target.value)} placeholder="you@example.com" />
        </Field>
        <Button type="button" onClick={sendTest} disabled={testing}>
          {testing ? 'Sending…' : 'Send test'}
        </Button>
      </div>
    </div>
  )
}