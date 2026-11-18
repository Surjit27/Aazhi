import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Panel } from '../ui/Panel.jsx'
import Button from '../ui/Button.jsx'
import { Field, Input, Select } from '../ui/FormControls.jsx'
import { useAppStore } from '../../stores/appStore.js'
import { mergePersonalSettingsDefaults } from '../../lib/personalSettings.js'
import { usePersonalSettingsStore } from '../../stores/personalSettingsStore.js'

const FALLBACK_TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Asia/Kolkata']

function timezoneOptions() {
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
      return Intl.supportedValuesOf('timeZone')
    }
  } catch {
    /* older browsers */
  }
  return FALLBACK_TIMEZONES
}

export default function PersonalSettingsPanel({ title = 'Personal preferences', description }) {
  const pushToast = useAppStore((s) => s.pushToast)
  const settings = usePersonalSettingsStore((s) => s.settings)
  const loaded = usePersonalSettingsStore((s) => s.loaded)
  const loading = usePersonalSettingsStore((s) => s.loading)
  const saving = usePersonalSettingsStore((s) => s.saving)
  const error = usePersonalSettingsStore((s) => s.error)
  const fetchSettings = usePersonalSettingsStore((s) => s.fetch)
  const save = usePersonalSettingsStore((s) => s.save)

  const [draft, setDraft] = useState(() => mergePersonalSettingsDefaults(settings))
  const zones = useMemo(() => timezoneOptions(), [])

  useEffect(() => {
    if (!loaded && !loading) fetchSettings()
  }, [fetchSettings, loaded, loading])

  useEffect(() => {
    setDraft(mergePersonalSettingsDefaults(settings))
  }, [settings])

  const onSubmit = async (event) => {
    event.preventDefault()
    await save(
      {
        ui: draft.ui,
        notifications: draft.notifications,
      },
      pushToast,
    )
  }

  return (
    <Panel
      title={title}
      description={description ?? 'Timezone, layout, and notification defaults for your signed-in account.'}
    >
      {loading && !loaded ? (
        <div className="flex items-center gap-2 p-5 text-sm text-ink-muted">
          <Loader2 size={16} className="animate-spin" />
          Loading personal settings…
        </div>
      ) : (
        <form onSubmit={onSubmit} className="grid gap-4 p-5">
          {error ? <p className="text-xs text-danger-700">{error}</p> : null}
          <Field label="Timezone" hint="Used for scheduled jobs and history timestamps in your workspace.">
            <Select
              value={draft.ui.timezone}
              onChange={(e) => setDraft((c) => ({ ...c, ui: { ...c.ui, timezone: e.target.value } }))}
            >
              {zones.includes(draft.ui.timezone) ? null : (
                <option value={draft.ui.timezone}>{draft.ui.timezone}</option>
              )}
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Custom timezone" hint="Override the list with an IANA zone id (e.g. Asia/Singapore).">
            <Input
              value={draft.ui.timezone}
              onChange={(e) => setDraft((c) => ({ ...c, ui: { ...c.ui, timezone: e.target.value } }))}
              placeholder="UTC"
            />
          </Field>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line text-primary-600"
              checked={draft.ui.compactSidebar}
              onChange={(e) =>
                setDraft((c) => ({ ...c, ui: { ...c.ui, compactSidebar: e.target.checked } }))
              }
            />
            Compact sidebar navigation
          </label>
          <p className="text-xs font-medium text-ink-muted">Email notifications</p>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line text-primary-600"
              checked={draft.notifications.emailDigest}
              onChange={(e) =>
                setDraft((c) => ({
                  ...c,
                  notifications: { ...c.notifications, emailDigest: e.target.checked },
                }))
              }
            />
            Weekly email digest
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-line text-primary-600"
              checked={draft.notifications.jobFailures}
              onChange={(e) =>
                setDraft((c) => ({
                  ...c,
                  notifications: { ...c.notifications, jobFailures: e.target.checked },
                }))
              }
            />
            Notify when scheduled jobs fail
          </label>
          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Saving…
                </>
              ) : (
                'Save personal settings'
              )}
            </Button>
          </div>
        </form>
      )}
    </Panel>
  )
}