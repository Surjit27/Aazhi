import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, Calendar, Cloud, FileText, Play, Plus, Trash2, Workflow } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Modal from '../../components/ui/Modal.jsx'
import Switch from '../../components/ui/Switch.jsx'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import { Field, Input, Select, Textarea } from '../../components/ui/FormControls.jsx'
import { thClass, tdClass } from '../../features/explorer/ExplorerInsights.jsx'
import {
  CLOUD_PROVIDERS,
  ORCHESTRATION_STEP_KINDS,
  SIMULATION_PRESETS,
} from '../../data/orchestration.js'
import { useOrchestrationStore } from '../../stores/orchestrationStore.js'
import { useExplorerProjectsStore } from '../../stores/explorerProjectsStore.js'
import { useCloudProvidersStore } from '../../stores/cloudProvidersStore.js'

export default function DeepOrchestrationPage() {
  const [params] = useSearchParams()
  const projectFilter = params.get('project')

  const pipelines = useOrchestrationStore((s) => s.pipelines)
  const activePipelineId = useOrchestrationStore((s) => s.activePipelineId)
  const selectPipeline = useOrchestrationStore((s) => s.selectPipeline)
  const createPipeline = useOrchestrationStore((s) => s.createPipeline)
  const updatePipeline = useOrchestrationStore((s) => s.updatePipeline)
  const addStep = useOrchestrationStore((s) => s.addStep)
  const removeStep = useOrchestrationStore((s) => s.removeStep)
  const reorderStep = useOrchestrationStore((s) => s.reorderStep)
  const mockRun = useOrchestrationStore((s) => s.mockRun)
  const deletePipeline = useOrchestrationStore((s) => s.deletePipeline)

  const projects = useExplorerProjectsStore((s) => s.projects)
  const cloudProfiles = useCloudProvidersStore((s) => s.profiles)

  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState({ name: '', projectId: projectFilter || '', preset: 'full-journey', cloudProviderId: 'aws' })

  const filtered = useMemo(() => {
    if (!projectFilter) return pipelines
    return pipelines.filter((p) => p.projectId === projectFilter)
  }, [pipelines, projectFilter])

  const active = filtered.find((p) => p.id === activePipelineId) ?? filtered[0]

  useEffect(() => {
    if (active && active.id !== activePipelineId) {
      selectPipeline(active.id)
    }
  }, [active, activePipelineId, selectPipeline])

  const profilesForProvider = active
    ? cloudProfiles.filter((c) => c.providerId === active.cloudProviderId)
    : []

  const projectName = active?.projectId ? projects.find((p) => p.id === active.projectId)?.name : null

  const submitCreate = () => {
    const created = createPipeline(createForm)
    if (created) {
      setCreateOpen(false)
      setCreateForm({ name: '', projectId: projectFilter || '', preset: 'full-journey', cloudProviderId: 'aws' })
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Orchestration & simulation"
        description="Airflow-style pipelines for data simulation — tie to Backend Explorer projects, notepad steps, and cloud schedulers."
        breadcrumbs={['deepe', 'Deep Backend', 'Orchestration']}
        actions={
          <>
            <Link to="/integrations/cloud">
              <Button variant="secondary" size="sm">
                <Cloud size={14} /> Cloud access
              </Button>
            </Link>
            <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus size={14} /> New pipeline
            </Button>
          </>
        }
      />

      <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[280px_1fr]">
        <aside className="border-b border-line bg-surface/40 p-4 lg:border-b-0 lg:border-r">
          <p className="text-[10px] font-semibold uppercase text-ink-subtle">Pipelines</p>
          <ul className="mt-2 max-h-64 space-y-1 overflow-y-auto lg:max-h-none">
            {filtered.length === 0 ? (
              <li className="text-xs text-ink-muted">No pipelines{projectFilter ? ' for this project' : ''}.</li>
            ) : (
              filtered.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => selectPipeline(p.id)}
                    className={`w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition ${
                      active?.id === p.id ? 'bg-white font-semibold text-ink shadow-card' : 'text-ink-muted hover:bg-white/80'
                    }`}
                  >
                    {p.name}
                    <span className="mt-0.5 block text-[10px] font-normal text-ink-subtle">
                      {p.steps.length} steps · {p.lastRunStatus}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
          {projectFilter && (
            <Link to="/deep/orchestration" className="mt-3 block text-xs text-primary-600 hover:underline">
              Show all pipelines
            </Link>
          )}
        </aside>

        <div className="flex flex-col gap-6 p-4 md:p-6">
          {!active ? (
            <p className="text-sm text-ink-muted">Create a pipeline to design simulation flows.</p>
          ) : (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-ink">{active.name}</h2>
                  <p className="text-xs text-ink-muted">
                    {projectName ? (
                      <>
                        Project:{' '}
                        <Link to={`/deep/explorer/${active.projectId}`} className="text-primary-600 hover:underline">
                          {projectName}
                        </Link>
                      </>
                    ) : (
                      'No explorer project linked'
                    )}
                    {' · '}
                    Preset: {SIMULATION_PRESETS.find((s) => s.id === active.preset)?.label ?? active.preset}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="primary" onClick={() => mockRun(active.id)}>
                    <Play size={12} /> Run now
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deletePipeline(active.id)}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-2">
                <Panel title="Process steps" description="DAG-style chain — reorder, add kinds, run on schedule or ad hoc.">
                  <div className="space-y-2 p-4">
                    {active.steps.length === 0 ? (
                      <p className="text-sm text-ink-muted">Add steps from the palette below.</p>
                    ) : (
                      active.steps.map((step, idx) => (
                        <div key={step.id} className="flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[10px] font-bold text-primary-700">
                            {idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-ink">{step.label}</p>
                            <p className="text-[10px] uppercase text-ink-subtle">{step.kind}</p>
                          </div>
                          <div className="flex shrink-0 gap-0.5">
                            <Button size="sm" variant="ghost" aria-label="Move up" onClick={() => reorderStep(active.id, step.id, 'up')}>
                              <ArrowUp size={12} />
                            </Button>
                            <Button size="sm" variant="ghost" aria-label="Move down" onClick={() => reorderStep(active.id, step.id, 'down')}>
                              <ArrowDown size={12} />
                            </Button>
                            <Button size="sm" variant="ghost" aria-label="Remove" onClick={() => removeStep(active.id, step.id)}>
                              <Trash2 size={12} />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="flex flex-wrap gap-1 pt-2">
                      {ORCHESTRATION_STEP_KINDS.map((k) => (
                        <Button key={k.id} size="sm" variant="secondary" onClick={() => addStep(active.id, k.id)}>
                          + {k.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Panel>

                <Panel title="Notepad" description="Scratch commands, SQL, sample JSON, or agent prompts for this run.">
                  <div className="p-4">
                    <Textarea
                      rows={12}
                      className="font-mono text-xs"
                      value={active.notepad}
                      onChange={(e) => updatePipeline(active.id, { notepad: e.target.value })}
                      placeholder="# curl …&#10;# INSERT INTO …&#10;# Agent: reverse-engineer POST /orders"
                    />
                    <p className="mt-2 flex items-center gap-1 text-[10px] text-ink-muted">
                      <FileText size={10} /> Persists with the pipeline (localStorage until API).
                    </p>
                  </div>
                </Panel>
              </div>

              <Panel title="Schedule & cloud deployment" description="Cron + provider profile for scheduled data simulation.">
                <div className="grid gap-4 p-4 lg:grid-cols-2">
                  <div className="space-y-3">
                    <Field label="Cron expression">
                      <Input
                        value={active.schedule.cron}
                        onChange={(e) =>
                          updatePipeline(active.id, { schedule: { ...active.schedule, cron: e.target.value } })
                        }
                      />
                    </Field>
                    <Field label="Timezone">
                      <Input
                        value={active.schedule.timezone}
                        onChange={(e) =>
                          updatePipeline(active.id, { schedule: { ...active.schedule, timezone: e.target.value } })
                        }
                      />
                    </Field>
                    <Switch
                      checked={active.schedule.enabled}
                      onChange={() =>
                        updatePipeline(active.id, { schedule: { ...active.schedule, enabled: !active.schedule.enabled } })
                      }
                      label="Enable scheduled runs (UI)"
                    />
                    <Link to="/deep/scheduler" className="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline">
                      <Calendar size={12} /> Open legacy Event Scheduler (API triggers)
                    </Link>
                  </div>
                  <div className="space-y-3">
                    <Field label="Cloud provider">
                      <Select
                        value={active.cloudProviderId}
                        onChange={(e) => updatePipeline(active.id, { cloudProviderId: e.target.value, cloudProfileId: null })}
                      >
                        {CLOUD_PROVIDERS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                    <Field label="Deployment profile">
                      <Select
                        value={active.cloudProfileId ?? ''}
                        onChange={(e) => updatePipeline(active.id, { cloudProfileId: e.target.value || null })}
                      >
                        <option value="">— Select —</option>
                        {profilesForProvider.map((pr) => (
                          <option key={pr.id} value={pr.id}>
                            {pr.label} ({pr.region || 'no region'})
                          </option>
                        ))}
                      </Select>
                    </Field>
                    {profilesForProvider.length === 0 ? (
                      <p className="text-xs text-ink-muted">
                        <Link to="/integrations/cloud" className="text-primary-600 hover:underline">
                          Configure {CLOUD_PROVIDERS.find((c) => c.id === active.cloudProviderId)?.shortLabel} access
                        </Link>
                      </p>
                    ) : null}
                    <div className="glass-inset rounded-lg p-3 text-xs text-ink-muted">
                      <Workflow size={12} className="mr-1 inline" />
                      Runs deploy to your cloud scheduler; Deepe worker executes steps against Explorer-discovered APIs.
                    </div>
                  </div>
                </div>
              </Panel>

              <Panel title="Simulation preset" bodyClassName="p-4">
                <Select
                  value={active.preset}
                  onChange={(e) => updatePipeline(active.id, { preset: e.target.value })}
                  className="max-w-md"
                >
                  {SIMULATION_PRESETS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label} — {s.description}
                    </option>
                  ))}
                </Select>
              </Panel>
            </>
          )}
        </div>
      </div>

      <div className="border-t border-line px-6 py-4">
        <Panel title="All pipelines" bodyClassName="p-0">
          <table className="w-full min-w-[640px] border-collapse">
            <thead className="bg-surface">
              <tr className="border-b border-line">
                <th className={thClass}>Name</th>
                <th className={thClass}>Project</th>
                <th className={thClass}>Steps</th>
                <th className={thClass}>Cloud</th>
                <th className={thClass}>Schedule</th>
                <th className={thClass}>Last run</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pipelines.map((p) => (
                <tr
                  key={p.id}
                  className="cursor-pointer hover:bg-surface/80"
                  onClick={() => selectPipeline(p.id)}
                >
                  <td className={`${tdClass} font-medium text-ink`}>{p.name}</td>
                  <td className={tdClass}>{projects.find((x) => x.id === p.projectId)?.name ?? '—'}</td>
                  <td className={`${tdClass} tabular-nums`}>{p.steps.length}</td>
                  <td className={tdClass}>{CLOUD_PROVIDERS.find((c) => c.id === p.cloudProviderId)?.shortLabel}</td>
                  <td className={tdClass}>
                    {p.schedule.enabled ? (
                      <Badge tone="primary">{p.schedule.cron}</Badge>
                    ) : (
                      <span className="text-xs text-ink-muted">Manual</span>
                    )}
                  </td>
                  <td className={tdClass}>
                    <Badge tone={p.lastRunStatus === 'success' ? 'success' : 'neutral'}>{p.lastRunStatus}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="New orchestration pipeline"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={submitCreate}>
              Create
            </Button>
          </>
        }
      >
        <div className="grid gap-3">
          <Field label="Name">
            <Input value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} placeholder="Staging load test" />
          </Field>
          <Field label="Explorer project">
            <Select value={createForm.projectId} onChange={(e) => setCreateForm((f) => ({ ...f, projectId: e.target.value }))}>
              <option value="">— Optional —</option>
              {projects.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Simulation preset">
            <Select value={createForm.preset} onChange={(e) => setCreateForm((f) => ({ ...f, preset: e.target.value }))}>
              {SIMULATION_PRESETS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Default cloud">
            <Select value={createForm.cloudProviderId} onChange={(e) => setCreateForm((f) => ({ ...f, cloudProviderId: e.target.value }))}>
              {CLOUD_PROVIDERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>
    </div>
  )
}
