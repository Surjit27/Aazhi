import { useEffect, useState } from 'react'
import PillTabNav from '../../components/ui/PillTabNav.jsx'
import Button from '../../components/ui/Button.jsx'
import Switch from '../../components/ui/Switch.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/FormControls.jsx'
import { apiFetch } from '../../lib/api.js'
import { useAppStore } from '../../stores/appStore.js'
import EmailHtmlPreview from '../email/EmailHtmlPreview.jsx'

const EMAIL_TABS = [
  { id: 'configuration', label: 'Configuration' },
  { id: 'preview', label: 'Preview' },
  { id: 'test', label: 'Test send' },
]

export default function EmailProviderWorkspace({ providerId, provider, onProviderChange }) {
  const pushToast = useAppStore((s) => s.pushToast)
  const [tab, setTab] = useState('configuration')
  const [qaMeta, setQaMeta] = useState(null)
  const [qaVariables, setQaVariables] = useState({ recipientName: 'there', summary: '' })

  useEffect(() => {
    apiFetch('/api/settings/email/templates')
      .then(({ templates: list }) => {
        const qa = list?.[0] ?? null
        setQaMeta(qa)
        if (qa?.sampleVars) setQaVariables(qa.sampleVars)
      })
      .catch(() => {})
  }, [])

  return (
    <div>
      <PillTabNav tabs={EMAIL_TABS} value={tab} onChange={setTab} ariaLabel="Email provider" />
      <div className="mt-4">
        {tab === 'configuration' && (
          <EmailProviderConfigTab providerId={providerId} provider={provider} onSaved={onProviderChange} />
        )}
        {tab === 'preview' && (
          <EmailProviderPreviewTab providerId={providerId} qaMeta={qaMeta} variables={qaVariables} onVariablesChange={setQaVariables} />
        )}
        {tab === 'test' && <EmailProviderTestTab providerId={providerId} variables={qaVariables} fromEmail={provider?.fromEmail} />}
      </div>
    </div>
  )
}

function EmailProviderConfigTab({ providerId, provider, onSaved }) {
  const pushToast = useAppStore((s) => s.pushToast)
  const [form, setForm] = useState({ enabled: false, fromEmail: '', fromName: '', apiKey: '', status: 'inactive' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (provider) {
      setForm((c) => ({
        ...c,
        enabled: provider.enabled,
        fromEmail: provider.fromEmail,
        fromName: provider.fromName,
        status: provider.status,
        apiKey: '',
      }))
    }
  }, [provider])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { provider: updated } = await apiFetch(`/api/settings/email-providers/${providerId}`, {
        method: 'PATCH',
        body: {
          enabled: form.enabled,
          status: form.enabled ? 'active' : 'inactive',
          fromEmail: form.fromEmail,
          fromName: form.fromName,
          apiKey: form.apiKey || undefined,
        },
      })
      onSaved?.(updated)
      setForm((c) => ({ ...c, apiKey: '' }))
      pushToast({ title: 'Email provider saved' })
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Save failed', body: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form className="grid max-w-2xl gap-4" onSubmit={save}>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge tone={form.status === 'active' ? 'success' : 'neutral'}>{form.status}</Badge>
        <span className="text-ink-muted">Stored in PostgreSQL · public.email_providers</span>
      </div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-ink">Enabled</span>
        <Switch checked={form.enabled} onChange={(enabled) => setForm((c) => ({ ...c, enabled }))} label="Enable" />
      </div>
      <Field label="SendGrid API key" hint={provider?.apiKeyMasked ? 'Leave blank to keep saved key.' : undefined}>
        <Input type="password" value={form.apiKey} onChange={(e) => setForm((c) => ({ ...c, apiKey: e.target.value }))} placeholder="SG." />
      </Field>
      <Field label="From address">
        <Input type="email" value={form.fromEmail} onChange={(e) => setForm((c) => ({ ...c, fromEmail: e.target.value }))} />
      </Field>
      <Field label="From name">
        <Input value={form.fromName} onChange={(e) => setForm((c) => ({ ...c, fromName: e.target.value }))} />
      </Field>
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}

function EmailProviderPreviewTab({ providerId, qaMeta, variables, onVariablesChange }) {
  const pushToast = useAppStore((s) => s.pushToast)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)

  const refresh = async () => {
    setLoading(true)
    try {
      const { preview: body } = await apiFetch(`/api/settings/email-providers/${providerId}/preview`, {
        method: 'POST',
        body: { variables },
      })
      setPreview(body)
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Preview failed', body: err.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (qaMeta) refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [providerId, qaMeta?.id])

  return (
    <div className="grid max-w-3xl gap-4">
      {Object.keys(variables).map((key) => (
        <Field key={key} label={key}>
          <Input value={variables[key] ?? ''} onChange={(e) => onVariablesChange((v) => ({ ...v, [key]: e.target.value }))} />
        </Field>
      ))}
      <div className="flex justify-end">
        <Button type="button" variant="secondary" onClick={refresh} disabled={loading}>
          {loading ? 'Rendering…' : 'Refresh preview'}
        </Button>
      </div>
      <EmailHtmlPreview html={preview?.html} subject={preview?.subject} />
    </div>
  )
}

function EmailProviderTestTab({ providerId, variables, fromEmail }) {
  const pushToast = useAppStore((s) => s.pushToast)
  const [testTo, setTestTo] = useState('')
  const [testing, setTesting] = useState(false)
  const [recipients, setRecipients] = useState([])

  const loadRecipients = () =>
    apiFetch(`/api/settings/email-providers/${providerId}/test-recipients`)
      .then((r) => setRecipients(r.recipients ?? []))
      .catch(() => setRecipients([]))

  useEffect(() => {
    loadRecipients()
  }, [providerId])

  const send = async () => {
    setTesting(true)
    try {
      const result = await apiFetch(`/api/settings/email-providers/${providerId}/test`, {
        method: 'POST',
        body: { to: testTo, variables },
      })
      setTestTo(result.to || testTo)
      await loadRecipients()
      pushToast({ title: 'SendGrid accepted the test', body: result.messageId ? `ID: ${result.messageId}` : undefined })
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Test send failed', body: err.message })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="grid max-w-2xl gap-4">
      <p className="text-xs text-ink-muted">
        From: <span className="font-mono">{fromEmail || '—'}</span>
      </p>
      <Field label="Previous test addresses">
        <Select
          value={recipients.includes(testTo) ? testTo : ''}
          onChange={(e) => e.target.value && setTestTo(e.target.value)}
          disabled={!recipients.length}
        >
          <option value="">{recipients.length ? 'Choose…' : 'No saved addresses'}</option>
          {recipients.map((email) => (
            <option key={email} value={email}>
              {email}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Send test to">
        <Input type="email" value={testTo} onChange={(e) => setTestTo(e.target.value)} />
      </Field>
      <Button type="button" onClick={send} disabled={testing}>
        {testing ? 'Sending…' : 'Send test'}
      </Button>
    </div>
  )
}