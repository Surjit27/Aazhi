import Badge from '../../components/ui/Badge.jsx'
import DataTable from '../../components/ui/DataTable.jsx'

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
    return (
      <DataTable.Root minWidth={960} aria-label="Event history">
        <DataTable.Skeleton columns={6} rows={8} />
      </DataTable.Root>
    )
  }

  if (error) {
    return (
      <DataTable.Root aria-label="Event history">
        <DataTable.Message tone="danger">{error}</DataTable.Message>
      </DataTable.Root>
    )
  }

  return (
    <DataTable.Root minWidth={960} aria-label="Event history">
      <DataTable.Scroll>
        <DataTable.Table>
          <DataTable.Head>
            <DataTable.Th>Occurred at</DataTable.Th>
            <DataTable.Th>Event</DataTable.Th>
            <DataTable.Th>Resource</DataTable.Th>
            <DataTable.Th>Performed by</DataTable.Th>
            <DataTable.Th>Request</DataTable.Th>
            <DataTable.Th>Response</DataTable.Th>
          </DataTable.Head>
          {events.length === 0 ? (
            <DataTable.EmptyBody colSpan={6} message={emptyMessage} />
          ) : (
            <DataTable.Body>
              {events.map((ev) => {
                const occurredAt = ev.occurredAt ?? ev.createdAt
                const eventName = ev.event ?? ev.action
                const resource = ev.resource ?? ev.subjectLabel ?? ev.subjectId ?? '—'
                const performedBy =
                  ev.performedByLabel ||
                  (ev.performedByUserId ? ev.performedByUserId.slice(0, 8) : ev.actorUserId?.slice(0, 8)) ||
                  '—'
                const request = ev.request ?? ev.metadata?.request
                const response = ev.response ?? ev.metadata?.response
                const legacyMeta =
                  !request && !response && ev.metadata && Object.keys(ev.metadata).length > 0 ? ev.metadata : null

                return (
                  <DataTable.Row key={ev.id}>
                    <DataTable.Td className="whitespace-nowrap text-xs text-ink-muted">{formatWhen(occurredAt)}</DataTable.Td>
                    <DataTable.Td>
                      <Badge tone={actionTone(eventName)}>{eventName}</Badge>
                    </DataTable.Td>
                    <DataTable.Td className="text-xs">{resource}</DataTable.Td>
                    <DataTable.Td className="text-xs text-ink-muted">{performedBy}</DataTable.Td>
                    <DataTable.Td
                      className="max-w-[14rem] truncate font-mono text-[11px] text-ink-muted"
                      title={formatPayload(request)}
                    >
                      {legacyMeta ? formatPayload(legacyMeta) : formatPayload(request)}
                    </DataTable.Td>
                    <DataTable.Td
                      className="max-w-[14rem] truncate font-mono text-[11px] text-ink-muted"
                      title={formatPayload(response)}
                    >
                      {legacyMeta ? '—' : formatPayload(response)}
                    </DataTable.Td>
                  </DataTable.Row>
                )
              })}
            </DataTable.Body>
          )}
        </DataTable.Table>
      </DataTable.Scroll>
      {events.length > 0 && (
        <DataTable.FooterBar>
          <span className="font-medium tabular-nums">
            {events.length} event{events.length === 1 ? '' : 's'}
          </span>
        </DataTable.FooterBar>
      )}
    </DataTable.Root>
  )
}
