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

  const load = useCallback(() => {
    setLoading(true)
    setError(null)
    return apiFetch(apiPath)
      .then((r) => {
        setEvents(r.events ?? [])
      })
      .catch((e) => {
        setEvents([])
        setError(historyErrorMessage(e))
      })
      .finally(() => setLoading(false))
  }, [apiPath])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    apiFetch(apiPath)
      .then((r) => {
        if (cancelled) return
        setEvents(r.events ?? [])
      })
      .catch((e) => {
        if (cancelled) return
        setEvents([])
        setError(historyErrorMessage(e))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [apiPath])

  return { events, loading, error, reload: load }
}
