import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import HistoryEventTable from '../../features/admin/HistoryEventTable.jsx'
import { useHistoryEvents } from '../../features/admin/useHistoryEvents.js'
import { brandBreadcrumbs } from '../../lib/breadcrumbs.js'

export default function ClientEmailHistoryPage() {
  const { events, loading, error, reload, pagination, sort, total } = useHistoryEvents('/api/client/history/emails')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Email history"
        description="Outbound email attempts for this client workspace."
        breadcrumbs={brandBreadcrumbs('History', 'Emails')}
        actions={
          <Button type="button" onClick={reload} disabled={loading}>
            Refresh
          </Button>
        }
      />
      <div className="p-4 md:p-6">
        <Panel title="Delivery and test sends" bodyClassName="p-0">
          <HistoryEventTable
            events={events}
            loading={loading}
            error={error}
            total={total}
            pagination={pagination}
            sort={sort}
            showEmailPreview
            previewApiPath="/api/client/history/email-previews"
            emptyMessage="No email history in your workspace yet."
          />
        </Panel>
      </div>
    </div>
  )
}
