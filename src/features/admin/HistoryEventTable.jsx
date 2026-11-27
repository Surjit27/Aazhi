import { useMemo, useState } from 'react'
import { Eye } from 'lucide-react'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import Modal from '../../components/ui/Modal.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import EmailHtmlPreview from '../email/EmailHtmlPreview.jsx'
import { apiFetch } from '../../lib/api.js'
import { TableFooter } from '../tables/TableFooter.jsx'
import { sortRows } from '../../utils/tableSort.js'
import { nextSortDirection } from '../../utils/tableSort.js'

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

const LOCAL_SORT_ACCESSORS = {
  request: (ev) => formatPayload(ev.request ?? ev.metadata?.request),
  response: (ev) => formatPayload(ev.response ?? ev.metadata?.response),
}

const SERVER_SORT_KEYS = new Set(['occurredAt', 'event', 'resource', 'performedBy'])

export default function HistoryEventTable({
  events,
  loading,
  error,
  emptyMessage,
  pagination,
  sort,
  total = 0,
  showEmailPreview = false,
  previewApiPath = '/api/settings/email/previews',
}) {
  const [localSortKey, setLocalSortKey] = useState(null)
  const [localSortDirection, setLocalSortDirection] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState('')
  const [previewDoc, setPreviewDoc] = useState(null)

  const toggleLocalSort = (key) => {
    const next = nextSortDirection(localSortKey, localSortDirection, key)
    if (!next) {
      setLocalSortKey(null)
      setLocalSortDirection(null)
      return
    }
    setLocalSortKey(key)
    setLocalSortDirection(next)
  }

  const th = (key) => {
    if (SERVER_SORT_KEYS.has(key)) return sort?.thProps?.(key) ?? {}
    const active = localSortKey === key
    return {
      sortable: true,
      sortDirection: active ? localSortDirection : undefined,
      onClick: () => toggleLocalSort(key),
    }
  }

  const rows = useMemo(() => {
    if (localSortKey && LOCAL_SORT_ACCESSORS[localSortKey]) {
      return sortRows(events, LOCAL_SORT_ACCESSORS, localSortKey, localSortDirection)
    }
    return events
  }, [events, localSortKey, localSortDirection])

  const colCount = showEmailPreview ? 7 : 6

  const openPreview = async (previewId) => {
    if (!previewId) return
    setPreviewOpen(true)
    setPreviewLoading(true)
    setPreviewError('')
    setPreviewDoc(null)
    try {
      const { preview } = await apiFetch(`${previewApiPath}/${previewId}`)
      setPreviewDoc(preview)
    } catch (err) {
      setPreviewError(err.message || 'Could not load preview')
    } finally {
      setPreviewLoading(false)
    }
  }

  if (loading) {
    return (
      <DataTable.Root minWidth={960} aria-label="Event history">
        <DataTable.Skeleton columns={colCount} rows={8} />
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

  const summary =
    total > 0
      ? `${total} event${total === 1 ? '' : 's'}`
      : rows.length > 0
        ? `${rows.length} event${rows.length === 1 ? '' : 's'}`
        : null

  return (
    <>
    <DataTable.Root minWidth={960} aria-label="Event history">
      <DataTable.Scroll>
        <DataTable.Table>
          <DataTable.Head>
            <DataTable.Th {...th('occurredAt')}>Occurred at</DataTable.Th>
            <DataTable.Th {...th('event')}>Event</DataTable.Th>
            <DataTable.Th {...th('resource')}>Resource</DataTable.Th>
            <DataTable.Th {...th('performedBy')}>Performed by</DataTable.Th>
            {showEmailPreview ? <DataTable.Th>Preview</DataTable.Th> : null}
            <DataTable.Th {...th('request')}>Request</DataTable.Th>
            <DataTable.Th {...th('response')}>Response</DataTable.Th>
          </DataTable.Head>
          {rows.length === 0 ? (
            <DataTable.EmptyBody colSpan={colCount} message={emptyMessage} />
          ) : (
            <DataTable.Body>
              {rows.map((ev) => {
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
                const previewId = ev.previewId ?? ev.metadata?.previewId

                return (
                  <DataTable.Row key={ev.id}>
                    <DataTable.Td className="whitespace-nowrap text-xs text-ink-muted">{formatWhen(occurredAt)}</DataTable.Td>
                    <DataTable.Td>
                      <Badge tone={actionTone(eventName)}>{eventName}</Badge>
                    </DataTable.Td>
                    <DataTable.Td className="text-xs">{resource}</DataTable.Td>
                    <DataTable.Td className="text-xs text-ink-muted">{performedBy}</DataTable.Td>
                    {showEmailPreview ? (
                      <DataTable.Td>
                        {previewId ? (
                          <Button type="button" size="sm" variant="secondary" onClick={() => openPreview(previewId)}>
                            <Eye size={14} /> View
                          </Button>
                        ) : (
                          <span className="text-xs text-ink-subtle">—</span>
                        )}
                      </DataTable.Td>
                    ) : null}
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
      {(rows.length > 0 || total > 0) && <TableFooter summary={summary} pagination={pagination} />}
    </DataTable.Root>
    {showEmailPreview ? (
      <Modal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Stored email preview"
        width="max-w-3xl"
        description="HTML snapshot saved when you previewed or sent from Settings."
      >
        {previewLoading ? (
          <p className="text-sm text-ink-muted">Loading preview…</p>
        ) : previewError ? (
          <p className="text-sm text-danger-700">{previewError}</p>
        ) : previewDoc ? (
          <EmailHtmlPreview
            html={previewDoc.html}
            subject={previewDoc.subject}
            fromLabel={
              previewDoc.from?.email
                ? `${previewDoc.from.name ? `${previewDoc.from.name} ` : ''}<${previewDoc.from.email}>`
                : null
            }
          />
        ) : null}
      </Modal>
    ) : null}
    </>
  )
}