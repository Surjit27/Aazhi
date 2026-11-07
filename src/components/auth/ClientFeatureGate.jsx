import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getPortal, PORTAL } from '../../lib/portal.js'
import { CLIENT_NAV } from '../../routes/index.jsx'
import { useFeatureFlagsStore } from '../../stores/featureFlagsStore.js'

export default function ClientFeatureGate() {
  const pathname = useLocation().pathname
  const loaded = useFeatureFlagsStore((s) => s.loaded)
  const isNavEnabled = useFeatureFlagsStore((s) => s.isNavEnabled)
  const firstEnabledClientPath = useFeatureFlagsStore((s) => s.firstEnabledClientPath)

  if (getPortal() !== PORTAL.CLIENT) {
    return <Outlet />
  }

  if (!loaded) return <Outlet />

  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/login' || path === '/session' || path === '/forbidden') {
    return <Outlet />
  }

  const nav = CLIENT_NAV.find((item) => path === item.to || path.startsWith(`${item.to}/`))
  if (nav && !isNavEnabled(nav.to, nav.flagKey)) {
    return <Navigate to={firstEnabledClientPath(CLIENT_NAV)} replace />
  }

  return <Outlet />
}
