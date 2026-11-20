import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api.js'

function historyErrorMessage(err) {
  if (err.status === 404) {
    return 'History API is not on this server yet. Run the API from feature/audit-log-instrumentation (or merge backend PR #7–#8) and apply migrations.'
  }
  return err.message || 'Could not load history'
}

export function useHistoryEvents(apiPath) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchEvents = useCallback((path, { isCancelled = () => false } = {}) => {
    setLoading(true)
    setError(null)
    return apiFetch(path)
      .then((r) => {
        if (isCancelled()) return
        setEvents(r.events ?? [])
      })
      .catch((e) => {
        if (isCancelled()) return
        setEvents([])
        setError(historyErrorMessage(e))
      })
      .finally(() => {
        if (!isCancelled()) setLoading(false)
      })
  }, [])

  const load = useCallback(() => fetchEvents(apiPath), [apiPath, fetchEvents])

  useEffect(() => {
    let cancelled = false
    void fetchEvents(apiPath, { isCancelled: () => cancelled })
    return () => {
      cancelled = true
    }
  }, [apiPath, fetchEvents])

  return { events, loading, error, reload: load }
}