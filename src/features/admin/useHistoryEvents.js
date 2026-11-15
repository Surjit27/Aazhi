import { useCallback, useEffect, useMemo, useState } from 'react'
import { apiFetch } from '../../lib/api.js'
import { useOffsetPagination } from '../../hooks/useOffsetPagination.js'
import { useTableSort } from '../../hooks/useTableSort.js'

const DEFAULT_PAGE_SIZE = 20

function historyErrorMessage(err) {
  if (err.status === 404) {
    return 'History API is not on this server yet. Run the API from feature/audit-log-instrumentation (or merge backend PR #7–#8) and apply migrations.'
  }
  return err.message || 'Could not load history'
}

function buildPath(apiPath, { limit, offset, sortKey, sortDirection }) {
  const params = new URLSearchParams()
  params.set('limit', String(limit))
  params.set('offset', String(offset))
  if (sortKey) params.set('sort', sortKey)
  if (sortDirection) params.set('order', sortDirection)
  const q = params.toString()
  return q ? `${apiPath}?${q}` : apiPath
}

export function useHistoryEvents(apiPath, { pageSize = DEFAULT_PAGE_SIZE } = {}) {
  const [events, setEvents] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const { sortKey, sortDirection, thProps } = useTableSort({ key: 'occurredAt', direction: 'desc' })

  const pagination = useOffsetPagination({ page, setPage, total, pageSize })

  const requestPath = useMemo(
    () =>
      buildPath(apiPath, {
        limit: pageSize,
        offset: pagination.offset,
        sortKey,
        sortDirection,
      }),
    [apiPath, pageSize, pagination.offset, sortKey, sortDirection],
  )

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    return apiFetch(requestPath)
      .then((r) => {
        setEvents(r.events ?? [])
        setTotal(typeof r.total === 'number' ? r.total : (r.events ?? []).length)
      })
      .catch((e) => {
        setEvents([])
        setTotal(0)
        setError(historyErrorMessage(e))
      })
      .finally(() => setLoading(false))
  }, [requestPath])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    apiFetch(requestPath)
      .then((r) => {
        if (cancelled) return
        setEvents(r.events ?? [])
        setTotal(typeof r.total === 'number' ? r.total : (r.events ?? []).length)
      })
      .catch((e) => {
        if (cancelled) return
        setEvents([])
        setTotal(0)
        setError(historyErrorMessage(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [requestPath])

  useEffect(() => {
    setPage(1)
  }, [sortKey, sortDirection, apiPath])

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

  return {
    events,
    loading,
    error,
    reload: load,
    total,
    pagination: paginationProps,
    sort: { sortKey, sortDirection, thProps },
  }
}