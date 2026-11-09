import { useState } from 'react'
import { Link } from 'react-router-dom'
import HomeClientAuthLayout from '../components/auth/HomeClientAuthLayout.jsx'
import PasswordInput from '../components/auth/PasswordInput.jsx'
import Button from '../components/ui/Button.jsx'
import { Field, Input } from '../components/ui/FormControls.jsx'
import { useAuthStore } from '../stores/authStore.js'

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
    </HomeClientAuthLayout>
  )
}
