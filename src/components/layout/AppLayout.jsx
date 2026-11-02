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
    <div className="flex h-full min-h-0 bg-surface">
      {mobileNavOpen && (
        <div className="fixed inset-0 z-20 bg-ink/20 md:hidden" onClick={() => setMobileNavOpen(false)} />
      )}
      <Sidebar open={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        {impersonation && (
          <div className="border-b border-line bg-warning-50 px-4 py-2 text-xs text-ink">
            Viewing the client portal as <span className="font-medium">{email}</span>. This session expires in 2 hours.
            Sign out when finished. The admin console stays in the other tab.
          </div>
        )}
        <TopBar onToggleNav={() => setMobileNavOpen((o) => !o)} />
        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}
