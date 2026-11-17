import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { PageHeader } from '../../components/ui/Panel.jsx'
import PillTabNav from '../../components/ui/PillTabNav.jsx'
import { brandBreadcrumbs } from '../../lib/breadcrumbs.js'
import { getPortal, PORTAL } from '../../lib/portal.js'

const SETTINGS_TABS = [
  { id: 'email', label: 'Email' },
  { id: 'api', label: 'API model configure' },
]

function resolveTab(pathname) {
  if (pathname.includes('/settings/api')) return 'api'
  return 'email'
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
    navigate(id === 'api' ? '/settings/api' : '/settings/email')
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <PageHeader
        title="Settings"
        description="Email delivery and model API keys."
        breadcrumbs={brandBreadcrumbs('Admin', 'Settings')}
      />
      <div className="border-b border-line px-6 pb-4 pt-2">
        <PillTabNav tabs={SETTINGS_TABS} value={tab} onChange={onTab} ariaLabel="Settings sections" />
      </div>
      <Outlet />
    </div>
  )
}