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

export default function HomeSignUpPage() {
  const signUp = useAuthStore((s) => s.signUp)
  const error = useAuthStore((s) => s.error)
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await signUp({ email, password, displayName: displayName.trim() || undefined })
    } catch {
      /* store error */
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <HomeClientAuthLayout
      mode="signup"
      alternate={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
            Sign in
          </Link>
        </>
      }
    >
      <form className={AUTH_FORM_CLASS} onSubmit={onSubmit}>
        <div className={AUTH_FIELDS_CLASS}>
        <div className="home-reveal-stagger" style={{ '--stagger': 0 }}>
          <Field label="Display name" hint="Optional">
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
              className={AUTH_INPUT_CLASS}
            />
          </Field>
        </div>
        <div className="home-reveal-stagger" style={{ '--stagger': 1 }}>
          <Field label="Email">
            <Input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={AUTH_INPUT_CLASS}
            />
          </Field>
        </div>
        <div className="home-reveal-stagger" style={{ '--stagger': 2 }}>
          <Field label="Password" hint="Min. 8 characters">
            <PasswordInput
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className={AUTH_INPUT_CLASS}
            />
          </Field>
        </div>
        </div>
        {error && <p className={AUTH_ERROR_CLASS}>{error}</p>}
        <div className={`home-reveal-stagger ${AUTH_SUBMIT_WRAP_CLASS}`} style={{ '--stagger': 3 }}>
          <Button type="submit" variant="primary" disabled={submitting} className={AUTH_BUTTON_CLASS}>
            {submitting ? 'Creating account…' : 'Sign up for free'}
          </Button>
        </div>
      </form>
    </HomeClientAuthLayout>
  )
}
