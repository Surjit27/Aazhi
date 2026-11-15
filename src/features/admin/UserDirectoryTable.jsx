import { useMemo } from 'react'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'
import DataTable from '../../components/ui/DataTable.jsx'
import { formatDateTime } from '../../utils/format.js'
import { useClientTable } from '../../hooks/useClientTable.js'
import { TableFooter } from '../tables/TableFooter.jsx'

const ACCESSORS = {
  email: (u) => u.email,
  displayName: (u) => u.displayName,
  role: (u) => u.role,
  createdAt: (u) => u.createdAt,
}

function roleTone(role) {
  if (role === 'admin') return 'primary'
  return 'neutral'
}

export default function UserDirectoryTable({
  users,
  emptyMessage = 'No users yet.',
  onImpersonate,
  pageSize = 15,
  resetKey,
}) {
  const accessors = useMemo(() => ACCESSORS, [])
  const table = useClientTable(users, {
    pageSize,
    accessors,
    defaultSort: { key: 'createdAt', direction: 'desc' },
    resetKey,
  })
  const columns = onImpersonate ? 5 : 4
  const { rows, thProps, pagination, total } = table

  const paginationProps = {
    page: pagination.page,
    totalPages: pagination.totalPages,
    total: pagination.total,
    rangeStart: pagination.rangeStart,
    rangeEnd: pagination.rangeEnd,
    onPageChange: pagination.setPage,
    onPrev: pagination.goPrev,
    onNext: pagination.goNext,
    hasPrev: pagination.hasPrev,
    hasNext: pagination.hasNext,
  }

  return (
    <DataTable.Root minWidth={720} aria-label="User directory">
      <DataTable.Scroll>
        <DataTable.Table>
          <DataTable.Head>
            <DataTable.Th {...thProps('email')}>Email</DataTable.Th>
            <DataTable.Th {...thProps('displayName')}>Display name</DataTable.Th>
            <DataTable.Th {...thProps('role')}>Role</DataTable.Th>
            <DataTable.Th {...thProps('createdAt')}>Created</DataTable.Th>
            {onImpersonate && <DataTable.Th align="right">Client portal</DataTable.Th>}
          </DataTable.Head>
          {rows.length === 0 ? (
            <DataTable.EmptyBody colSpan={columns} message={emptyMessage} />
          ) : (
            <DataTable.Body>
              {rows.map((u) => (
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
      {total > 0 && (
        <TableFooter
          summary={`${total} user${total === 1 ? '' : 's'}`}
          pagination={paginationProps}
        />
      )}
    </DataTable.Root>
  )
}