import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { getPortal, PORTAL } from '../../lib/portal.js'
import { CLIENT_NAV } from '../../routes/index.jsx'
import { useFeatureFlagsStore } from '../../stores/featureFlagsStore.js'

/** Paths without a CLIENT_NAV row (overview hubs, legacy). */
const CLIENT_ROUTE_ALLOWLIST = new Set(['/access', '/account'])

function resolveClientNav(path) {
  const matches = CLIENT_NAV.filter(
    (item) => path === item.to || (item.to.length > 1 && path.startsWith(`${item.to}/`)),
  )
  matches.sort((a, b) => b.to.length - a.to.length)
  return matches[0]
}

export default function ClientFeatureGate() {
  const pathname = useLocation().pathname
  const loaded = useFeatureFlagsStore((s) => s.loaded)
  const isNavEnabled = useFeatureFlagsStore((s) => s.isNavEnabled)

  if (getPortal() !== PORTAL.CLIENT) {
    return <Outlet />
  }

  if (!loaded) return <Outlet />

  const path = pathname.replace(/\/+$/, '') || '/'
  if (path === '/login' || path === '/session' || path === '/forbidden') {
    return <Outlet />
  }

  if (CLIENT_ROUTE_ALLOWLIST.has(path)) {
    return <Outlet />
  }

  const nav = resolveClientNav(path)
  if (nav && !isNavEnabled(nav.to, nav.flagKey)) {
    const fallback =
      ['/dashboard', '/account', '/projects'].find((p) => {
        const item = CLIENT_NAV.find((n) => n.to === p)
        return item && isNavEnabled(item.to, item.flagKey)
      }) ?? '/account'
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}
