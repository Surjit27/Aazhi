import { useEffect, useMemo, useState } from 'react'
import { useOffsetPagination } from './useOffsetPagination.js'
import { useTableSort } from './useTableSort.js'
import { sortRows } from '../utils/tableSort.js'

/**
 * Client-side sort + offset pagination for in-memory row sets.
 * @param {unknown[]} items
 * @param {{ pageSize?: number, accessors?: Record<string, (row: unknown) => unknown>, defaultSort?: { key: string, direction: 'asc'|'desc' }, resetKey?: unknown }} [options]
 */
export function useClientTable(items, options = {}) {
  const { pageSize = 15, accessors = {}, defaultSort = null, resetKey } = options
  const [page, setPage] = useState(1)
  const { sortKey, sortDirection, toggleSort, setSort, thProps } = useTableSort(defaultSort)

  const sorted = useMemo(
    () => sortRows(items, accessors, sortKey, sortDirection),
    [items, accessors, sortKey, sortDirection],
  )
  const total = sorted.length
  const pagination = useOffsetPagination({ page, setPage, total, pageSize })
  const rows = useMemo(
    () => sorted.slice(pagination.offset, pagination.offset + pageSize),
    [sorted, pagination.offset, pageSize],
  )

  useEffect(() => {
    setPage(1)
  }, [resetKey, items.length])

  return {
    rows,
    sorted,
    total,
    pagination,
    sortKey,
    sortDirection,
    toggleSort,
    setSort,
    thProps,
  }
}