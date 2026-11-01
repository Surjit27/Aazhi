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
        description="Admin console on admin.localhost — users and roles at a glance."
      />

      <div className="flex flex-col gap-5 p-4 md:p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Total users" value={stats.total} hint="PostgreSQL accounts" icon={Users} />
          <StatCard label="Administrators" value={stats.admins} hint="admin.localhost access" icon={UserCog} tone="primary" />
          <StatCard label="Client users" value={stats.clients} hint="localhost access" icon={Shield} tone="success" />
        </div>

        <Panel title="All accounts" description="Latest directory (same data as management pages)" bodyClassName="p-0">
          <UserDirectoryTable users={users.slice(0, 20)} emptyMessage="No accounts in the system yet." />
        </Panel>
      </div>
    </div>
  )
}
