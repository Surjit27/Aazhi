import { Navigate, Route } from 'react-router-dom'
import {
  CalendarClock,
  Flag,
  History,
  Mail,
  Layers,
  LayoutDashboard,
  Settings,
  Shield,
  UserCog,
  Users,
} from 'lucide-react'
import BackendLayout from '../components/layout/BackendLayout.jsx'
import HomeRedirect from '../components/auth/HomeRedirect.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import ClientPortalPage from '../pages/ClientPortalPage.jsx'
import BackendsPage from '../pages/BackendsPage.jsx'
import BackendsHubOverviewPage from '../pages/BackendsHubOverviewPage.jsx'
import BackendOverviewPage from '../pages/BackendOverviewPage.jsx'
import BackendExplorerPage from '../pages/BackendExplorerPage.jsx'
import WorkflowBuilderPage from '../pages/WorkflowBuilderPage.jsx'
import MockServersPage from '../pages/MockServersPage.jsx'
import EventSchedulerPage from '../pages/EventSchedulerPage.jsx'
import DataInjectionPage from '../pages/DataInjectionPage.jsx'
import ExecutionMonitorPage from '../pages/ExecutionMonitorPage.jsx'
import GitIntegrationPage from '../pages/GitIntegrationPage.jsx'
import AIAssistantPage from '../pages/AIAssistantPage.jsx'
import AdminOverviewPage from '../pages/admin/AdminOverviewPage.jsx'
import AdminRolesPage from '../pages/admin/AdminRolesPage.jsx'
import ClientUserManagementPage from '../pages/admin/ClientUserManagementPage.jsx'
import AdminUserManagementPage from '../pages/admin/AdminUserManagementPage.jsx'
import UserHistoryPage from '../pages/admin/UserHistoryPage.jsx'
import EmailHistoryPage from '../pages/admin/EmailHistoryPage.jsx'
import JobHistoryPage from '../pages/admin/JobHistoryPage.jsx'
import AdminFeatureFlagsPage from '../pages/admin/AdminFeatureFlagsPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

/** Admin portal sidebar (admin.localhost only). */
export const ADMIN_NAV = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/roles', label: 'Roles', icon: Shield },
  { to: '/admin/client-users', label: 'Client user management', icon: Users },
  { to: '/admin/admin-users', label: 'Admin user management', icon: UserCog },
  { to: '/admin/feature-flags', label: 'Feature flags', icon: Flag },
  { to: '/admin/history/users', label: 'User history', icon: History },
  { to: '/admin/history/emails', label: 'Email history', icon: Mail },
  { to: '/admin/history/jobs', label: 'Job history', icon: CalendarClock },
  { to: '/settings', label: 'Settings', icon: Settings },
]

/** Client portal nav — mirrors admin layout (Dashboards → Overview, Access-style section, Pages). */
export const CLIENT_NAV = [
  { to: '/backends/overview', label: 'Overview', icon: LayoutDashboard, end: true, flagKey: 'client.backends', keywords: 'backends dashboard overview' },
  { to: '/backends/registry', label: 'Registry', icon: Layers, flagKey: 'client.backends', keywords: 'registry git services add backend' },
  { to: '/settings', label: 'Settings', icon: Settings, flagKey: 'client.settings', keywords: 'preferences localhost' },
]

/** Items under the collapsible “Backends” section (expand later: events, mocks, git, …). */
export const CLIENT_BACKENDS_ACCESS_NAV = CLIENT_NAV.filter(
  (item) => item.to !== '/backends/overview' && item.to !== '/settings',
)

export function AdminPortalRoutes() {
  return (
    <>
      <Route index element={<HomeRedirect />} />
      <Route path="overview" element={<AdminOverviewPage />} />
      <Route path="roles" element={<AdminRolesPage />} />
      <Route path="admin/client-users" element={<ClientUserManagementPage />} />
      <Route path="admin/admin-users" element={<AdminUserManagementPage />} />
      <Route path="admin/feature-flags" element={<AdminFeatureFlagsPage />} />
      <Route path="admin/history/users" element={<UserHistoryPage />} />
      <Route path="admin/history/emails" element={<EmailHistoryPage />} />
      <Route path="admin/history/jobs" element={<JobHistoryPage />} />
      <Route path="admin/users" element={<Navigate to="/admin/client-users" replace />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="backends" element={<Navigate to="/overview" replace />} />
      <Route path="backends/*" element={<Navigate to="/overview" replace />} />
      <Route path="mocks" element={<Navigate to="/overview" replace />} />
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </>
  )
}

export function ClientPortalRoutes() {
  return (
    <>
      <Route index element={<HomeRedirect />} />
      <Route path="backends" element={<Navigate to="/backends/overview" replace />} />
      <Route path="backends/overview" element={<BackendsHubOverviewPage />} />
      <Route path="backends/registry" element={<BackendsPage />} />
      <Route path="backends/events" element={<EventSchedulerPage />} />
      <Route path="backends/mocks" element={<MockServersPage />} />
      <Route path="backends/injection" element={<DataInjectionPage />} />
      <Route path="backends/monitor" element={<ExecutionMonitorPage />} />
      <Route path="backends/git" element={<GitIntegrationPage />} />
      <Route path="backends/assistant" element={<AIAssistantPage />} />
      <Route path="mocks" element={<Navigate to="/backends/mocks" replace />} />
      <Route path="scheduler" element={<Navigate to="/backends/events" replace />} />
      <Route path="injection" element={<Navigate to="/backends/injection" replace />} />
      <Route path="monitor" element={<Navigate to="/backends/monitor" replace />} />
      <Route path="git" element={<Navigate to="/backends/git" replace />} />
      <Route path="assistant" element={<Navigate to="/backends/assistant" replace />} />
      <Route path="backends/orders" element={<Navigate to="/forbidden" replace />} />
      <Route path="backends/orders/*" element={<Navigate to="/forbidden" replace />} />
      <Route path="backends/:backendId" element={<BackendLayout />}>
        <Route index element={<BackendOverviewPage />} />
        <Route path="explorer" element={<BackendExplorerPage />} />
        <Route path="workflow" element={<WorkflowBuilderPage />} />
      </Route>
      <Route path="account" element={<ClientPortalPage />} />
      <Route path="client" element={<Navigate to="/account" replace />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="overview" element={<Navigate to="/forbidden" replace />} />
      <Route path="roles" element={<Navigate to="/forbidden" replace />} />
      <Route path="admin" element={<Navigate to="/forbidden" replace />} />
      <Route path="admin/*" element={<Navigate to="/forbidden" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </>
  )
}
