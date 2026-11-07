import { useState } from 'react'
import { Link } from 'react-router-dom'
import HomeClientAuthLayout from '../components/auth/HomeClientAuthLayout.jsx'
import PasswordInput from '../components/auth/PasswordInput.jsx'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/FormControls.jsx'
import { useAuthStore } from '../stores/authStore.js'

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
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <div className="home-reveal-stagger" style={{ '--stagger': 0 }}>
          <Field label="Display name" hint="Optional">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} autoComplete="name" />
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
            />
          </Field>
        </div>
        {error && <p className="text-xs text-danger-700">{error}</p>}
        <div className="home-reveal-stagger pt-1" style={{ '--stagger': 3 }}>
          <Button type="submit" variant="primary" disabled={submitting} className="w-full justify-center">
            {submitting ? 'Creating account…' : 'Sign up for free'}
          </Button>
        </div>
      </form>
    </HomeClientAuthLayout>
  )
}
