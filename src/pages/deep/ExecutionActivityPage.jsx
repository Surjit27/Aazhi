import { useNavigate } from 'react-router-dom'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { DEEP_EXECUTIONS } from '../../data/deepBackend.js'
import { formatDuration, formatDateTime } from '../../utils/format.js'
import { thClass, tdClass } from '../../features/explorer/ExplorerInsights.jsx'

const STATUS_TONE = { success: 'success', failed: 'danger', running: 'warning' }

export default function ExecutionActivityPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Execution Activity"
        description="Past and current workflow runs — linked to orchestration pipelines and Explorer projects."
        breadcrumbs={['deepe', 'Deep Backend', 'Execution Activity']}
      />
      <div className="p-4 md:p-6">
        <Panel title="Workflow executions" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse">
              <thead className="bg-surface">
                <tr className="border-b border-line">
                  <th className={thClass}>Execution</th>
                  <th className={thClass}>Flow</th>
                  <th className={thClass}>Status</th>
                  <th className={thClass}>Duration</th>
                  <th className={thClass}>Environment</th>
                  <th className={thClass}>Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {DEEP_EXECUTIONS.map((row) => (
                  <tr
                    key={row.id}
                    className="cursor-pointer hover:bg-primary-50/40"
                    onClick={() => navigate(`/deep/orchestration?execution=${encodeURIComponent(row.id)}`)}
                  >
                    <td className={`${tdClass} font-mono text-xs`}>{row.id}</td>
                    <td className={tdClass}>{row.flowName}</td>
                    <td className={tdClass}>
                      <Badge tone={STATUS_TONE[row.status]}>{row.status}</Badge>
                    </td>
                    <td className={`${tdClass} tabular-nums`}>{row.durationMs != null ? formatDuration(row.durationMs) : '—'}</td>
                    <td className={tdClass}>{row.environment}</td>
                    <td className={`${tdClass} text-ink-muted`}>{formatDateTime(row.startedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <p className="mt-3 text-xs text-ink-muted">
          Clicking an execution opens Flow Studio with nodes highlighted (success, failed, running).
        </p>
      </div>
    </div>
  )
}
