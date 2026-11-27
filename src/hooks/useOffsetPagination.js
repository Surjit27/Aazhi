import { useCallback, useMemo, useState } from 'react'

export function useOffsetPagination({ page, setPage, total, pageSize }) {
  const totalPages = useMemo(() => Math.max(1, Math.ceil((total || 0) / pageSize) || 1), [total, pageSize])
  const safePage = Math.min(Math.max(page, 1), totalPages)
  const offset = (safePage - 1) * pageSize
  const rangeStart = total === 0 ? 0 : offset + 1
  const rangeEnd = Math.min(offset + pageSize, total)

  const setPageSafe = useCallback(
    (next) => {
      const value = typeof next === 'function' ? next(safePage) : next
      setPage(Math.min(Math.max(value, 1), totalPages))
    },
    [safePage, setPage, totalPages],
  )

  const goNext = useCallback(() => setPageSafe((p) => Math.min(p + 1, totalPages)), [setPageSafe, totalPages])
  const goPrev = useCallback(() => setPageSafe((p) => Math.max(p - 1, 1)), [setPageSafe])

  return {
    page: safePage,
    totalPages,
    total,
    pageSize,
    offset,
    rangeStart,
    rangeEnd,
    setPage: setPageSafe,
    goNext,
    goPrev,
    hasPrev: safePage > 1,
    hasNext: safePage < totalPages,
  }
}

export function useOffsetPaginationState(total, pageSize = 15) {
  const [page, setPage] = useState(1)
  return useOffsetPagination({ page, setPage, total, pageSize })
}