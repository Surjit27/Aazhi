import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Switch from '../../components/ui/Switch.jsx'
import SettingsBackLink from '../../components/settings/SettingsBackLink.jsx'
import { Field, Input } from '../../components/ui/FormControls.jsx'
import { apiFetch } from '../../lib/api.js'
import { useAppStore } from '../../stores/appStore.js'

export default function ApiTokenProviderDetailPage() {
  const { id } = useParams()
  const pushToast = useAppStore((s) => s.pushToast)
  const [provider, setProvider] = useState(null)
  const [form, setForm] = useState({ apiKey: '', baseUrl: '', status: 'inactive' })
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    return apiFetch(`/api/settings/api-tokens/${id}`)
      .then((r) => {
        setProvider(r.provider)
        setForm({
          apiKey: '',
          baseUrl: r.provider?.baseUrl ?? '',
          status: r.provider?.status ?? 'inactive',
        })
      })
      .catch((e) => pushToast({ tone: 'danger', title: 'Could not load token', body: e.message }))
  }, [id, pushToast])

  useEffect(() => {
    load()
  }, [load])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const { provider: updated } = await apiFetch(`/api/settings/api-tokens/${id}`, {
        method: 'PATCH',
        body: {
          status: form.status,
          baseUrl: form.baseUrl,
          apiKey: form.apiKey || undefined,
        },
      })
      setProvider(updated)
      setForm((c) => ({ ...c, apiKey: '' }))
      pushToast({ title: 'API token saved' })
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Save failed', body: err.message })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-6 pb-10 pt-2">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-ink">{provider?.name ?? 'API token'}</h2>
          <p className="mt-0.5 text-xs text-ink-muted">{provider?.providerLabel}</p>
        </div>
        <SettingsBackLink integration="api" />
      </div>
      <Panel title="Configuration">
        {provider ? (
          <form className="grid max-w-2xl gap-4 p-5" onSubmit={save}>
            <div className="glass-inset rounded-lg p-4 text-xs text-ink-muted">
              <p>
                <strong className="text-ink">Free allowance:</strong> {provider.freeAllowance || '—'}
              </p>
              <p className="mt-2">
                <strong className="text-ink">Best for:</strong> {provider.bestFor || '—'}
              </p>
              <p className="mt-2">
                Storage: <span className="font-mono">ai.api_token_providers</span>
              </p>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-ink">Active</span>
              <Switch
                checked={form.status === 'active'}
                onChange={(on) => setForm((c) => ({ ...c, status: on ? 'active' : 'inactive' }))}
                label="Status"
              />
            </div>
            <Badge tone={form.status === 'active' ? 'success' : 'neutral'}>{form.status}</Badge>
            <Field label="API key" hint={provider.apiKeyMasked ? 'Leave blank to keep saved key.' : 'Paste key from provider dashboard.'}>
              <Input type="password" value={form.apiKey} onChange={(e) => setForm((c) => ({ ...c, apiKey: e.target.value }))} autoComplete="off" />
            </Field>
            <Field label="Base URL (optional)" hint="For Cursor or OpenAI-compatible endpoints.">
              <Input value={form.baseUrl} onChange={(e) => setForm((c) => ({ ...c, baseUrl: e.target.value }))} placeholder="https://api.openai.com/v1" />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving…' : 'Save token'}
              </Button>
            </div>
          </form>
        ) : null}
      </Panel>
    </div>
  )
}