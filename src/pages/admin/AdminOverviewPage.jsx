import { useEffect, useMemo, useState } from 'react'
import { Shield, Users, UserCog } from 'lucide-react'
import { apiFetch } from '../../lib/api.js'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import StatCard from '../../components/ui/StatCard.jsx'
import UserDirectoryTable from '../../features/admin/UserDirectoryTable.jsx'
import { useAppStore } from '../../stores/appStore.js'

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

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Overview"
        description="Users and roles at a glance."
        breadcrumbs={['Aazhi', 'Dashboards', 'Overview']}
      />

      <div className="flex flex-col gap-6 px-6 pb-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total users" value={stats.total} icon={Users} trend={4.2} trendLabel="this month" tone="primary" />
          <StatCard label="Administrators" value={stats.admins} icon={UserCog} trend={0} trendLabel="unchanged" tone="primary" />
          <StatCard label="Client users" value={stats.clients} icon={Shield} trend={12.5} trendLabel="this month" tone="success" />
        </div>

        <Panel title="All accounts" description="Latest directory (same data as management pages)" bodyClassName="p-0">
          <UserDirectoryTable users={users.slice(0, 20)} emptyMessage="No accounts in the system yet." />
        </Panel>
      </div>
    </div>
  )
}
