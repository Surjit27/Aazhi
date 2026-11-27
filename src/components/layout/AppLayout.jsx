import { Suspense, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import Toaster from '../ui/Toaster.jsx'
import RouteLoadingFallback from '../ui/RouteLoadingFallback.jsx'
import { getPortal, isClientBlockedPath, PORTAL } from '../../lib/portal.js'

export default function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  if (getPortal() === PORTAL.CLIENT && isClientBlockedPath(location.pathname)) {
    return <Navigate to="/forbidden" replace />
  }

  return (
    <div className="flex h-full min-h-0 bg-app-canvas">
      {mobileNavOpen && (
        <div className="fixed inset-0 z-20 bg-ink/20 md:hidden" onClick={() => setMobileNavOpen(false)} />
      )}
      <Sidebar open={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onToggleNav={() => setMobileNavOpen((o) => !o)} />
        <main className="bg-app-canvas flex min-h-0 flex-1 flex-col">
          <Suspense fallback={<RouteLoadingFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <Toaster />
    </div>
  )
}
