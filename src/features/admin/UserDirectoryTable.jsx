import Badge from '../../components/ui/Badge.jsx'
import { thClass, tdClass } from '../explorer/ExplorerInsights.jsx'
import { formatDateTime } from '../../utils/format.js'

export default function UserDirectoryTable({ users, emptyMessage = 'No users yet.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] border-collapse">
        <thead className="bg-surface">
          <tr className="border-b border-line">
            <th className={thClass}>Email</th>
            <th className={thClass}>Display name</th>
            <th className={thClass}>Role</th>
            <th className={thClass}>Created</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-surface/80">
              <td className={`${tdClass} font-mono text-xs`}>{u.email}</td>
              <td className={tdClass}>{u.displayName}</td>
              <td className={tdClass}>
                <Badge tone={u.role === 'admin' ? 'primary' : 'neutral'}>{u.role}</Badge>
              </td>
              <td className={`${tdClass} text-xs text-ink-muted tabular-nums`}>
                {u.createdAt ? formatDateTime(u.createdAt) : '—'}
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={4} className={`${tdClass} py-8 text-center text-xs text-ink-muted`}>
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
