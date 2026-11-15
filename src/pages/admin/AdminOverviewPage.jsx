import { useEffect, useMemo, useState } from 'react'
import { Activity, Mail, Shield, TrendingDown, TrendingUp, UserCog, Users } from 'lucide-react'
import { apiFetch } from '../../lib/api.js'
import { AnalyticsAreaChart, RoleDonutChart, TrafficBarChart } from '../../components/dashboard/DashboardCharts.jsx'
import {
  DistributionBar,
  FilterChip,
  MiniMetricCard,
  PanelFilterBar,
  RecentUsersList,
  WorkspaceInsightCard,
} from '../../components/dashboard/DashboardWidgets.jsx'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import UserDirectoryTable from '../../features/admin/UserDirectoryTable.jsx'
import { useAppStore } from '../../stores/appStore.js'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug']

function buildSignupSeries(users) {
  const base = MONTHS.map((label) => ({ label, value: 0 }))
  for (const u of users) {
    if (!u.createdAt) continue
    const m = new Date(u.createdAt).getMonth()
    if (m < base.length) base[m].value += 1
  }
  let running = 0
  return base.map((row) => {
    running += row.value
    return { ...row, value: running || row.value }
  })
}

export default function AdminOverviewPage() {
  const pushToast = useAppStore((s) => s.pushToast)
  const [users, setUsers] = useState([])

  useEffect(() => {
    apiFetch('/api/auth/users')
      .then((r) => setUsers(r.users))
      .catch((e) => pushToast({ tone: 'danger', title: 'Could not load users', body: e.message }))
  }, [pushToast])

  const stats = useMemo(() => {
    const admins = users.filter((u) => u.role === 'admin').length
    const clients = users.filter((u) => u.role === 'client').length
    return { admins, clients, total: users.length }
  }, [users])

  const signupSeries = useMemo(() => buildSignupSeries(users), [users])

  const donutData = useMemo(
    () => [
      { name: 'Clients', value: stats.clients, color: '#4F86F7' },
      { name: 'Admins', value: stats.admins, color: '#5EB1FF' },
      { name: 'Other', value: Math.max(0, stats.total - stats.admins - stats.clients), color: '#F0A500' },
    ].filter((d) => d.value > 0),
    [stats],
  )

  const trafficData = [
    { label: 'Direct', value: 42 },
    { label: 'Admin', value: stats.admins * 12 + 8 },
    { label: 'Client', value: stats.clients * 9 + 12 },
    { label: 'API', value: 24 },
  ]

  const recentUsers = useMemo(
    () =>
      [...users]
        .sort((a, b) => Date.parse(b.createdAt ?? 0) - Date.parse(a.createdAt ?? 0))
        .slice(0, 5),
    [users],
  )

  const clientPct = stats.total ? Math.round((stats.clients / stats.total) * 100) : 0
  const adminPct = stats.total ? Math.round((stats.admins / stats.total) * 100) : 0

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Overview"
        description="Users, activity, and workspace health."
        breadcrumbs={['deepe', 'Dashboards', 'Overview']}
      />

      <div className="flex flex-col gap-6 px-6 pb-10">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Total users" value={stats.total} icon={Users} trend={8.2} trendLabel="vs last month" tone="primary" />
          <StatCard label="Administrators" value={stats.admins} icon={UserCog} trend={0} trendLabel="unchanged" tone="primary" />
          <StatCard label="Client users" value={stats.clients} icon={Shield} trend={12.5} trendLabel="vs last month" tone="success" />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Panel
            className="xl:col-span-2"
            title="Analytics"
            description="Account growth by month (cumulative)"
            toolbar={
              <PanelFilterBar>
                <FilterChip>Filter</FilterChip>
                <FilterChip active>This month</FilterChip>
              </PanelFilterBar>
            }
            bodyClassName="p-5 pt-2"
          >
            <AnalyticsAreaChart data={signupSeries.length ? signupSeries : MONTHS.map((label) => ({ label, value: 0 }))} />
          </Panel>

          <div className="flex flex-col gap-4">
            <WorkspaceInsightCard
              title="Workspace status"
              metric={`${stats.total}`}
              metricLabel="Accounts in directory"
              subtitle="PostgreSQL-backed identities for admin and client portals."
            />
            <MiniMetricCard label="Sign-in success" value="99.2%" delta={1.2} tone="success" icon={TrendingUp} />
            <MiniMetricCard label="Failed jobs (24h)" value="3" delta={-3.1} tone="danger" icon={TrendingDown} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Recent accounts" description="Latest sign-ups" bodyClassName="p-0">
            <RecentUsersList users={recentUsers} emptyMessage="No accounts yet." />
          </Panel>

          <Panel
            className="lg:col-span-2"
            title="User directory"
            description="Stock-style report · roles and emails"
            bodyClassName="p-0"
          >
            <UserDirectoryTable users={users} pageSize={8} emptyMessage="No accounts in the system yet." />
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="Users by role" description="Distribution across portals" bodyClassName="space-y-4 p-5">
            <p className="text-2xl font-semibold text-ink tabular-nums">{stats.total}</p>
            <DistributionBar label="Client users" value={stats.clients} percent={clientPct} color="bg-primary-500" />
            <DistributionBar label="Administrators" value={stats.admins} percent={adminPct} color="bg-cyan-500" />
            <DistributionBar
              label="Unassigned"
              value={Math.max(0, stats.total - stats.clients - stats.admins)}
              percent={Math.max(0, 100 - clientPct - adminPct)}
              color="bg-amber-500"
            />
          </Panel>

          <Panel title="Account mix" bodyClassName="p-4">
            <RoleDonutChart data={donutData.length ? donutData : [{ name: 'Empty', value: 1, color: '#E2E6EE' }]} centerLabel={`${stats.total}`} />
            <ul className="mt-2 space-y-1 text-xs text-ink-muted">
              {donutData.map((d) => (
                <li key={d.name} className="flex justify-between">
                  <span>{d.name}</span>
                  <span className="font-medium text-ink tabular-nums">{d.value}</span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel title="Traffic overview" description="Sample channel volume" bodyClassName="p-4">
            <TrafficBarChart data={trafficData} />
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-ink-muted">
                <Activity size={14} /> Portal API healthy
              </div>
              <div className="flex items-center gap-2 text-ink-muted">
                <Mail size={14} /> Email history enabled
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
