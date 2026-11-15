import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import HistoryEventTable from '../../features/admin/HistoryEventTable.jsx'
import { useHistoryEvents } from '../../features/admin/useHistoryEvents.js'

export default function ClientUserHistoryPage() {
  const { events, loading, error, reload, pagination, sort, total } = useHistoryEvents('/api/client/history/users')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="User history"
        description="Activity stored in your client schema only."
        breadcrumbs={['deepe', 'History', 'Users']}
        actions={
          <Button type="button" onClick={reload} disabled={loading}>
            Refresh
          </Button>
        }
      />
      <div className="p-4 md:p-6">
        <Panel title="Sign-in and account events" bodyClassName="p-0">
          <HistoryEventTable
            events={events}
            loading={loading}
            error={error}
            total={total}
            pagination={pagination}
            sort={sort}
            emptyMessage="No user activity in your workspace yet."
          />
        </Panel>
      </div>
    </div>
  )
}
