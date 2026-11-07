import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api.js'
import { useAppStore } from '../../stores/appStore.js'

export function useHistoryEvents(apiPath) {
  const pushToast = useAppStore((s) => s.pushToast)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    return apiFetch(apiPath)
      .then((r) => setEvents(r.events ?? []))
      .catch((e) => pushToast({ tone: 'danger', title: 'Could not load history', body: e.message }))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [apiPath])

  return { events, loading, reload: load }
}
