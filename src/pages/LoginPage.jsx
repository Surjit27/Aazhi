import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import PortalAuthLayout from '../components/auth/PortalAuthLayout.jsx'
import PasswordInput from '../components/auth/PasswordInput.jsx'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/FormControls.jsx'
import {
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
    <PortalAuthLayout portal={isAdminHost ? 'admin' : 'client'} mode="login">
      <form className="flex flex-col gap-4 md:gap-5" onSubmit={onSubmit}>
        <div className="home-reveal-stagger" style={{ '--stagger': 0 }}>
          <Field label="Email">
            <Input
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="py-2.5 text-sm"
            />
          </Field>
        </div>
        <div className="home-reveal-stagger" style={{ '--stagger': 1 }}>
          <Field label="Password">
            <PasswordInput
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="py-2.5 text-sm"
            />
          </Field>
        </div>
        {error && <p className="text-xs text-danger-700 md:text-sm">{error}</p>}
        <div className="home-reveal-stagger pt-1" style={{ '--stagger': 2 }}>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
            className="w-full justify-center py-2.5 text-sm md:text-[15px]"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </Button>
        </div>
      </form>
    </PortalAuthLayout>
  )
}
