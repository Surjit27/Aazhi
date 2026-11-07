import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import HistoryEventTable from '../../features/admin/HistoryEventTable.jsx'
import { useHistoryEvents } from '../../features/admin/useHistoryEvents.js'

export default function UserHistoryPage() {
  const { events, loading, error, reload } = useHistoryEvents('/api/admin/history/users')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="User history"
        actions={
          <Button type="button" onClick={reload} disabled={loading}>
            Refresh
          </Button>
        }
      />
      <div className="p-4 md:p-6">
        <Panel title="Sign-in, accounts, roles, and impersonation" bodyClassName="p-0">
          <HistoryEventTable
            events={events}
            loading={loading}
            error={error}
            emptyMessage="No user activity recorded yet. Events appear after sign-in and account changes."
          />
        </Panel>
      </div>
    </div>
  )
}
