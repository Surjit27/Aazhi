import { useCallback, useState } from 'react'
import { nextSortDirection } from '../utils/tableSort.js'

/**
 * @param {{ key: string, direction: 'asc'|'desc' }|null} [defaultSort]
 */
export function useTableSort(defaultSort = null) {
  const [sortKey, setSortKey] = useState(defaultSort?.key ?? null)
  const [sortDirection, setSortDirection] = useState(defaultSort?.direction ?? null)

  const toggleSort = useCallback(
    (key) => {
      const nextDir = nextSortDirection(sortKey, sortDirection, key)
      if (!nextDir) {
        setSortKey(null)
        setSortDirection(null)
        return
      }
      setSortKey(key)
      setSortDirection(nextDir)
    },
    [sortKey, sortDirection],
  )

  const setSort = useCallback((key, direction) => {
    setSortKey(key)
    setSortDirection(direction)
  }, [])

  const thProps = useCallback(
    (key) => ({
      sortable: true,
      sortDirection: sortKey === key ? sortDirection : undefined,
      onClick: (e) => {
        e?.preventDefault?.()
        toggleSort(key)
      },
    }),
    [sortKey, sortDirection, toggleSort],
  )

  return { sortKey, sortDirection, toggleSort, setSort, thProps }
}