import { createContext, useContext, useId, useMemo } from 'react'
import TablePagination from './TablePagination.jsx'

/** @typedef {'compact' | 'comfortable' | 'spacious'} TableDensity */
/** @typedef {'primary' | 'violet' | 'teal' | 'amber' | 'cyan' | 'slate'} TableAccent */

const TableContext = createContext({
  density: 'comfortable',
  accent: 'slate',
  zebra: false,
  minWidth: undefined,
})

const DENSITY = {
  compact: { th: 'py-1.5', td: 'py-1.5', skeleton: 'h-8' },
  comfortable: { th: 'py-2', td: 'py-2', skeleton: 'h-10' },
  spacious: { th: 'py-3', td: 'py-3', skeleton: 'h-12' },
}

const TABLE = {
  head: 'bg-surface',
  headText: 'text-ink-muted',
  headDivider: 'border-line',
  rowHover: 'hover:bg-surface',
  rowActive: 'bg-primary-50/70',
  zebra: 'even:bg-[#FAFBFC]',
  footer: 'bg-surface text-ink-muted',
}

function tableTokens(_accent) {
  void _accent
  return TABLE
}

const TH_BASE =
  'px-3 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted whitespace-nowrap'
const TD_BASE = 'px-3 align-middle text-[13px] text-ink'

/** Legacy class strings used across the app — kept stable for gradual migration */
export const thClass = `${TH_BASE} py-2`
export const tdClass = `${TD_BASE} py-2`

function useTable() {
  return useContext(TableContext)
}

function alignClass(align) {
  if (align === 'right') return 'text-right'
  if (align === 'center') return 'text-center'
  return 'text-left'
}

function Root({
  children,
  density = 'comfortable',
  accent = 'slate',
  zebra = false,
  minWidth,
  variant = 'embedded',
  className = '',
  'aria-label': ariaLabel,
}) {
  const value = useMemo(
    () => ({ density, accent, zebra, minWidth }),
    [density, accent, zebra, minWidth],
  )

  const shell =
    variant === 'standalone'
      ? 'overflow-hidden rounded-lg border border-line bg-white shadow-card'
      : 'overflow-hidden bg-white/40'

  return (
    <TableContext.Provider value={value}>
      <div className={`${shell} ${className}`} role="region" aria-label={ariaLabel}>
        {children}
      </div>
    </TableContext.Provider>
  )
}

function Toolbar({ children, className = '' }) {
  return (
    <div
      className={`flex flex-col gap-2 border-b border-line bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${className}`}
    >
      {children}
    </div>
  )
}

function Scroll({ children, className = '' }) {
  return <div className={`scrollbar-thin overflow-x-auto ${className}`}>{children}</div>
}

function Table({ children, className = '' }) {
  const { minWidth } = useTable()
  return (
    <table
      className={`w-full border-collapse ${className}`}
      style={minWidth != null ? { minWidth: `${minWidth}px` } : undefined}
    >
      {children}
    </table>
  )
}

function Head({ children, sticky = true, className = '' }) {
  const { accent } = useTable()
  const tokens = tableTokens(accent)
  return (
    <thead
      className={`${sticky ? 'sticky top-0 z-10 glass-bar' : ''} ${tokens.head} ${className}`}
    >
      <tr className={`border-b ${tokens.headDivider}`}>{children}</tr>
    </thead>
  )
}

function HeadRow({ children, className = '' }) {
  const { accent } = useTable()
  const tokens = tableTokens(accent)
  return <tr className={`border-b ${tokens.headDivider} ${className}`}>{children}</tr>
}

function Body({ children, className = '' }) {
  return <tbody className={`divide-y divide-line ${className}`}>{children}</tbody>
}

function Foot({ children, className = '' }) {
  const { accent } = useTable()
  const tokens = tableTokens(accent)
  return (
    <tfoot className={`border-t border-line ${tokens.footer} ${className}`}>
      <tr>{children}</tr>
    </tfoot>
  )
}

