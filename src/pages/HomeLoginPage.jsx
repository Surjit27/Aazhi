import { useState } from 'react'
import { Link } from 'react-router-dom'
import HomeClientAuthLayout from '../components/auth/HomeClientAuthLayout.jsx'
import PasswordInput from '../components/auth/PasswordInput.jsx'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/FormControls.jsx'
import { useAuthStore } from '../stores/authStore.js'
import {
  AUTH_BUTTON_CLASS,
  AUTH_ERROR_CLASS,
  AUTH_FIELDS_CLASS,
  AUTH_FORM_CLASS,
  AUTH_INPUT_CLASS,
  AUTH_SUBMIT_WRAP_CLASS,
} from '../components/auth/authFormStyles.js'

export default function HomeLoginPage() {
  const login = useAuthStore((s) => s.login)
  const error = useAuthStore((s) => s.error)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await login(email, password)
    } catch {
      /* store error */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <HomeClientAuthLayout
      mode="login"
      alternate={
        <>
          New here?{' '}
          <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
            Sign up for free
          </Link>
        </>
      }
    >
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
    </HomeClientAuthLayout>
  )
}
