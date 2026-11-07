import { useState } from 'react'
import { Link } from 'react-router-dom'
import HomeClientAuthLayout from '../components/auth/HomeClientAuthLayout.jsx'
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
      title="Sign in"
      subtitle="Access the client workspace for reverse engineering, workflows, triggers, and run monitoring."
      alternate={
        <>
          New here?{' '}
          <Link to="/signup" className="font-medium text-primary-600 hover:text-primary-700">
            Create a client account
          </Link>
        </>
      }
    >
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
    </HomeClientAuthLayout>
  )
}