function Row({
  children,
  active = false,
  selected = false,
  onClick,
  className = '',
  ...rest
}) {
  const { accent, zebra } = useTable()
  const tokens = tableTokens(accent)
  const interactive = Boolean(onClick)

  return (
    <tr
      onClick={onClick}
      className={[
        'transition-colors',
        interactive ? 'cursor-pointer' : '',
        active ? tokens.rowActive : '',
        selected ? `${tokens.rowActive} ring-1 ring-inset ring-primary-100` : '',
        zebra ? tokens.zebra : '',
        tokens.rowHover,
        'focus-within:outline focus-within:outline-2 focus-within:outline-offset-[-2px] focus-within:outline-primary-500/40',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {children}
    </tr>
  )
}

function Th({
  children,
  align = 'left',
  scope = 'col',
  sortable = false,
  sortDirection,
  onClick,
  className = '',
  ...rest
}) {
  const { density, accent } = useTable()
  const pad = DENSITY[density]?.th ?? DENSITY.comfortable.th
  const headText = tableTokens(accent).headText
  const sortLabel =
    sortDirection === 'asc' ? ' (sorted ascending)' : sortDirection === 'desc' ? ' (sorted descending)' : ''

  return (
    <th
      scope={scope}
      className={`${TH_BASE} ${headText} ${pad} ${alignClass(align)} ${sortable ? 'cursor-pointer select-none' : ''} ${className}`}
      aria-sort={
        sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : sortable ? 'none' : undefined
      }
      onClick={sortable ? onClick : undefined}
      onKeyDown={
        sortable && onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick(e)
              }
            }
          : undefined
      }
      tabIndex={sortable && onClick ? 0 : undefined}
      {...rest}
    >
      <span className="inline-flex items-center gap-1">
        {children}
        {sortable && sortDirection && (
          <span className="text-[10px] text-primary-600" aria-hidden>
            {sortDirection === 'asc' ? '↑' : '↓'}
          </span>
        )}
      </span>
      {sortable && <span className="sr-only">{sortLabel}</span>}
    </th>
  )
}

function Td({ children, align = 'left', className = '', ...rest }) {
  const { density } = useTable()
  const pad = DENSITY[density]?.td ?? DENSITY.comfortable.td
  return (
    <td className={`${TD_BASE} ${pad} ${alignClass(align)} ${className}`} {...rest}>
      {children}
    </td>
  )
}

function FooterBar({ children, className = '' }) {
  const { accent } = useTable()
  const tokens = tableTokens(accent)
  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2.5 text-xs ${tokens.footer} ${className}`}
    >
      {children}
    </div>
  )
}

function EmptyBody({ colSpan, message, action }) {
  const captionId = useId()
  return (
    <tbody>
      <tr>
        <td colSpan={colSpan} className="px-4 py-10 text-center" aria-labelledby={captionId}>
          <p id={captionId} className="text-[13px] font-medium text-ink">
            {message}
          </p>
          {action && <div className="mt-3">{action}</div>}
        </td>
      </tr>
    </tbody>
  )
}

function Skeleton({ columns = 5, rows = 6 }) {
  const { density, accent } = useTable()
  const rowH = DENSITY[density]?.skeleton ?? DENSITY.comfortable.skeleton
  const tokens = tableTokens(accent)

  return (
    <div className="p-4" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading table…</span>
      <div className={`mb-3 h-8 rounded-md ${tokens.head} animate-pulse`} />
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className={`flex gap-3 rounded-md bg-surface/80 ${rowH} animate-pulse`}
            style={{ opacity: 1 - i * 0.08 }}
          >
            {Array.from({ length: columns }).map((__, j) => (
              <div
                key={j}
                className="my-auto h-3 flex-1 rounded bg-line/80"
                style={{ maxWidth: j === 0 ? '28%' : undefined }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function Message({ tone = 'muted', children, className = '' }) {
  const toneClass =
    tone === 'danger' ? 'text-danger-700' : tone === 'warning' ? 'text-warning-700' : 'text-ink-muted'
  return <p className={`p-4 text-sm ${toneClass} ${className}`}>{children}</p>
}

const DataTable = {
  Root,
  Toolbar,
  Scroll,
  Table,
  Head,
  HeadRow,
  Body,
  Foot,
  Row,
  Th,
  Td,
  FooterBar,
  Pagination: TablePagination,
  EmptyBody,
  Skeleton,
  Message,
}

export default DataTable
