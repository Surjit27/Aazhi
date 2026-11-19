import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/ui/Panel.jsx'
import PillTabNav from '../../components/ui/PillTabNav.jsx'
import { brandBreadcrumbs } from '../../lib/breadcrumbs.js'
import { getPortal, PORTAL } from '../../lib/portal.js'

const SETTINGS_TABS = [
  { id: 'personal', label: 'Personal' },
  { id: 'email', label: 'Email' },
  { id: 'api', label: 'API model configure' },
  { id: 'feature-flags', label: 'Feature flags' },
]

function resolveTab(pathname) {
  if (pathname.includes('/settings/api')) return 'api'
  if (pathname.includes('/settings/email')) return 'email'
  if (pathname.includes('/settings/feature-flags')) return 'feature-flags'
  return 'personal'
}

export default function AdminSettingsLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const pathname = location.pathname
  const tab = resolveTab(pathname)

  if (getPortal() !== PORTAL.ADMIN) {
    return <Outlet />
  }

  const onTab = (id) => {
    if (id === 'api') navigate('/settings/api')
    else if (id === 'email') navigate('/settings/email')
    else if (id === 'feature-flags') navigate('/settings/feature-flags')
    else navigate('/settings/personal')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Settings"
        description="Personal account, email delivery, model keys, and client portal feature flags. Gate feature flags per admin role on the Roles page."
        breadcrumbs={brandBreadcrumbs('Admin', 'Settings')}
      />
      <div className="border-b border-line px-6 pb-4 pt-2">
        <PillTabNav tabs={SETTINGS_TABS} value={tab} onChange={onTab} ariaLabel="Settings sections" />
      </div>
      <Outlet />
    </div>
  )
}