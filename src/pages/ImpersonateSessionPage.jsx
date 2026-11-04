import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, setStoredToken } from '../lib/api.js'
import { useAuthStore } from '../stores/authStore.js'

/** Survives React strict-mode remounts, which would otherwise wipe the hash before exchange. */
let pendingCode
let exchangePromise

function readImpersonationCode() {
  if (pendingCode === undefined) {
    pendingCode = window.location.hash.replace(/^#/, '')
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
    }
  }
  return pendingCode
}

/** One-time code from the admin tab (URL hash is not sent to the API server). */
export default function ImpersonateSessionPage() {
  const navigate = useNavigate()
  const applySession = useAuthStore((s) => s.applySession)
  const [message, setMessage] = useState('Opening client session…')

  useEffect(() => {
    const code = readImpersonationCode()
    if (!code) {
      setMessage('Missing impersonation code. Start again from the admin console.')
      return
    }
    if (!exchangePromise) {
      exchangePromise = apiFetch('/api/auth/impersonate/exchange', {
        method: 'POST',
        body: { code },
        auth: false,
      })
    }
    let cancelled = false
    exchangePromise
      .then(({ token, user }) => {
        if (cancelled) return
        pendingCode = ''
        exchangePromise = undefined
        setStoredToken(token, { isolated: true })
        applySession(token, user)
        navigate('/mocks', { replace: true })
      })
      .catch((err) => {
        exchangePromise = undefined
        pendingCode = undefined
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
