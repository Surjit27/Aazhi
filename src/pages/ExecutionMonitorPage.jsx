import { useMemo, useState } from 'react'
import { useClientTable } from '../hooks/useClientTable.js'
import { LegacyTableFooter, SortableLegacyTh } from '../features/tables/legacyTable.jsx'
import { Search } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EXECUTIONS, EXECUTION_SOURCES } from '../data/executions.js'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import Badge, { MethodBadge } from '../components/ui/Badge.jsx'
import Drawer from '../components/ui/Drawer.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { Input, Select } from '../components/ui/FormControls.jsx'
import { thClass, tdClass } from '../features/explorer/ExplorerInsights.jsx'
import { formatDuration, formatTime } from '../utils/format.js'
import { prettyJson } from '../utils/json.js'

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'success', label: 'Success' },
  { id: 'failed', label: 'Failed' },
]

export default function ExecutionMonitorPage() {
  const [statusFilter, setStatusFilter] = useState('all')
  const [source, setSource] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(null)

  const filtered = useMemo(
    () =>
      EXECUTIONS.filter(
        (e) =>
          (statusFilter === 'all' || e.status === statusFilter) &&
          (source === 'all' || e.source === source) &&
          (!query.trim() || `${e.method} ${e.path} ${e.id}`.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [statusFilter, source, query],
  )

  const accessors = useMemo(
    () => ({
      time: (e) => e.startedAt,
      path: (e) => e.path,
      source: (e) => e.source,
      code: (e) => e.statusCode,
      duration: (e) => e.durationMs,
      status: (e) => e.status,
    }),
    [],
  )

  const table = useClientTable(filtered, {
    pageSize: 15,
    accessors,
    defaultSort: { key: 'time', direction: 'desc' },
    resetKey: `${statusFilter}-${source}-${query}`,
  })

  const failures = EXECUTIONS.filter((e) => e.status === 'failed').length
  const avg = Math.round(EXECUTIONS.reduce((sum, e) => sum + e.durationMs, 0) / EXECUTIONS.length)
  const selected = EXECUTIONS.find((e) => e.id === selectedId)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader title="Execution Monitor" description="Every request the simulator handled, with timings and errors." />

      <div className="flex-1 space-y-4 overflow-y-auto p-4 md:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric label="Executions" value={EXECUTIONS.length} />
          <Metric label="Failures" value={failures} tone="danger" />
          <Metric label="Average duration" value={formatDuration(avg)} />
        </div>

        <Panel title="Duration by execution" description="Milliseconds, most recent first">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={EXECUTIONS.slice(0, 20).map((e) => ({ id: e.id, ms: e.durationMs, failed: e.status === 'failed' }))}>
                <CartesianGrid vertical={false} stroke="#E5E9EF" />
                <XAxis dataKey="id" hide />
                <YAxis tick={{ fontSize: 11, fill: '#6B7587' }} width={44} />
                <Tooltip cursor={{ fill: '#EAF2FC' }} formatter={(v) => `${v} ms`} />
                <Bar dataKey="ms" fill="#4A90E2" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel
          title="Executions"
          description={`${table.total} shown`}
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={13} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-subtle" />
                <Input className="w-48 pl-8" placeholder="Search route" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <Select className="w-36" value={source} onChange={(e) => setSource(e.target.value)} aria-label="Source">
                <option value="all">All sources</option>
                {EXECUTION_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          }
          bodyClassName="p-0"
        >
          <div className="border-b border-line px-4 py-2">
            <Tabs tabs={STATUS_TABS} value={statusFilter} onChange={setStatusFilter} />
          </div>
          {table.total === 0 ? (
            <EmptyState title="No executions match" description="Try a different status, source or search." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead className="border-b border-line bg-surface">
                  <tr>
                    <SortableLegacyTh sortKey="time" thProps={table.thProps}>
                      Time
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="path" thProps={table.thProps}>
                      Route
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="source" thProps={table.thProps}>
                      Source
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="code" thProps={table.thProps}>
                      Code
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="duration" thProps={table.thProps}>
                      Duration
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="status" thProps={table.thProps}>
                      Status
                    </SortableLegacyTh>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {table.rows.map((e) => (
                    <tr key={e.id} onClick={() => setSelectedId(e.id)} className="cursor-pointer transition-colors hover:bg-primary-50/50">
                      <td className={`${tdClass} tabular-nums`}>{formatTime(e.startedAt)}</td>
                      <td className={tdClass}>
                        <div className="flex items-center gap-2"><MethodBadge method={e.method} /><span className="font-mono text-xs">{e.path}</span></div>
                      </td>
                      <td className={`${tdClass} text-ink-muted`}>{e.source}</td>
                      <td className={`${tdClass} tabular-nums`}>{e.statusCode}</td>
                      <td className={`${tdClass} tabular-nums`}>{formatDuration(e.durationMs)}</td>
                      <td className={tdClass}><Badge tone={e.status === 'failed' ? 'danger' : 'success'}>{e.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <LegacyTableFooter table={table} itemLabel="execution" />
            </div>
          )}
        </Panel>
      </div>

      <Drawer
        open={Boolean(selected)}
        onClose={() => setSelectedId(null)}
        title={selected ? `${selected.method} ${selected.path}` : ''}
        description={selected ? `${selected.id} · ${selected.environment}` : ''}
        width="w-[560px]"
      >
        {selected && (
          <div className="flex flex-col gap-5">
            <section>
              <h3 className="mb-2 text-[11px] font-semibold tracking-wide text-ink-muted uppercase">Spans</h3>
              <ul className="space-y-1.5">
                {selected.spans.map((s) => {
                  const total = Math.max(...selected.spans.map((x) => x.offset + x.duration))
                  return (
                    <li key={s.name} className="grid grid-cols-[140px_1fr_64px] items-center gap-2 text-xs">
                      <span className="truncate font-mono text-ink">{s.name}</span>
                      <div className="relative h-3 rounded bg-surface">
                        <div
                          className={`absolute top-0 h-3 rounded ${s.status === 'error' ? 'bg-danger-700' : 'bg-primary-500'}`}
                          style={{ left: `${(s.offset / total) * 100}%`, width: `${Math.max(1, (s.duration / total) * 100)}%` }}
                        />
                      </div>
                      <span className="text-right text-ink-muted tabular-nums">{s.duration} ms</span>
                    </li>
                  )
                })}
              </ul>
            </section>
            <ExecutionPayloads execution={selected} />
          </div>
        )}
      </Drawer>
    </div>
  )
}

function Metric({ label, value, tone }) {
  return (
    <div className="rounded-lg border border-line bg-white p-4 shadow-card">
      <p className="text-xs text-ink-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold tabular-nums ${tone === 'danger' ? 'text-danger-700' : 'text-ink'}`}>{value}</p>
    </div>
  )
}

function ExecutionPayloads({ execution }) {
  const [tab, setTab] = useState('response')
  const body = tab === 'request' ? execution.requestBody : tab === 'response' ? execution.responseBody : null
  return (
    <section className="flex flex-col gap-2">
      <Tabs
        tabs={[
          { id: 'request', label: 'Request' },
          { id: 'response', label: 'Response' },
          { id: 'stack', label: 'Stack trace' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'stack' ? (
        execution.stack ? (
          <pre className="overflow-auto rounded-md border border-line bg-surface p-3 font-mono text-[11px] leading-5 text-ink">{execution.stack}</pre>
        ) : (
          <p className="text-xs text-ink-muted">No stack trace for a successful request.</p>
        )
      ) : body ? (
        <pre className="overflow-auto rounded-md border border-line bg-surface p-3 font-mono text-[11px] leading-5 text-ink">{prettyJson(body)}</pre>
      ) : (
        <p className="text-xs text-ink-muted">No body was sent.</p>
      )}
    </section>
  )
}
