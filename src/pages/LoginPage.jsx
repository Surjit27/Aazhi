import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import Button from '../components/ui/Button.jsx'
import { BRAND_NAME, BrandLockup } from '../components/ui/Brand.jsx'
import { Field, Input } from '../components/ui/FormControls.jsx'
import {
  adminAppOrigin,
  clientAppOrigin,
  getPortal,
  homePathForPortal,
  homePathForRole,
  PORTAL,
  portalForUser,
  redirectToAdmin,
  redirectToClient,
} from '../lib/portal.js'
import { useAuthStore } from '../stores/authStore.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const surface = getPortal()
  const isAdminHost = surface === PORTAL.ADMIN

  const [email, setEmail] = useState(isAdminHost ? 'admin@aazhi.local' : '')
  const [password, setPassword] = useState(isAdminHost ? 'Admin123!' : '')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) {
    if (portalForUser(user) === 'admin' && !isAdminHost) {
      redirectToAdmin(homePathForRole('admin'))
      return null
    }
    if (portalForUser(user) === 'client' && isAdminHost) {
      redirectToClient(homePathForRole('client'))
      return null
    }
    return <Navigate to={homePathForPortal(portalForUser(user))} replace />
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const loggedIn = await login(email, password)
      if (portalForUser(loggedIn) === 'admin' && !isAdminHost) {
        redirectToAdmin(homePathForRole('admin'))
        return
      }
      if (portalForUser(loggedIn) === 'client' && isAdminHost) {
        redirectToClient(homePathForRole('client'))
        return
      }
      const from = location.state?.from
      if (from && typeof from === 'string') {
        navigate(from, { replace: true })
        return
      }
      navigate(homePathForPortal(portalForUser(loggedIn)), { replace: true })
    } catch {
      /* store holds error */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-app-canvas p-6">
      <div className="glass-card w-full max-w-md p-8 shadow-pop">
        <div className="mb-6 space-y-3">
          <BrandLockup className="h-10" />
          <p className="text-xs text-ink-muted">
            {isAdminHost ? 'Admin console' : 'Client portal'} · <span className="font-mono">{window.location.host}</span>
          </p>
          <p className="sr-only">{BRAND_NAME} sign in</p>
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
              This sign-in is only for <strong>admin</strong> accounts on{' '}
              <span className="font-mono">{adminAppOrigin()}</span>. Client users use{' '}
              <span className="font-mono">{clientAppOrigin()}/login</span> in a separate session (different hostname).
            </>
          ) : (
            <>
              This sign-in is only for <strong>client</strong> accounts on{' '}
              <span className="font-mono">{clientAppOrigin()}</span>. Staff admin access is a separate app at{' '}
              <span className="font-mono">admin.localhost</span> — not linked from here after you sign in.
            </>
          )}
        </p>
      </div>
    </div>
  )
}
