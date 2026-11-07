import Badge from '../../components/ui/Badge.jsx'
import { thClass, tdClass } from '../explorer/ExplorerInsights.jsx'

function formatWhen(iso) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return String(iso)
  }
}

function actionTone(action) {
  if (action?.includes('failed')) return 'danger'
  if (action?.includes('deleted')) return 'neutral'
  if (action?.includes('success') || action?.includes('.sent') || action?.includes('created')) return 'success'
  return 'neutral'
}

export default function HistoryEventTable({ events, loading, emptyMessage }) {
  if (loading) {
    return <p className="p-4 text-sm text-ink-muted">Loading history…</p>
  }
  if (events.length === 0) {
    return <p className="p-4 text-sm text-ink-muted">{emptyMessage}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead className="bg-surface">
          <tr className="border-b border-line">
            <th className={thClass}>When</th>
            <th className={thClass}>Action</th>
            <th className={thClass}>Subject</th>
            <th className={thClass}>Actor</th>
            <th className={thClass}>Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {events.map((ev) => (
            <tr key={ev.id} className="hover:bg-surface/80">
              <td className={`${tdClass} whitespace-nowrap text-xs text-ink-muted`}>{formatWhen(ev.createdAt)}</td>
              <td className={tdClass}>
                <Badge tone={actionTone(ev.action)}>{ev.action}</Badge>
              </td>
              <td className={`${tdClass} font-mono text-xs`}>{ev.subjectLabel || ev.subjectId || '—'}</td>
              <td className={`${tdClass} font-mono text-xs text-ink-muted`}>{ev.actorUserId ? ev.actorUserId.slice(0, 8) : '—'}</td>
              <td className={`${tdClass} max-w-xs truncate text-xs text-ink-muted`}>
                {Object.keys(ev.metadata ?? {}).length > 0 ? JSON.stringify(ev.metadata) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
