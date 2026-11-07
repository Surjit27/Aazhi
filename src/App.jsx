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
import HomePage from './pages/HomePage.jsx'
import HomeLoginPage from './pages/HomeLoginPage.jsx'
import HomeSignUpPage from './pages/HomeSignUpPage.jsx'
import { redirectBareLocalhostToClient } from './lib/appHost.js'
import { getPortal, PORTAL } from './lib/portal.js'
import { AdminPortalRoutes, ClientPortalRoutes } from './routes/index.jsx'

/**
 * One build; hostname picks portal (see lib/portal.js).
 * Public: home.localhost · client.localhost · admin.localhost
 */
export default function App() {
  if (redirectBareLocalhostToClient()) return null

  const portal = getPortal()
  const isAdminPortal = portal === PORTAL.ADMIN

  if (portal === PORTAL.HOME) {
    return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<HomeLoginPage />} />
        <Route path="/signup" element={<HomeSignUpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    )
  }

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
