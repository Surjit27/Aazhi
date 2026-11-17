import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiFetch, setStoredToken } from '../lib/api.js'
import { useAuthStore } from '../stores/authStore.js'

const PENDING_IMPERSONATION_KEY = 'aazhi_impersonate_pending'

/** Dedupe exchange across React Strict Mode double-mount (codes are single-use on the server). */
const exchangeByCode = new Map()
const settledByCode = new Map()

function readImpersonationCode() {
  const rawHash = window.location.hash.replace(/^#/, '').trim()
  let code = rawHash
  if (rawHash) {
    try {
      code = decodeURIComponent(rawHash)
    } catch {
      code = rawHash
    }
  }
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
  const appliedRef = useRef(false)

  useEffect(() => {
    const code = readImpersonationCode()
    if (!code) {
      setMessage('Missing impersonation code. Start again from the admin console.')
      return
    }

    const finish = (data) => {
      if (appliedRef.current) return
      appliedRef.current = true
      setStoredToken(data.token, { isolated: true })
      applySession(data.token, data.user)
      navigate('/dashboard', { replace: true })
    }

    const cached = settledByCode.get(code)
    if (cached) {
      finish(cached)
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
          settledByCode.set(code, data)
          sessionStorage.removeItem(PENDING_IMPERSONATION_KEY)
          return data
        })
        .catch((err) => {
          exchangeByCode.delete(code)
          sessionStorage.removeItem(PENDING_IMPERSONATION_KEY)
          throw err
        })
      exchangeByCode.set(code, promise)
    }

    promise
      .then(finish)
      .catch((err) => {
        setMessage(err.message || 'Could not open the client session')
      })
  }, [applySession, navigate])

  return (
    <div className="flex min-h-full items-center justify-center bg-surface p-6 text-sm text-ink-muted">{message}</div>
  )
}