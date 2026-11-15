import DataTable from '../../components/ui/DataTable.jsx'
import TablePagination from '../../components/ui/TablePagination.jsx'

export function TableFooter({ summary, pagination, className = '' }) {
  if (!pagination) {
    return summary ? (
      <DataTable.FooterBar className={className}>
        <span className="font-medium tabular-nums">{summary}</span>
      </DataTable.FooterBar>
    ) : null
  }

  return (
    <DataTable.FooterBar className={className}>
      {summary ? <span className="font-medium tabular-nums text-ink-muted">{summary}</span> : <span />}
      <TablePagination {...pagination} />
    </DataTable.FooterBar>
  )
}