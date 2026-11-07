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

function actionTone(event) {
  if (event?.includes('failed')) return 'danger'
  if (event?.includes('deleted')) return 'neutral'
  if (event?.includes('success') || event?.includes('.sent') || event?.includes('created') || event === 'impersonation') {
    return 'success'
  }
  return 'neutral'
}

function formatPayload(value) {
  if (value == null) return '—'
  if (typeof value === 'object' && Object.keys(value).length === 0) return '—'
  try {
    return JSON.stringify(value, null, 0)
  } catch {
    return String(value)
  }
}

export default function HistoryEventTable({ events, loading, error, emptyMessage }) {
  if (loading) {
    return <p className="p-4 text-sm text-ink-muted">Loading history…</p>
  }
  if (error) {
    return <p className="p-4 text-sm text-danger-700">{error}</p>
  }
  if (events.length === 0) {
    return <p className="p-4 text-sm text-ink-muted">{emptyMessage}</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[960px] border-collapse">
        <thead className="bg-surface">
          <tr className="border-b border-line">
            <th className={thClass}>Occurred at</th>
            <th className={thClass}>Event</th>
            <th className={thClass}>Resource</th>
            <th className={thClass}>Performed by</th>
            <th className={thClass}>Request</th>
            <th className={thClass}>Response</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {events.map((ev) => {
            const occurredAt = ev.occurredAt ?? ev.createdAt
            const eventName = ev.event ?? ev.action
            const resource = ev.resource ?? ev.subjectLabel ?? ev.subjectId ?? '—'
            const performedBy =
              ev.performedByLabel || (ev.performedByUserId ? ev.performedByUserId.slice(0, 8) : ev.actorUserId?.slice(0, 8)) || '—'
            const request = ev.request ?? ev.metadata?.request
            const response = ev.response ?? ev.metadata?.response
            const legacyMeta =
              !request && !response && ev.metadata && Object.keys(ev.metadata).length > 0 ? ev.metadata : null

            return (
              <tr key={ev.id} className="hover:bg-surface/80">
                <td className={`${tdClass} whitespace-nowrap text-xs text-ink-muted`}>{formatWhen(occurredAt)}</td>
                <td className={tdClass}>
                  <Badge tone={actionTone(eventName)}>{eventName}</Badge>
                </td>
                <td className={`${tdClass} text-xs`}>{resource}</td>
                <td className={`${tdClass} text-xs text-ink-muted`}>{performedBy}</td>
                <td className={`${tdClass} max-w-[14rem] truncate font-mono text-[11px] text-ink-muted`} title={formatPayload(request)}>
                  {legacyMeta ? formatPayload(legacyMeta) : formatPayload(request)}
                </td>
                <td className={`${tdClass} max-w-[14rem] truncate font-mono text-[11px] text-ink-muted`} title={formatPayload(response)}>
                  {legacyMeta ? '—' : formatPayload(response)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
