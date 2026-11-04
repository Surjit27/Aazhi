import { useEffect } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { Activity, Calendar, FolderTree, GitBranch, Server, Workflow, Zap, CircleCheck, TriangleAlert } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Panel } from '../components/ui/Panel.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import Button from '../components/ui/Button.jsx'
import Badge, { MethodBadge } from '../components/ui/Badge.jsx'
import { useSchedulerStore } from '../stores/schedulerStore.js'
import { useMockStore } from '../stores/mockStore.js'
import { useAppStore } from '../stores/appStore.js'
import { EXECUTIONS, NOW_MS, buildHourlySeries } from '../data/executions.js'
import { RECENT_ACTIVITY } from '../data/projectData.js'
import { architectureLabel, backendBasePath, gitProviderLabel } from '../data/backends.js'
import { formatDateTime, formatDuration, relativeTime } from '../utils/format.js'

export default function BackendOverviewPage() {
  const { backendId } = useParams()
  const { backend } = useOutletContext()
  const navigate = useNavigate()
  const base = backendBasePath(backendId)
  const schedules = useSchedulerStore((s) => s.schedules)
  const loadSchedules = useSchedulerStore((s) => s.loadSchedules)

  useEffect(() => {
    loadSchedules().catch(() => {})
  }, [loadSchedules])
  const servers = useMockStore((s) => s.servers)
  const environments = useAppStore((s) => s.environments)
  const pushToast = useAppStore((s) => s.pushToast)

  const total = EXECUTIONS.length
  const failed = EXECUTIONS.filter((e) => e.status === 'failed').length
  const successRate = total ? Math.round(((total - failed) / total) * 100) : 0
  const runningMocks = servers.filter((s) => s.running).length
  const enabledSchedules = schedules.filter((s) => s.enabled).length
  const series = buildHourlySeries(EXECUTIONS, 12)
  const recentFailures = EXECUTIONS.filter((e) => e.status === 'failed').slice(0, 4)
  const upcoming = schedules
    .filter((s) => s.enabled && s.nextRunAt)
    .sort((a, b) => Date.parse(a.nextRunAt) - Date.parse(b.nextRunAt))
    .slice(0, 4)

  const envRows = environments.map((env) =>
    env.id === 'local' ? { ...env, baseUrl: backend.localBaseUrl ?? env.baseUrl } : env,
  )

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div className="flex flex-wrap items-center justify-end gap-2 border-b border-line bg-surface/50 px-4 py-2 md:px-6">
        <Badge tone={backend.status === 'indexed' ? 'success' : 'warning'}>{backend.status}</Badge>
        <span className="text-xs text-ink-muted">
          {gitProviderLabel(backend.git.provider)} · {backend.git.repository} ·{' '}
          <GitBranch size={11} className="inline" /> {backend.git.branch}
        </span>
        <Button
          size="sm"
          variant="primary"
          onClick={() => pushToast({ title: 'Re-index queued', body: `${backend.name} will refresh from git.` })}
        >
          <Activity size={14} /> Sync from git
        </Button>
      </div>

      <div className="flex flex-col gap-5 p-4 md:p-6">
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-5">
          <StatCard label="Discovered APIs" value={backend.stats.routes} hint={`Routes in ${backend.name}`} icon={FolderTree} />
          <StatCard
            label="Backend functions"
            value={backend.stats.functions}
            hint={`Across ${backend.stats.modules} modules`}
            icon={Zap}
            tone="success"
          />
          <StatCard label="Stack" value={architectureLabel(backend.architecture)} hint="Detected architecture" icon={FolderTree} />
          <StatCard label="Active mock servers" value={`${runningMocks} / ${servers.length}`} hint="Workspace-wide" icon={Server} tone="warning" />
          <StatCard
            label="Execution success"
            value={`${successRate}%`}
            hint={`Demo metrics · ${total} runs`}
            icon={CircleCheck}
            tone={successRate >= 90 ? 'success' : 'danger'}
          />
        </div>

        <div className="grid gap-5 xl:grid-cols-3">
          <Panel
            title="Executions, last 12 hours"
            description={`Sample telemetry for ${backend.name}`}
            className="xl:col-span-2"
            bodyClassName="p-4"
          >
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="okFillBackend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4A90E2" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#4A90E2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#E5E9EF" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#5B6676' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#5B6676' }} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E5E9EF' }} />
                  <Area type="monotone" dataKey="success" name="Success" stroke="#3A7BCB" strokeWidth={2} fill="url(#okFillBackend)" />
                  <Area type="monotone" dataKey="failed" name="Failed" stroke="#B42318" strokeWidth={2} fill="#FCE4E4" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel title="Environment health" description="Probes for this backend">
            <ul className="divide-y divide-line">
              {envRows.map((env) => (
                <li key={env.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${env.healthy ? 'bg-success-700' : 'bg-danger-700'}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-ink">{env.label}</p>
                    <p className="truncate text-xs text-ink-muted">{env.baseUrl}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-ink tabular-nums">{env.latencyMs} ms</p>
                    <Badge tone={env.healthy ? 'success' : 'danger'}>{env.healthy ? 'Healthy' : 'Degraded'}</Badge>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          <Panel title="Recent failures">
            <ul className="divide-y divide-line">
              {recentFailures.map((e) => (
                <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                  <MethodBadge method={e.method} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs text-ink">{e.path}</p>
                    <p className="text-[11px] text-ink-muted">
                      {e.statusCode} · {formatDuration(e.durationMs)} · {relativeTime(e.startedAt, NOW_MS)}
                    </p>
                  </div>
                  <TriangleAlert size={14} className="text-danger-700" />
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Upcoming events">
            <ul className="divide-y divide-line">
              {upcoming.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-4 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">{s.name}</p>
                    <p className="truncate text-xs text-ink-muted">{s.target}</p>
                  </div>
                  <span className="text-[11px] text-ink-muted tabular-nums">{formatDateTime(s.nextRunAt)}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Recent activity">
            <ul className="divide-y divide-line">
              {RECENT_ACTIVITY.map((a) => (
                <li key={a.id} className="px-4 py-2.5">
                  <p className="text-xs text-ink">
                    <span className="font-medium">{a.actor}</span> {a.action} <span className="font-medium">{a.target}</span>
                  </p>
                  <p className="text-[11px] text-ink-subtle">{relativeTime(a.time, NOW_MS)}</p>
                </li>
              ))}
            </ul>
          </Panel>
        </div>

        <Panel title="Explore this backend">
          <div className="flex flex-wrap gap-2 p-4">
            <Button onClick={() => navigate(`${base}/explorer`)}>
              <FolderTree size={14} /> Backend Explorer
            </Button>
            <Button onClick={() => navigate(`${base}/workflow`)}>
              <Workflow size={14} /> Visual workflow
            </Button>
            <Button onClick={() => navigate('/scheduler')}>
              <Calendar size={14} /> Schedules
            </Button>
            <Button onClick={() => navigate('/assistant')}>Ask AI assistant</Button>
          </div>
        </Panel>
      </div>
    </div>
  )
}
