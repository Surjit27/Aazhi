import { Link } from 'react-router-dom'
import EventSchedulerPage from '../EventSchedulerPage.jsx'
import { Panel } from '../../components/ui/Panel.jsx'
import Button from '../../components/ui/Button.jsx'
import { Calendar, Cloud, Network } from 'lucide-react'

/** API job triggers + links into project orchestration & cloud deploy. */
export default function DeepEventSchedulerPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="border-b border-line px-4 pt-4 md:px-6">
        <Panel title="Scheduler stack" description="Deep Backend" bodyClassName="p-4">
          <ul className="grid gap-2 text-sm text-ink-muted sm:grid-cols-3">
            <li className="glass-inset rounded-lg p-3">
              <Calendar size={16} className="text-primary-600" />
              <p className="mt-2 font-medium text-ink">Event Scheduler (below)</p>
              <p className="text-xs">BullMQ triggers against your API routes.</p>
            </li>
            <li className="glass-inset rounded-lg p-3">
              <Network size={16} className="text-primary-600" />
              <p className="mt-2 font-medium text-ink">Orchestration</p>
              <Link to="/deep/orchestration">
                <Button size="sm" variant="secondary" className="mt-2">
                  Open pipelines
                </Button>
              </Link>
            </li>
            <li className="glass-inset rounded-lg p-3">
              <Cloud size={16} className="text-primary-600" />
              <p className="mt-2 font-medium text-ink">Cloud profiles</p>
              <Link to="/integrations/cloud">
                <Button size="sm" variant="secondary" className="mt-2">
                  AWS · GCP · Azure
                </Button>
              </Link>
            </li>
          </ul>
        </Panel>
      </div>
      <EventSchedulerPage />
    </div>
  )
}
