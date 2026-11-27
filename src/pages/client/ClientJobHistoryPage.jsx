import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import HistoryEventTable from '../../features/admin/HistoryEventTable.jsx'
import { useHistoryEvents } from '../../features/admin/useHistoryEvents.js'
import { brandBreadcrumbs } from '../../lib/breadcrumbs.js'

export default function ClientJobHistoryPage() {
  const { events, loading, error, reload, pagination, sort, total } = useHistoryEvents('/api/client/history/jobs')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Job history"
        description="Scheduler and trigger runs scoped to your schema."
        breadcrumbs={brandBreadcrumbs('History', 'Jobs')}
        actions={
          <Button type="button" onClick={reload} disabled={loading}>
            Refresh
          </Button>
        }
      />
      <div className="p-4 md:p-6">
        <Panel title="Triggers and runs" bodyClassName="p-0">
          <HistoryEventTable
            events={events}
            loading={loading}
            error={error}
            total={total}
            pagination={pagination}
            sort={sort}
            emptyMessage="No job history in your workspace yet."
          />
        </Panel>
      </div>
    </div>
  )
}
