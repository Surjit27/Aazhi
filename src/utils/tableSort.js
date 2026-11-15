function normalizeSortValue(value) {
  if (value == null) return ''
  if (value instanceof Date) return value.getTime()
  if (typeof value === 'number') return value
  if (typeof value === 'boolean') return value ? 1 : 0
  return String(value).toLowerCase()
}

function compareValues(a, b) {
  const av = normalizeSortValue(a)
  const bv = normalizeSortValue(b)
  if (av === bv) return 0
  if (typeof av === 'number' && typeof bv === 'number') return av - bv
  return av < bv ? -1 : 1
}

/**
 * @param {unknown[]} rows
 * @param {Record<string, (row: unknown) => unknown>} accessors
 * @param {string|null|undefined} sortKey
 * @param {'asc'|'desc'|undefined|null} direction
 */
export function sortRows(rows, accessors, sortKey, direction) {
  if (!sortKey || !direction || !accessors[sortKey]) return rows
  const accessor = accessors[sortKey]
  const mul = direction === 'asc' ? 1 : -1
  return [...rows].sort((a, b) => mul * compareValues(accessor(a), accessor(b)))
}

export function nextSortDirection(currentKey, currentDirection, nextKey) {
  if (currentKey !== nextKey) return 'asc'
  if (currentDirection === 'asc') return 'desc'
  if (currentDirection === 'desc') return undefined
  return 'asc'
}