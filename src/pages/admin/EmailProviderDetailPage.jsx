import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PageHeader, Panel } from '../../components/ui/Panel.jsx'
import { apiFetch } from '../../lib/api.js'
import { brandBreadcrumbs } from '../../lib/breadcrumbs.js'
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
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title={provider?.name ?? 'Email provider'}
        description={provider ? `${provider.providerLabel} · ${provider.status}` : 'Loading…'}
        breadcrumbs={brandBreadcrumbs('Admin', 'Settings', 'Email providers', provider?.name ?? id)}
        actions={
          <Link to="/settings/email-providers" className="text-xs font-medium text-primary-600 hover:underline">
            ← All email providers
          </Link>
        }
      />
      <div className="px-6 pb-10">
        <Panel bodyClassName="p-4">
          {provider ? <EmailProviderWorkspace providerId={id} provider={provider} onProviderChange={setProvider} /> : null}
        </Panel>
      </div>
    </div>
  )
}