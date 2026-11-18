import { useEffect, useState } from 'react'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Panel } from '../ui/Panel.jsx'
import Button from '../ui/Button.jsx'
import PasswordInput from '../auth/PasswordInput.jsx'
import Badge from '../ui/Badge.jsx'
import { Field, Input } from '../ui/FormControls.jsx'
import { useAppStore } from '../../stores/appStore.js'
import { useAccountSecurityStore } from '../../stores/accountSecurityStore.js'

export default function TwoFactorPanel() {
  const pushToast = useAppStore((s) => s.pushToast)
  const security = useAccountSecurityStore((s) => s.security)
  const loaded = useAccountSecurityStore((s) => s.loaded)
  const loading = useAccountSecurityStore((s) => s.loading)
  const setup = useAccountSecurityStore((s) => s.setup)
  const fetchSecurity = useAccountSecurityStore((s) => s.fetchSecurity)
  const beginTwoFactorSetup = useAccountSecurityStore((s) => s.beginTwoFactorSetup)
  const enableTwoFactor = useAccountSecurityStore((s) => s.enableTwoFactor)
  const disableTwoFactor = useAccountSecurityStore((s) => s.disableTwoFactor)

  const [enableCode, setEnableCode] = useState('')
  const [disablePassword, setDisablePassword] = useState('')
  const [disableCode, setDisableCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!loaded && !loading) fetchSecurity()
  }, [fetchSecurity, loaded, loading])

  const onBeginSetup = async () => {
    setError(null)
    setBusy(true)
    try {
      await beginTwoFactorSetup(pushToast)
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const onEnable = async (event) => {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await enableTwoFactor(enableCode, pushToast)
      setEnableCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const onDisable = async (event) => {
    event.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await disableTwoFactor({ password: disablePassword, code: disableCode }, pushToast)
      setDisablePassword('')
      setDisableCode('')
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Panel
      title="Two-step authentication"
      description="Authenticator app (TOTP) required at sign-in when enabled."
    >
      <div className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <ShieldCheck size={16} className="text-primary-600" />
          <Badge tone={security.twoFactorEnabled ? 'success' : 'neutral'}>
            {security.twoFactorEnabled ? 'Enabled' : 'Disabled'}
          </Badge>
        </div>
        {error ? <p className="text-xs text-danger-700">{error}</p> : null}

        {!security.twoFactorEnabled ? (
          <>
            {!setup ? (
              <Button type="button" variant="secondary" onClick={onBeginSetup} disabled={busy || loading}>
                {busy ? <Loader2 size={14} className="animate-spin" /> : null}
                Set up authenticator
              </Button>
            ) : (
              <form onSubmit={onEnable} className="grid gap-4">
                <Field label="Setup key" hint="Add this key in Google Authenticator, 1Password, or Authy.">
                  <Input readOnly value={setup.secret} className="font-mono text-xs" />
                </Field>
                <p className="text-xs text-ink-muted break-all">
                  Or open: <span className="font-mono">{setup.otpauthUrl}</span>
                </p>
                <Field label="6-digit code">
                  <Input
                    inputMode="numeric"
                    pattern="\d{6}"
                    maxLength={6}
                    value={enableCode}
                    onChange={(e) => setEnableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                  />
                </Field>
                <div className="flex justify-end">
                  <Button type="submit" disabled={busy}>
                    {busy ? 'Confirming…' : 'Enable two-step auth'}
                  </Button>
                </div>
              </form>
            )}
          </>
        ) : (
          <form onSubmit={onDisable} className="grid gap-4">
            <Field label="Current password">
              <PasswordInput
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </Field>
            <Field label="Authenticator code">
              <Input
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
              />
            </Field>
            <div className="flex justify-end">
              <Button type="submit" variant="secondary" disabled={busy}>
                {busy ? 'Disabling…' : 'Disable two-step auth'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Panel>
  )
}