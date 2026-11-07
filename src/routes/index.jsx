import { Navigate, Route } from 'react-router-dom'
import {
  Activity,
  Calendar,
  CalendarClock,
  Flag,
  GitBranch,
  History,
  Mail,
  Layers,
  LayoutDashboard,
  Server,
  Settings,
  Shield,
  Sparkles,
  Upload,
  UserCog,
  Users,
} from 'lucide-react'
import BackendLayout from '../components/layout/BackendLayout.jsx'
import HomeRedirect from '../components/auth/HomeRedirect.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import ClientPortalPage from '../pages/ClientPortalPage.jsx'
import BackendsPage from '../pages/BackendsPage.jsx'
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

/** Client portal. Home is Mock servers. Orders service and admin screens are blocked. */
export const CLIENT_NAV = [
  { to: '/mocks', label: 'Mock servers', icon: Server, end: true, flagKey: 'client.mocks', keywords: 'mock mocks localhost' },
  { to: '/scheduler', label: 'Event scheduler', icon: Calendar, flagKey: 'client.scheduler', keywords: 'schedule jobs localhost' },
  { to: '/injection', label: 'Data injection', icon: Upload, flagKey: 'client.injection', keywords: 'inject localhost' },
  { to: '/monitor', label: 'Execution monitor', icon: Activity, flagKey: 'client.monitor', keywords: 'runs localhost' },
  { to: '/git', label: 'Git integration', icon: GitBranch, flagKey: 'client.git', keywords: 'repository localhost' },
  { to: '/assistant', label: 'AI assistant', icon: Sparkles, flagKey: 'client.assistant', keywords: 'chat localhost' },
  { to: '/backends/auth', label: 'auth-gateway', icon: Layers, flagKey: 'client.backends', keywords: 'auth gateway sessions sso' },
  { to: '/account', label: 'Account', icon: LayoutDashboard, flagKey: 'client.account', keywords: 'profile localhost' },
  { to: '/settings', label: 'Settings', icon: Settings, flagKey: 'client.settings', keywords: 'preferences localhost' },
]

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
      <Route path="backends" element={<Navigate to="/backends/auth" replace />} />
      <Route path="backends/registry" element={<BackendsPage />} />
      <Route path="backends/orders" element={<Navigate to="/forbidden" replace />} />
      <Route path="backends/orders/*" element={<Navigate to="/forbidden" replace />} />
      <Route path="backends/:backendId" element={<BackendLayout />}>
        <Route index element={<BackendOverviewPage />} />
        <Route path="explorer" element={<BackendExplorerPage />} />
        <Route path="workflow" element={<WorkflowBuilderPage />} />
      </Route>
      <Route path="mocks" element={<MockServersPage />} />
      <Route path="scheduler" element={<EventSchedulerPage />} />
      <Route path="injection" element={<DataInjectionPage />} />
      <Route path="monitor" element={<ExecutionMonitorPage />} />
      <Route path="git" element={<GitIntegrationPage />} />
      <Route path="assistant" element={<AIAssistantPage />} />
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
