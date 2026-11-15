import { useMemo } from 'react'
import { Play } from 'lucide-react'
import { useInjectionStore } from '../stores/injectionStore.js'
import { DATA_DESTINATIONS } from '../data/injection.js'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import { Field, Select, Textarea } from '../components/ui/FormControls.jsx'
import { tdClass } from '../features/explorer/ExplorerInsights.jsx'
import { useClientTable } from '../hooks/useClientTable.js'
import { LegacyTableFooter, SortableLegacyTh } from '../features/tables/legacyTable.jsx'
import { formatDateTime } from '../utils/format.js'

const FORMAT_TABS = [
  { id: 'json', label: 'JSON' },
  { id: 'csv', label: 'CSV' },
]

const HISTORY_TONE = { completed: 'success', running: 'primary', failed: 'danger' }

export default function DataInjectionPage() {
  const format = useInjectionStore((s) => s.format)
  const sourceText = useInjectionStore((s) => s.sourceText)
  const parsed = useInjectionStore((s) => s.parsed)
  const destination = useInjectionStore((s) => s.destination)
  const batchSize = useInjectionStore((s) => s.batchSize)
  const concurrency = useInjectionStore((s) => s.concurrency)
  const history = useInjectionStore((s) => s.history)
  const job = useInjectionStore((s) => s.job)
  const setFormat = useInjectionStore((s) => s.setFormat)
  const setSourceText = useInjectionStore((s) => s.setSourceText)
  const setConfig = useInjectionStore((s) => s.setConfig)
  const startJob = useInjectionStore((s) => s.startJob)

  const running = job?.status === 'running'
  const progress = job && job.total ? Math.round((job.done / job.total) * 100) : 0
  const records = parsed.ok ? parsed.records : []
  const columns = records[0] ? Object.keys(records[0]) : []

  const recordAccessors = useMemo(
    () => Object.fromEntries(columns.map((c) => [c, (row) => row[c]])),
    [columns],
  )
  const previewTable = useClientTable(records, {
    pageSize: 10,
    accessors: recordAccessors,
    resetKey: `${format}-${columns.join(',')}`,
  })

  const historyAccessors = useMemo(
    () => ({
      startedAt: (h) => h.startedAt,
      destination: (h) => h.destination,
      records: (h) => h.records,
      status: (h) => h.status,
    }),
    [],
  )
  const historyTable = useClientTable(history, {
    pageSize: 15,
    accessors: historyAccessors,
    defaultSort: { key: 'startedAt', direction: 'desc' },
  })

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Data Injection"
        description="Load records from JSON or CSV and push them into a running environment."
        actions={<Tabs tabs={FORMAT_TABS} value={format} onChange={setFormat} />}
      />

      <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 md:p-6 lg:grid-cols-2">
        <Panel title="Source" description={`Paste ${format.toUpperCase()} content`}>
          <div className="flex flex-col gap-3">
            <Textarea
              rows={10}
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="font-mono text-xs"
              aria-label="Source data"
            />
            {parsed.ok ? (
              <p className="text-xs text-success-700">{parsed.records.length} records ready</p>
            ) : (
              <p className="rounded-md bg-danger-50 p-2 text-xs text-danger-700">{parsed.error}</p>
            )}
          </div>
        </Panel>

        <Panel title="Preview" description="Paginated record preview">
          {previewTable.total === 0 ? (
            <EmptyState title="Nothing to preview" description="Fix the source data to see a preview." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-line bg-surface">
                  <tr>
                    {columns.map((c) => (
                      <SortableLegacyTh key={c} sortKey={c} thProps={previewTable.thProps}>
                        {c}
                      </SortableLegacyTh>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {previewTable.rows.map((row, i) => (
                    <tr key={i}>
                      {columns.map((c) => (
                        <td key={c} className={tdClass}>
                          {String(row[c] ?? '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <LegacyTableFooter table={previewTable} itemLabel="record" />
            </div>
          )}
        </Panel>

        <Panel title="Destination" description="Where the records are sent">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label="Destination">
              <Select value={destination} onChange={(e) => setConfig({ destination: e.target.value })} disabled={running}>
                {DATA_DESTINATIONS.map((d) => <option key={d.id} value={d.id}>{d.label} ({d.environment})</option>)}
              </Select>
            </Field>
            <Field label="Batch size">
              <Select value={batchSize} onChange={(e) => setConfig({ batchSize: Number(e.target.value) })} disabled={running}>
                {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
            <Field label="Concurrency">
              <Select value={concurrency} onChange={(e) => setConfig({ concurrency: Number(e.target.value) })} disabled={running}>
                {[1, 2, 4, 8].map((n) => <option key={n} value={n}>{n}</option>)}
              </Select>
            </Field>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Button variant="primary" className="self-start" onClick={startJob} disabled={running || !parsed.ok}>
              <Play size={13} /> {running ? 'Injecting...' : 'Start injection'}
            </Button>
            {job && (
              <div aria-live="polite" className="flex flex-col gap-1.5">
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface">
                  <div className="h-full bg-primary-500 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-xs text-ink-muted tabular-nums">
                  {job.done}/{job.total} sent · {job.succeeded} succeeded · {job.failed} failed
                  {job.status === 'failed' && <span className="text-danger-700"> · {job.error}</span>}
                </p>
              </div>
            )}
          </div>
        </Panel>

        <Panel title="History" description="Recent injection jobs" bodyClassName="p-0">
          {historyTable.total === 0 ? (
            <EmptyState title="No injections yet" description="Start an injection to see it listed here." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left">
                <thead className="border-b border-line bg-surface">
                  <tr>
                    <SortableLegacyTh sortKey="startedAt" thProps={historyTable.thProps}>
                      Started
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="destination" thProps={historyTable.thProps}>
                      Destination
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="records" thProps={historyTable.thProps}>
                      Records
                    </SortableLegacyTh>
                    <SortableLegacyTh sortKey="status" thProps={historyTable.thProps}>
                      Status
                    </SortableLegacyTh>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {historyTable.rows.map((h) => (
                    <tr key={h.id} className="hover:bg-surface/60">
                      <td className={tdClass}>{formatDateTime(h.startedAt)}</td>
                      <td className={tdClass}>{h.destination}</td>
                      <td className={`${tdClass} tabular-nums`}>
                        {h.succeeded}/{h.records}
                      </td>
                      <td className={tdClass}>
                        <Badge tone={HISTORY_TONE[h.status]}>{h.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <LegacyTableFooter table={historyTable} itemLabel="job" />
            </div>
          )}
        </Panel>
      </div>
    </div>
  )
}
