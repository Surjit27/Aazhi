import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, setStoredToken } from '../lib/api.js'
import { useAuthStore } from '../stores/authStore.js'

/** One-time code from the admin tab (URL hash is not sent to the API server). */
export default function ImpersonateSessionPage() {
  const navigate = useNavigate()
  const applySession = useAuthStore((s) => s.applySession)
  const [message, setMessage] = useState('Opening client session…')

  useEffect(() => {
    const code = window.location.hash.replace(/^#/, '')
    window.history.replaceState(null, '', window.location.pathname)
    if (!code) {
      setMessage('Missing impersonation code. Start again from the admin console.')
      return
    }
    let cancelled = false
    apiFetch('/api/auth/impersonate/exchange', { method: 'POST', body: { code }, auth: false })
      .then(({ token, user }) => {
        if (cancelled) return
        setStoredToken(token)
        applySession(token, user)
        navigate('/mocks', { replace: true })
      })
      .catch((err) => {
        if (!cancelled) setMessage(err.message || 'Could not open the client session')
      })
    return () => {
      cancelled = true
    }
  }, [applySession, navigate])

  return (
    <div className="flex min-h-full items-center justify-center bg-surface p-6 text-sm text-ink-muted">{message}</div>
  )
}
