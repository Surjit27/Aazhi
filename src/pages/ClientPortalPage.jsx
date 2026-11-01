import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api.js'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import Badge from '../components/ui/Badge.jsx'

export default function ClientPortalPage() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiFetch('/api/client/summary')
      .then(setSummary)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Overview"
        description="Your client workspace on localhost."
      />
      <div className="p-6">
        <Panel title="Account" bodyClassName="p-4">
          {error && <p className="text-sm text-danger-700">{error}</p>}
          {summary && (
            <p className="text-sm text-ink">
              Connected to API: <Badge tone="success">{summary.area}</Badge> — {summary.message}
            </p>
          )}
          <p className="mt-3 text-xs text-ink-muted">
            Client users can be extended with read-only dashboards, shared workflows, and injection jobs scoped to their
            organization.
          </p>
        </Panel>
      </div>
    </div>
  )
}
