import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Panel } from '../../components/ui/Panel.jsx'
import SettingsBackLink from '../../components/settings/SettingsBackLink.jsx'
import { apiFetch } from '../../lib/api.js'
import { useAppStore } from '../../stores/appStore.js'
import EmailProviderWorkspace from '../../features/settings/EmailProviderWorkspace.jsx'

export default function EmailProviderDetailPage() {
  const { id } = useParams()
  const pushToast = useAppStore((s) => s.pushToast)
  const [provider, setProvider] = useState(null)

  const load = useCallback(() => {
    return apiFetch(`/api/settings/email-providers/${id}`)
      .then((r) => setProvider(r.provider))
      .catch((e) => pushToast({ tone: 'danger', title: 'Could not load provider', body: e.message }))
  }, [id, pushToast])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="px-6 pb-10 pt-2">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-ink">{provider?.name ?? 'Email provider'}</h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {provider ? `${provider.providerLabel} · ${provider.status}` : 'Loading…'}
          </p>
        </div>
        <SettingsBackLink integration="email" />
      </div>
      <Panel bodyClassName="p-4">
        {provider ? <EmailProviderWorkspace providerId={id} provider={provider} onProviderChange={setProvider} /> : null}
      </Panel>
    </div>
  )
}