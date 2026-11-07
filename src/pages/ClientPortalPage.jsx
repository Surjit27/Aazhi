import { useEffect, useState } from 'react'
import { Activity, Globe, Mail, Shield, User } from 'lucide-react'
import { apiFetch } from '../lib/api.js'
import { clientAppOrigin } from '../lib/portal.js'
import { AnalyticsAreaChart } from '../components/dashboard/DashboardCharts.jsx'
import { FilterChip, MiniMetricCard, PanelFilterBar } from '../components/dashboard/DashboardWidgets.jsx'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useAuthStore } from '../stores/authStore.js'

const ACTIVITY = [
  { label: 'Mon', value: 4 },
  { label: 'Tue', value: 6 },
  { label: 'Wed', value: 5 },
  { label: 'Thu', value: 9 },
  { label: 'Fri', value: 7 },
  { label: 'Sat', value: 3 },
  { label: 'Sun', value: 5 },
]

export default function ClientPortalPage() {
  const user = useAuthStore((s) => s.user)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    apiFetch('/api/client/summary')
      .then((data) => {
        if (!cancelled) setSummary(data)
      })
      .catch((e) => {
        if (!cancelled) setError(e.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const impersonating = Boolean(user?.impersonation)

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Account"
        description="Your client workspace on client.localhost."
        breadcrumbs={['deepe', 'Workspace', 'Account']}
      />

      <div className="flex flex-col gap-6 px-6 pb-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Portal"
            value={clientAppOrigin().replace(/^https?:\/\//, '')}
            icon={Globe}
            tone="primary"
            hint="Client hostname"
          />
          <StatCard
            label="API access"
            value={loading ? '…' : summary ? 'Connected' : error ? 'Down' : '—'}
            icon={Shield}
            tone={summary ? 'success' : error ? 'danger' : 'neutral'}
            trend={summary ? 2.4 : undefined}
            trendLabel={summary ? 'stable' : undefined}
          />
          <StatCard
            label="Session"
            value={impersonating ? 'Preview' : 'Active'}
            icon={User}
            tone={impersonating ? 'warning' : 'primary'}
            hint={impersonating ? 'Admin impersonation' : 'Standard client'}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Panel
            className="xl:col-span-2"
            title="Activity"
            description="Weekly workspace touches (demo)"
            toolbar={
              <PanelFilterBar>
                <FilterChip active>This week</FilterChip>
              </PanelFilterBar>
            }
            bodyClassName="p-5 pt-2"
          >
            <AnalyticsAreaChart data={ACTIVITY} height={240} />
          </Panel>

          <div className="flex flex-col gap-4">
            <MiniMetricCard label="Open mocks" value="—" delta={0} tone="success" icon={Activity} />
            <MiniMetricCard label="Notifications" value="2 unread" delta={8} tone="warning" icon={Mail} />
          </div>
        </div>

        <Panel title="Profile" description="Signed-in client identity">
          <div className="grid gap-4 p-5 sm:grid-cols-2">
            <div className="glass-inset p-4">
              <p className="text-xs font-medium text-ink-muted">Display name</p>
              <p className="mt-1 text-sm font-semibold text-ink">{user?.displayName ?? '—'}</p>
            </div>
            <div className="glass-inset p-4">
              <p className="text-xs font-medium text-ink-muted">Email</p>
              <p className="mt-1 text-sm font-medium text-ink">{user?.email ?? '—'}</p>
            </div>
            <div className="glass-inset p-4 sm:col-span-2">
              <p className="text-xs font-medium text-ink-muted">API summary</p>
              {loading && <p className="mt-1 text-sm text-ink-muted">Loading…</p>}
              {error && <p className="mt-1 text-sm text-danger-700">{error}</p>}
              {summary && (
                <p className="mt-1 text-sm text-ink">
                  <Badge tone="success">{summary.area}</Badge>
                  <span className="ml-2 text-ink-muted">{summary.message}</span>
                </p>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
