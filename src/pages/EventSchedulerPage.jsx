import { useEffect, useState } from 'react'
import { Pencil, Play, Plus, Trash } from 'lucide-react'
import { useSchedulerStore } from '../stores/schedulerStore.js'
import { useAppStore } from '../stores/appStore.js'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Modal from '../components/ui/Modal.jsx'
import Switch from '../components/ui/Switch.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { Field, Input, Select, Textarea } from '../components/ui/FormControls.jsx'
import { SCHEDULE_TARGETS, TRIGGER_TYPES, RECURRENCES } from '../data/schedules.js'
import { formatDateTime, relativeTime } from '../utils/format.js'
import { NOW_MS } from '../data/executions.js'

const EMPTY_FORM = {
  name: '',
  trigger: 'time',
  recurrence: 'daily',
  startAt: '',
  eventName: '',
  dependsOn: '',
  target: SCHEDULE_TARGETS[0].id,
  payload: '{\n  \n}',
}

const STATUS_TONE = { success: 'success', failed: 'danger', never: 'neutral' }

export default function EventSchedulerPage() {
  const schedules = useSchedulerStore((s) => s.schedules)
  const runner = useSchedulerStore((s) => s.runner)
  const loadSchedules = useSchedulerStore((s) => s.loadSchedules)
  const toggleSchedule = useSchedulerStore((s) => s.toggleSchedule)
  const deleteSchedule = useSchedulerStore((s) => s.deleteSchedule)
  const runSchedule = useSchedulerStore((s) => s.runSchedule)
  const pushToast = useAppStore((s) => s.pushToast)
  const [editor, setEditor] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [running, setRunning] = useState(null)
  const [runError, setRunError] = useState(null)

  useEffect(() => {
    loadSchedules().catch((err) => pushToast({ tone: 'danger', title: 'Could not load job triggers', body: err.message }))
  }, [loadSchedules, pushToast])

  const runNow = async (schedule) => {
    setRunning(schedule.id)
    setRunError(null)
    try {
      const trigger = await runSchedule(schedule.id)
      pushToast({
        tone: trigger.lastStatus === 'success' ? 'success' : 'warning',
        title: `${schedule.name} ${trigger.lastStatus}`,
        body: schedule.target,
      })
    } catch (err) {
      setRunError(err.message)
    } finally {
      setRunning(null)
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Event Scheduler"
        description={runner === 'bullmq' ? 'BullMQ is running these triggers.' : 'Redis is not connected, so triggers are saved but not run.'}
        actions={<Button variant="primary" size="sm" onClick={() => setEditor({ mode: 'create', form: EMPTY_FORM })}><Plus size={13} /> New schedule</Button>}
      />

      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        {runError && <p className="mb-3 rounded-md bg-danger-50 p-3 text-sm text-danger-700">Run failed: {runError}</p>}
        <Panel title="Schedules" description="Sorted by next run" bodyClassName="p-0">
          {schedules.length === 0 ? (
            <EmptyState icon={Plus} title="No schedules" description="Create a schedule to run requests automatically." />
          ) : (
            <ul className="divide-y divide-line">
              {schedules.map((s) => (
                <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3 transition-colors hover:bg-surface/60">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium text-ink">{s.name}</p>
                      <Badge tone="primary">{TRIGGER_TYPES[s.trigger].label}</Badge>
                      <Badge tone={STATUS_TONE[s.lastStatus]}>Last: {s.lastStatus}</Badge>
                    </div>
                    <p className="mt-0.5 font-mono text-xs text-ink-muted">{s.target}</p>
                    <p className="mt-0.5 text-xs text-ink-subtle">
                      {s.trigger === 'event' && `On event ${s.eventName}`}
                      {s.trigger === 'dependency' && `After ${schedules.find((x) => x.id === s.dependsOn)?.name ?? 'a deleted job'}`}
                      {s.trigger === 'time' && `${RECURRENCES.find((r) => r.id === s.recurrence)?.label} from ${formatDateTime(s.startAt)}`}
                      {s.nextRunAt && ` · next ${relativeTime(s.nextRunAt, NOW_MS)}`}
                    </p>
                  </div>
                  <Switch checked={s.enabled} onChange={() => toggleSchedule(s.id).catch((err) => pushToast({ tone: 'danger', title: 'Could not update trigger', body: err.message }))} label={`Enable ${s.name}`} />
                  <div className="flex items-center gap-1">
                    <Button size="sm" onClick={() => runNow(s)} disabled={running === s.id}>
                      <Play size={12} /> {running === s.id ? 'Running...' : 'Run now'}
                    </Button>
                    <Button size="sm" variant="ghost" aria-label="Edit schedule" onClick={() => setEditor({ mode: 'edit', id: s.id, form: { ...s } })}><Pencil size={13} /></Button>
                    <Button size="sm" variant="ghost" aria-label="Delete schedule" onClick={() => setDeleting(s)}><Trash size={13} /></Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <ScheduleModal editor={editor} schedules={schedules} onClose={() => setEditor(null)} />
      <ConfirmDialog
        open={Boolean(deleting)}
        title="Delete schedule?"
        message={deleting ? `${deleting.name} will stop running. Jobs that depend on it will be disabled.` : ''}
        confirmLabel="Delete schedule"
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          const name = deleting.name
          deleteSchedule(deleting.id)
            .then(() => pushToast({ tone: 'warning', title: 'Schedule deleted', body: name }))
            .catch((err) => pushToast({ tone: 'danger', title: 'Could not delete trigger', body: err.message }))
          setDeleting(null)
        }}
      />
    </div>
  )
}

function ScheduleModal({ editor, schedules, onClose }) {
  const addSchedule = useSchedulerStore((s) => s.addSchedule)
  const updateSchedule = useSchedulerStore((s) => s.updateSchedule)
  const pushToast = useAppStore((s) => s.pushToast)
  const [form, setForm] = useState(null)
  const [errors, setErrors] = useState({})

  if (!editor) return <Modal open={false} onClose={onClose} title="" />
  const current = form ?? editor.form
  const set = (key) => (e) => setForm({ ...current, [key]: e.target.value })

  const save = async () => {
    const next = {}
    if (!current.name.trim()) next.name = 'Name is required'
    if (current.trigger === 'event' && !current.eventName.trim()) next.eventName = 'Enter an event name'
    if (current.trigger === 'dependency' && !current.dependsOn) next.dependsOn = 'Choose a job to depend on'
    try {
      JSON.parse(current.payload)
    } catch {
      next.payload = 'Payload must be valid JSON'
    }
    setErrors(next)
    if (Object.keys(next).length) return

    const data = {
      name: current.name.trim(),
      trigger: current.trigger,
      recurrence: current.recurrence,
      startAt: current.startAt || null,
      eventName: current.eventName,
      dependsOn: current.dependsOn,
      target: current.target,
      payload: current.payload,
      enabled: current.enabled ?? true,
    }
    try {
      if (editor.mode === 'create') {
        await addSchedule(data)
        pushToast({ title: 'Schedule created', body: data.name })
      } else {
        await updateSchedule(editor.id, data)
        pushToast({ title: 'Schedule saved', body: data.name })
      }
    } catch (err) {
      pushToast({ tone: 'danger', title: 'Could not save job trigger', body: err.message })
      return
    }
    setForm(null)
    onClose()
  }

  return (
    <Modal
      open
      onClose={() => { setForm(null); setErrors({}); onClose() }}
      title={editor.mode === 'create' ? 'New schedule' : 'Edit schedule'}
      description="Choose what runs and what starts it"
      width="max-w-xl"
      footer={<div className="flex justify-end gap-2"><Button onClick={onClose}>Cancel</Button><Button variant="primary" onClick={save}>Save schedule</Button></div>}
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" error={errors.name} className="sm:col-span-2"><Input value={current.name} onChange={set('name')} /></Field>
        <Field label="Trigger">
          <Select value={current.trigger} onChange={set('trigger')}>
            {Object.entries(TRIGGER_TYPES).map(([id, t]) => <option key={id} value={id}>{t.label}</option>)}
          </Select>
        </Field>
        <Field label="Target">
          <Select value={current.target} onChange={set('target')}>
            {SCHEDULE_TARGETS.map((t) => <option key={t.id} value={t.id}>{t.id}</option>)}
          </Select>
        </Field>
        {current.trigger === 'time' && (
          <>
            <Field label="Recurrence">
              <Select value={current.recurrence} onChange={set('recurrence')}>
                {RECURRENCES.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}
              </Select>
            </Field>
            <Field label="Start at">
              <Input type="datetime-local" value={current.startAt ? current.startAt.slice(0, 16) : ''} onChange={(e) => setForm({ ...current, startAt: e.target.value ? `${e.target.value}:00Z` : '' })} />
            </Field>
          </>
        )}
        {current.trigger === 'event' && (
          <Field label="Event name" error={errors.eventName} className="sm:col-span-2"><Input value={current.eventName} onChange={set('eventName')} placeholder="order.confirmed" /></Field>
        )}
        {current.trigger === 'dependency' && (
          <Field label="Runs after" error={errors.dependsOn} className="sm:col-span-2">
            <Select value={current.dependsOn} onChange={set('dependsOn')}>
              <option value="">Choose a job</option>
              {schedules.filter((s) => s.id !== editor.id).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </Field>
        )}
        <Field label="Payload (JSON)" error={errors.payload} className="sm:col-span-2">
          <Textarea rows={5} value={current.payload} onChange={set('payload')} className="font-mono text-xs" />
        </Field>
      </div>
    </Modal>
  )
}
