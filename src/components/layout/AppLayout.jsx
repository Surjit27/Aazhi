import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import Toaster from '../ui/Toaster.jsx'
import { useAuthStore } from '../../stores/authStore.js'
import { getPortal, isClientBlockedPath, PORTAL } from '../../lib/portal.js'

export default function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const impersonation = useAuthStore((s) => s.user?.impersonation)
  const email = useAuthStore((s) => s.user?.email)
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
        {impersonation && (
          <div className="glass-bar border-b border-warning-700/15 bg-warning-50/90 px-4 py-2.5 text-xs leading-relaxed text-ink">
            <span className="font-medium text-warning-700">Impersonation ·</span> Viewing as{' '}
            <span className="font-medium">{email}</span>. Session expires in 2 hours — sign out when finished.
          </div>
        )}
        <TopBar onToggleNav={() => setMobileNavOpen((o) => !o)} />
        <main className="bg-app-canvas flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}
