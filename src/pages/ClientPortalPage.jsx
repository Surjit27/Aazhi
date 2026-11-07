import { useEffect, useState } from 'react'
import { Globe, Mail, Shield, User } from 'lucide-react'
import { apiFetch } from '../lib/api.js'
import { clientAppOrigin } from '../lib/portal.js'
import { PageHeader, Panel } from '../components/ui/Panel.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import Badge from '../components/ui/Badge.jsx'
import { useAuthStore } from '../stores/authStore.js'

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
        description="Your client workspace on localhost — isolated from the admin console."
        breadcrumbs={['Aazhi', 'Workspace', 'Account']}
      />

      <div className="flex flex-col gap-6 px-6 pb-8">
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
            value={loading ? '…' : summary ? 'Connected' : error ? 'Unavailable' : '—'}
            icon={Shield}
            tone={summary ? 'success' : error ? 'danger' : 'neutral'}
            hint={summary?.area ?? (error ? 'Check API' : 'Loading')}
          />
          <StatCard
            label="Session"
            value={impersonating ? 'Impersonation' : 'Standard'}
            icon={User}
            tone={impersonating ? 'warning' : 'primary'}
            hint={impersonating ? 'Admin preview' : 'Signed in client'}
          />
        </div>

        <Panel title="Profile" description="Signed-in client identity">
          <div className="space-y-4 p-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="glass-inset p-4">
                <p className="text-xs font-medium text-ink-muted">Display name</p>
                <p className="mt-1 text-sm font-semibold text-ink">{user?.displayName ?? '—'}</p>
              </div>
              <div className="glass-inset p-4">
                <p className="text-xs font-medium text-ink-muted">Email</p>
                <p className="mt-1 flex items-center gap-2 text-sm font-medium text-ink">
                  <Mail size={14} className="text-ink-subtle" />
                  {user?.email ?? '—'}
                </p>
              </div>
              <div className="glass-inset p-4">
                <p className="text-xs font-medium text-ink-muted">Role</p>
                <p className="mt-1">
                  <Badge tone="primary">{user?.role ?? 'client'}</Badge>
                </p>
              </div>
              <div className="glass-inset p-4">
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
            <p className="text-xs leading-relaxed text-ink-muted">
              Enable workspace features from the admin console under Feature flags. Mock servers, scheduling, and
              monitoring appear in the sidebar when allowed for your account.
            </p>
          </div>
        </Panel>
      </div>
    </div>
  )
}
