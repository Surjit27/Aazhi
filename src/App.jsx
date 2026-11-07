import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import RequireAuth from './components/auth/RequireAuth.jsx'
import { HostRoleSync } from './components/auth/HostSurfaceGate.jsx'
import PortalGate from './components/auth/PortalGate.jsx'
import ClientFeatureGate from './components/auth/ClientFeatureGate.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ForbiddenPage from './pages/ForbiddenPage.jsx'
import ImpersonateSessionPage from './pages/ImpersonateSessionPage.jsx'
import { getPortal, PORTAL } from './lib/portal.js'
import { AdminPortalRoutes, ClientPortalRoutes } from './routes/index.jsx'

/**
 * One build; hostname picks portal (see lib/portal.js).
 * Public: /login · Protected: portal-specific routes + /forbidden
 */
export default function App() {
  const portal = getPortal()
  const isAdminPortal = portal === PORTAL.ADMIN

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/session" element={<ImpersonateSessionPage />} />

      <Route element={<RequireAuth />}>
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route element={<HostRoleSync />}>
          <Route element={<PortalGate />}>
            <Route element={<ClientFeatureGate />}>
            <Route element={<AppLayout />}>
              {isAdminPortal ? AdminPortalRoutes() : ClientPortalRoutes()}
            </Route>
            </Route>
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
