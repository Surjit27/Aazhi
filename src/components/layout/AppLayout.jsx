import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import TopBar from './TopBar.jsx'
import Toaster from '../ui/Toaster.jsx'

export default function AppLayout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex h-full min-h-0 bg-surface">
      {mobileNavOpen && (
        <div className="fixed inset-0 z-20 bg-ink/20 md:hidden" onClick={() => setMobileNavOpen(false)} />
      )}
      <Sidebar open={mobileNavOpen} onNavigate={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onToggleNav={() => setMobileNavOpen((o) => !o)} />
        <main className="flex min-h-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
      <Toaster />
    </div>
  )
}
