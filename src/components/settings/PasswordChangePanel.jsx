import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Panel } from '../ui/Panel.jsx'
import Button from '../ui/Button.jsx'
import PasswordInput from '../auth/PasswordInput.jsx'
import { Field } from '../ui/FormControls.jsx'
import { useAppStore } from '../../stores/appStore.js'
import { useAccountSecurityStore } from '../../stores/accountSecurityStore.js'

export default function PasswordChangePanel() {
  const pushToast = useAppStore((s) => s.pushToast)
  const changePassword = useAccountSecurityStore((s) => s.changePassword)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (event) => {
    event.preventDefault()
    setError(null)
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match')
      return
    }
    setSubmitting(true)
    try {
      await changePassword({ currentPassword, newPassword }, pushToast)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Panel title="Password" description="Change your sign-in password. Requires your current password.">
      <form onSubmit={onSubmit} className="grid gap-4 p-5">
        {error ? <p className="text-xs text-danger-700">{error}</p> : null}
        <Field label="Current password">
          <PasswordInput
            autoComplete="current-password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
        </Field>
        <Field label="New password" hint="At least 8 characters.">
          <PasswordInput
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={8}
          />
        </Field>
        <Field label="Confirm new password">
          <PasswordInput
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            minLength={8}
          />
        </Field>
        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Updating…
              </>
            ) : (
              'Update password'
            )}
          </Button>
        </div>
      </form>
    </Panel>
  )
}