export function formatDuration(ms) {
  if (ms == null) return '-'
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

export function formatDateTime(iso) {
  return new Date(iso).toLocaleString([], {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDay(iso) {
  return new Date(iso).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

export function relativeTime(iso, now) {
  const diff = Math.round((now - new Date(iso).getTime()) / 60000)
  if (diff < 1) return 'just now'
  if (diff < 60) return `${diff} min ago`
  if (diff < 1440) return `${Math.round(diff / 60)} h ago`
  return `${Math.round(diff / 1440)} d ago`
}

export function methodTone(method) {
  switch (method) {
    case 'GET':
      return 'primary'
    case 'POST':
      return 'success'
    case 'PUT':
    case 'PATCH':
      return 'warning'
    case 'DELETE':
      return 'danger'
    default:
      return 'neutral'
  }
}

export function statusCodeTone(code) {
  if (code >= 500) return 'danger'
  if (code >= 400) return 'warning'
  if (code >= 200 && code < 300) return 'success'
  return 'neutral'
}

export function uid(prefix) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`
}
