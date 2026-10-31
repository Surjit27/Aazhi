import { useState } from 'react'
import { ENVIRONMENTS } from '../data/projectData.js'
import { useAppStore } from '../stores/appStore.js'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import Button from '../components/ui/Button.jsx'
import Switch from '../components/ui/Switch.jsx'
import Badge from '../components/ui/Badge.jsx'
import { Field, Input, Select } from '../components/ui/FormControls.jsx'

const DEFAULT_PREFS = {
  alertOnFailure: true,
  alertOnScheduleFailure: true,
  dailySummary: false,
  autoStartMocks: false,
  timezone: 'UTC',
  requestTimeoutMs: 5000,
}

export default function SettingsPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [prefs, setPrefs] = useState(DEFAULT_PREFS)
  const [saved, setSaved] = useState(DEFAULT_PREFS)
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(prefs) !== JSON.stringify(saved)

  const set = (key, value) => setPrefs((p) => ({ ...p, [key]: value }))

  const save = async () => {
    setSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSaved(prefs)
    setSaving(false)
    pushToast({ title: 'Settings saved' })
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Settings"
        description="Environments, alerts and simulator defaults."
        actions={
          <>
            <Button size="sm" variant="ghost" onClick={() => setPrefs(saved)} disabled={!dirty || saving}>Discard</Button>
            <Button size="sm" variant="primary" onClick={save} disabled={!dirty || saving}>{saving ? 'Saving...' : 'Save changes'}</Button>
          </>
        }
      />

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:p-6 lg:grid-cols-2">
        <Panel title="Environments" description="Health of each target environment" bodyClassName="p-0">
          <ul className="divide-y divide-line">
            {ENVIRONMENTS.map((env) => (
              <li key={env.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink capitalize">{env.id}</p>
                  <p className="text-xs text-ink-muted tabular-nums">{env.latencyMs} ms typical latency</p>
                </div>
                <Badge tone={env.healthy ? 'success' : 'danger'}>{env.healthy ? 'Healthy' : 'Degraded'}</Badge>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Notifications" description="When to alert you">
          <div className="flex flex-col gap-4">
            <Switch checked={prefs.alertOnFailure} onChange={(v) => set('alertOnFailure', typeof v === 'boolean' ? v : !prefs.alertOnFailure)} label="Alert on failed requests" />
            <Switch checked={prefs.alertOnScheduleFailure} onChange={() => set('alertOnScheduleFailure', !prefs.alertOnScheduleFailure)} label="Alert on failed schedules" />
            <Switch checked={prefs.dailySummary} onChange={() => set('dailySummary', !prefs.dailySummary)} label="Send a daily summary" />
          </div>
        </Panel>

        <Panel title="Simulator defaults" description="Applied to new mock servers and runs">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Timezone">
              <Select value={prefs.timezone} onChange={(e) => set('timezone', e.target.value)}>
                <option value="UTC">UTC</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New York</option>
              </Select>
            </Field>
            <Field label="Request timeout (ms)" hint="Used by test requests and scheduled runs">
              <Input type="number" min={0} value={prefs.requestTimeoutMs} onChange={(e) => set('requestTimeoutMs', Number(e.target.value))} />
            </Field>
            <div className="sm:col-span-2">
              <Switch checked={prefs.autoStartMocks} onChange={() => set('autoStartMocks', !prefs.autoStartMocks)} label="Start mock servers when the app opens" />
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
