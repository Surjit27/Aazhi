import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import HistoryEventTable from '../../features/admin/HistoryEventTable.jsx'
import { useHistoryEvents } from '../../features/admin/useHistoryEvents.js'

export default function JobHistoryPage() {
  const { events, loading, error, reload } = useHistoryEvents('/api/admin/history/jobs')

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Job history"
        actions={
          <Button type="button" onClick={reload} disabled={loading}>
            Refresh
          </Button>
        }
      />
      <div className="p-4 md:p-6">
        <Panel title="Triggers, manual runs, and BullMQ worker results" bodyClassName="p-0">
          <HistoryEventTable
            events={events}
            loading={loading}
            error={error}
            emptyMessage="No job activity yet. Create or run triggers from Settings to populate this log."
          />
        </Panel>
      </div>
    </div>
  )
}
