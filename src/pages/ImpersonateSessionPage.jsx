import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, setStoredToken } from '../lib/api.js'
import { useAuthStore } from '../stores/authStore.js'

const PENDING_IMPERSONATION_KEY = 'aazhi_impersonate_pending'

/** Dedupe exchange + navigate once; survives React Strict Mode double-mount. */
const exchangeByCode = new Map()
const navigatedForCode = new Set()

function readImpersonationCode() {
  let code = window.location.hash.replace(/^#/, '').trim()
  if (!code) {
    code = sessionStorage.getItem(PENDING_IMPERSONATION_KEY) ?? ''
  }
  if (code) {
    sessionStorage.setItem(PENDING_IMPERSONATION_KEY, code)
    if (window.location.hash) {
      const { pathname, search } = window.location
      window.history.replaceState(null, '', `${pathname}${search}`)
    }
  }
  return code
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

    let promise = exchangeByCode.get(code)
    if (!promise) {
      promise = apiFetch('/api/auth/impersonate/exchange', {
        method: 'POST',
        body: { code },
        auth: false,
      })
        .then((data) => {
          sessionStorage.removeItem(PENDING_IMPERSONATION_KEY)
          return data
        })
        .catch((err) => {
          sessionStorage.removeItem(PENDING_IMPERSONATION_KEY)
          throw err
        })
      exchangeByCode.set(code, promise)
    }

    promise
      .then(({ token, user }) => {
        setStoredToken(token, { isolated: true })
        applySession(token, user)
        if (!navigatedForCode.has(code)) {
          navigatedForCode.add(code)
          navigate('/mocks', { replace: true })
        }
      })
      .catch((err) => {
        setMessage(err.message || 'Could not open the client session')
      })
      .finally(() => {
        exchangeByCode.delete(code)
        navigatedForCode.delete(code)
      })
  }, [applySession, navigate])

  return (
    <div className="flex min-h-full items-center justify-center bg-surface p-6 text-sm text-ink-muted">{message}</div>
  )
}
