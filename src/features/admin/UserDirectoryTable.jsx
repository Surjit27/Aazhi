import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import { formatDateTime } from '../../utils/format.js'

function roleTone(role) {
  if (role === 'admin') return 'primary'
  return 'neutral'
}

export default function UserDirectoryTable({ users, emptyMessage = 'No users yet.', onImpersonate }) {
  const columns = onImpersonate ? 5 : 4

  return (
    <DataTable.Root minWidth={720} aria-label="User directory">
      <DataTable.Scroll>
        <DataTable.Table>
          <DataTable.Head>
            <DataTable.Th>Email</DataTable.Th>
            <DataTable.Th>Display name</DataTable.Th>
            <DataTable.Th>Role</DataTable.Th>
            <DataTable.Th>Created</DataTable.Th>
            {onImpersonate && <DataTable.Th align="right">Client portal</DataTable.Th>}
          </DataTable.Head>
          {users.length === 0 ? (
            <DataTable.EmptyBody colSpan={columns} message={emptyMessage} />
          ) : (
            <DataTable.Body>
              {users.map((u) => (
                <DataTable.Row key={u.id}>
                  <DataTable.Td className="font-mono text-xs">{u.email}</DataTable.Td>
                  <DataTable.Td>{u.displayName}</DataTable.Td>
                  <DataTable.Td>
                    <Badge tone={roleTone(u.role)}>{u.role}</Badge>
                  </DataTable.Td>
                  <DataTable.Td className="text-xs text-ink-muted tabular-nums">
                    {u.createdAt ? formatDateTime(u.createdAt) : '—'}
                  </DataTable.Td>
                  {onImpersonate && (
                    <DataTable.Td align="right">
                      <Button type="button" variant="secondary" size="sm" onClick={() => onImpersonate(u)}>
                        Open as client
                      </Button>
                    </DataTable.Td>
                  )}
                </DataTable.Row>
              ))}
            </DataTable.Body>
          )}
        </DataTable.Table>
      </DataTable.Scroll>
      {users.length > 0 && (
        <DataTable.FooterBar>
          <span className="font-medium tabular-nums">
            {users.length} user{users.length === 1 ? '' : 's'}
          </span>
        </DataTable.FooterBar>
      )}
    </DataTable.Root>
  )
}
