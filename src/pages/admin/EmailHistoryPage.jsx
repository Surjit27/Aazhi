import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import HistoryEventTable from '../../features/admin/HistoryEventTable.jsx'
import { useHistoryEvents } from '../../features/admin/useHistoryEvents.js'

export default function EmailHistoryPage() {
  const { events, loading, error, reload, pagination, sort, total } = useHistoryEvents('/api/admin/history/emails')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Email history"
        actions={
          <Button type="button" onClick={reload} disabled={loading}>
            Refresh
          </Button>
        }
      />
      <div className="p-4 md:p-6">
        <Panel title="SendGrid settings and test sends" bodyClassName="p-0">
          <HistoryEventTable
            events={events}
            loading={loading}
            error={error}
            total={total}
            pagination={pagination}
            sort={sort}
            emptyMessage="No email activity yet. Updates and test sends from Settings will appear here."
          />
        </Panel>
      </div>
    </div>
  )
}
