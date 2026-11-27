import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, RefreshCw } from 'lucide-react'
import { Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Field, Input, Select } from '../../components/ui/FormControls.jsx'
import { useAppStore } from '../../stores/appStore.js'
import {
  AI_MODELS,
  AI_SCAN_DEPTHS,
  saveAiSettings,
  usePlatformSettingsStore,
} from '../../stores/platformSettingsStore.js'

export default function AdminAiSettingsSection() {
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
    <div className="flex flex-col gap-6 px-6 pb-10 pt-2">
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
              Manage keys under{' '}
              <Link to="/settings/integrations/api" className="font-medium text-primary-600 hover:underline">
                Settings → Integrations → API integration
              </Link>
              . Values are stored in the Python worker database (<span className="font-mono">ai.api_token_providers</span>).
            </p>
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              Save AI settings
            </Button>
          </div>
        </form>
      </Panel>
    </div>
  )
}