import { thClass } from '../explorer/ExplorerInsights.jsx'
import { TableFooter } from './TableFooter.jsx'

export function SortableLegacyTh({ children, align, sortKey, thProps, className = thClass }) {
  const props = thProps(sortKey) ?? {}
  const alignClass = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <th
      className={`${className} ${alignClass} ${props.sortable ? 'cursor-pointer select-none' : ''}`}
      onClick={props.onClick}
      aria-sort={
        props.sortDirection === 'asc' ? 'ascending' : props.sortDirection === 'desc' ? 'descending' : props.sortable ? 'none' : undefined
      }
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {props.sortDirection && (
          <span className="text-[10px] text-primary-600" aria-hidden>
            {props.sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </span>
    </th>
  )
}

export function LegacyTableFooter({ table, itemLabel, className }) {
  const { pagination, total } = table
  if (total === 0) return null
  const summary = `${total} ${itemLabel}${total === 1 ? '' : 's'}`
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
  return <TableFooter summary={summary} pagination={paginationProps} className={className} />
}