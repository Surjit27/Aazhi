import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import RequireAuth from './components/auth/RequireAuth.jsx'
import RoleGate from './components/auth/RoleGate.jsx'
import HostSurfaceGate, { HostRoleSync } from './components/auth/HostSurfaceGate.jsx'
import HomeRedirect from './components/auth/HomeRedirect.jsx'
import SettingsRoute from './components/auth/SettingsRoute.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import ClientPortalPage from './pages/ClientPortalPage.jsx'
import AdminOverviewPage from './pages/admin/AdminOverviewPage.jsx'
import AdminRolesPage from './pages/admin/AdminRolesPage.jsx'
import ClientUserManagementPage from './pages/admin/ClientUserManagementPage.jsx'
import AdminUserManagementPage from './pages/admin/AdminUserManagementPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<HostRoleSync />}>
          <Route element={<AppLayout />}>
            <Route index element={<HomeRedirect />} />

            <Route element={<HostSurfaceGate surface="client" />}>
              <Route element={<RoleGate allow="client" />}>
                <Route path="client" element={<ClientPortalPage />} />
              </Route>
            </Route>

            <Route element={<HostSurfaceGate surface="admin" />}>
              <Route element={<RoleGate allow="admin" />}>
                <Route path="overview" element={<AdminOverviewPage />} />
                <Route path="roles" element={<AdminRolesPage />} />
                <Route path="admin/client-users" element={<ClientUserManagementPage />} />
                <Route path="admin/admin-users" element={<AdminUserManagementPage />} />
                <Route path="admin/users" element={<Navigate to="/admin/client-users" replace />} />
                <Route path="backends" element={<Navigate to="/overview" replace />} />
                <Route path="backends/*" element={<Navigate to="/overview" replace />} />
              </Route>
            </Route>

            <Route path="settings" element={<SettingsRoute />} />

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  )
}
