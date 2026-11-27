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
import {
  AUTH_BUTTON_CLASS,
  AUTH_ERROR_CLASS,
  AUTH_FIELDS_CLASS,
  AUTH_FORM_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_SUBMIT_WRAP_CLASS,
} from '../components/auth/authFormStyles.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const login = useAuthStore((s) => s.login)
  const completeTwoFactor = useAuthStore((s) => s.completeTwoFactor)
  const clearTwoFactorPending = useAuthStore((s) => s.clearTwoFactorPending)
  const twoFactorPending = useAuthStore((s) => s.twoFactorPending)
  const user = useAuthStore((s) => s.user)
  const loading = useAuthStore((s) => s.loading)
  const error = useAuthStore((s) => s.error)
  const surface = getPortal()
  const isAdminHost = surface === PORTAL.ADMIN

  const [email, setEmail] = useState(isAdminHost ? 'admin@aazhi.local' : '')
  const [password, setPassword] = useState(isAdminHost ? 'Admin123!' : '')
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const finishLogin = (loggedIn) => {
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
  }

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
      if (loggedIn?.twoFactorRequired) return
      finishLogin(loggedIn)
    } catch {
      /* store holds error */
    } finally {
      setSubmitting(false)
    }
  }

  const onVerifyOtp = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const loggedIn = await completeTwoFactor(otp)
      finishLogin(loggedIn)
    } catch {
      /* store holds error */
    } finally {
      setSubmitting(false)
    }
  }

  const titleUser = twoFactorPending?.user

  return (
    <PortalAuthLayout portal={isAdminHost ? 'admin' : 'client'} mode="login">
      {twoFactorPending ? (
        <form className={AUTH_FORM_CLASS} onSubmit={onVerifyOtp}>
          <div className={AUTH_FIELDS_CLASS}>
            <p className="text-sm text-ink-muted">
              Two-step authentication for <span className="font-medium text-ink">{titleUser?.email}</span>
            </p>
            <Field label="6-digit code">
              <Input
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                className={AUTH_INPUT_CLASS}
                autoComplete="one-time-code"
              />
            </Field>
          </div>
          {error && <p className={AUTH_ERROR_CLASS}>{error}</p>}
          <div className={`home-reveal-stagger ${AUTH_SUBMIT_WRAP_CLASS}`}>
            <Button type="submit" variant="primary" disabled={submitting} className={AUTH_BUTTON_CLASS}>
              {submitting ? 'Verifying…' : 'Verify and sign in'}
            </Button>
            <button
              type="button"
              className="mt-3 w-full cursor-pointer text-center text-xs text-ink-muted hover:text-ink"
              onClick={() => {
                clearTwoFactorPending()
                setOtp('')
              }}
            >
              Back to password sign-in
            </button>
          </div>
        </form>
      ) : (
        <form className={AUTH_FORM_CLASS} onSubmit={onSubmit}>
          <div className={AUTH_FIELDS_CLASS}>
            <div className="home-reveal-stagger" style={{ '--stagger': 0 }}>
              <Field label="Email">
                <Input
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={AUTH_INPUT_CLASS}
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
                  className={AUTH_INPUT_CLASS}
                />
              </Field>
            </div>
          </div>
          {error && <p className={AUTH_ERROR_CLASS}>{error}</p>}
          <div className={`home-reveal-stagger ${AUTH_SUBMIT_WRAP_CLASS}`} style={{ '--stagger': 2 }}>
            <Button type="submit" variant="primary" disabled={submitting} className={AUTH_BUTTON_CLASS}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </div>
        </form>
      )}
    </PortalAuthLayout>
  )
}