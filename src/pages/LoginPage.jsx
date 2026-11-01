import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Database } from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/FormControls.jsx'
import {
  adminAppOrigin,
  clientAppOrigin,
  getAppSurface,
  homePathForRole,
  redirectToAdmin,
  redirectToClient,
} from '../lib/appHost.js'
import { useAuthStore } from '../stores/authStore.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const surface = getAppSurface()
  const isAdminHost = surface === 'admin'

  const [email, setEmail] = useState(isAdminHost ? 'admin@aazhi.local' : '')
  const [password, setPassword] = useState(isAdminHost ? 'Admin123!' : '')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    if (user.role === 'admin' && !isAdminHost) {
      redirectToAdmin(homePathForRole('admin'))
      return null
    }
    if (user.role === 'client' && isAdminHost) {
      redirectToClient(homePathForRole('client'))
      return null
    }
    return <Navigate to={homePathForRole(user.role)} replace />
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const loggedIn = await login(email, password)
      if (loggedIn.role === 'admin' && !isAdminHost) {
        redirectToAdmin(homePathForRole('admin'))
        return
      }
      if (loggedIn.role === 'client' && isAdminHost) {
        redirectToClient(homePathForRole('client'))
        return
      }
      const from = location.state?.from
      if (from && typeof from === 'string') {
        navigate(from, { replace: true })
        return
      }
      navigate(homePathForRole(loggedIn.role), { replace: true })
    } catch {
      /* store holds error */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-surface p-6">
      <div className="w-full max-w-md rounded-xl border border-line bg-white p-8 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Database size={20} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-ink">Preflight AI</h1>
            <p className="text-xs text-ink-muted">
              {isAdminHost ? 'Admin console' : 'Client portal'} ·{' '}
              <span className="font-mono">{window.location.host}</span>
            </p>
          </div>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <Field label="Email">
            <Input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </Field>
          <Field label="Password">
            <Input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Field>
          {error && <p className="text-xs text-danger-700">{error}</p>}
          <Button type="submit" variant="primary" disabled={submitting} className="w-full justify-center">
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="mt-4 text-[11px] leading-relaxed text-ink-subtle">
          {isAdminHost ? (
            <>
              Admin URL: <span className="font-mono">{adminAppOrigin()}</span> · Client URL:{' '}
              <a className="text-primary-700 hover:underline" href={`${clientAppOrigin()}/login`}>
                {clientAppOrigin()}/login
              </a>
            </>
          ) : (
            <>
              Client URL: <span className="font-mono">{clientAppOrigin()}</span> · Admin URL:{' '}
              <a className="text-primary-700 hover:underline" href={`${adminAppOrigin()}/login`}>
                {adminAppOrigin()}/login
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  )
}
