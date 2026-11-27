import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button.jsx'
import { computePageWindow } from '../../utils/pageWindow.js'

export default function TablePagination({
  page,
  totalPages,
  total,
  rangeStart,
  rangeEnd,
  onPageChange,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  className = '',
}) {
  const windowInfo = computePageWindow(page, totalPages)
  const prevStart = useRef(windowInfo.start)
  const [animClass, setAnimClass] = useState('')

  useEffect(() => {
    if (windowInfo.start > prevStart.current) {
      setAnimClass('table-page-window--forward')
    } else if (windowInfo.start < prevStart.current) {
      setAnimClass('table-page-window--backward')
    } else {
      setAnimClass('')
    }
    prevStart.current = windowInfo.start
    const t = setTimeout(() => setAnimClass(''), 260)
    return () => clearTimeout(t)
  }, [windowInfo.start])

  if (totalPages <= 1 && total <= (rangeEnd - rangeStart + 1 || 0)) {
    return (
      <div className={`flex flex-wrap items-center justify-end gap-2 ${className}`}>
        <span className="text-ink-muted tabular-nums">
          {total === 0 ? 'No rows' : `${rangeStart}–${rangeEnd} of ${total}`}
        </span>
      </div>
    )
  }

  return (
    <div className={`flex flex-wrap items-center justify-end gap-2 sm:gap-3 ${className}`}>
      <span className="hidden text-ink-muted tabular-nums sm:inline">
        {total === 0 ? 'No rows' : `${rangeStart}–${rangeEnd} of ${total}`}
      </span>
      <nav className="flex items-center gap-0.5" aria-label="Pagination">
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={!hasPrev}
          onClick={onPrev}
          aria-label="Previous page"
        >
          <ChevronLeft size={14} />
        </Button>

        <div className="table-page-viewport" aria-hidden={false}>
          <div className={`table-page-window flex items-center gap-0.5 ${animClass}`}>
            {windowInfo.showLeadingEllipsis && (
              <>
                <PageChip page={1} active={page === 1} onSelect={onPageChange} />
                <Ellipsis />
              </>
            )}
            {windowInfo.pages.map((p) => (
              <PageChip key={p} page={p} active={p === page} onSelect={onPageChange} />
            ))}
            {windowInfo.showTrailingEllipsis && (
              <>
                <Ellipsis />
                <PageChip page={totalPages} active={page === totalPages} onSelect={onPageChange} />
              </>
            )}
          </div>
        </div>

        <Button type="button" size="sm" variant="ghost" disabled={!hasNext} onClick={onNext} aria-label="Next page">
          <ChevronRight size={14} />
        </Button>
      </nav>
    </div>
  )
}

function PageChip({ page, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(page)}
      aria-label={`Page ${page}`}
      aria-current={active ? 'page' : undefined}
      className={[
        'table-page-chip',
        active ? 'table-page-chip--active' : 'table-page-chip--idle',
      ].join(' ')}
    >
      {page}
    </button>
  )
}

function Ellipsis() {
  return <span className="table-page-ellipsis px-0.5 text-ink-subtle select-none">…</span>
}