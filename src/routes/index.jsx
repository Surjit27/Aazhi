import { Navigate, Route } from 'react-router-dom'
import { CalendarClock, History, Mail, LayoutDashboard, Settings, Shield, UserCog, Users } from 'lucide-react'
import {
  CLIENT_NAV,
  CLIENT_ACCESS_NAV,
  CLIENT_DEEP_BACKEND_NAV,
  CLIENT_HISTORY_NAV,
  CLIENT_PAGES_NAV,
} from './clientNav.js'
import BackendLayout from '../components/layout/BackendLayout.jsx'
import HomeRedirect from '../components/auth/HomeRedirect.jsx'
import SettingsPage from '../pages/SettingsPage.jsx'
import EmailProvidersPage from '../pages/admin/EmailProvidersPage.jsx'
import EmailProviderDetailPage from '../pages/admin/EmailProviderDetailPage.jsx'
import ApiTokenProvidersPage from '../pages/admin/ApiTokenProvidersPage.jsx'
import ApiTokenProviderDetailPage from '../pages/admin/ApiTokenProviderDetailPage.jsx'
import ClientPortalPage from '../pages/ClientPortalPage.jsx'
import BackendsPage from '../pages/BackendsPage.jsx'
import BackendOverviewPage from '../pages/BackendOverviewPage.jsx'
import BackendExplorerPage from '../pages/BackendExplorerPage.jsx'
import WorkflowBuilderPage from '../pages/WorkflowBuilderPage.jsx'
import MockServersPage from '../pages/MockServersPage.jsx'
import EventSchedulerPage from '../pages/EventSchedulerPage.jsx'
import DataInjectionPage from '../pages/DataInjectionPage.jsx'
import ExecutionMonitorPage from '../pages/ExecutionMonitorPage.jsx'
import AIAssistantPage from '../pages/AIAssistantPage.jsx'
import AdminOverviewPage from '../pages/admin/AdminOverviewPage.jsx'
import AdminRolesPage from '../pages/admin/AdminRolesPage.jsx'
import ClientUserManagementPage from '../pages/admin/ClientUserManagementPage.jsx'
import AdminUserManagementPage from '../pages/admin/AdminUserManagementPage.jsx'
import UserHistoryPage from '../pages/admin/UserHistoryPage.jsx'
import EmailHistoryPage from '../pages/admin/EmailHistoryPage.jsx'
import JobHistoryPage from '../pages/admin/JobHistoryPage.jsx'
import ClientAccessPage from '../pages/client/ClientAccessPage.jsx'
import ClientAccessRolesPage from '../pages/client/ClientAccessRolesPage.jsx'
import ClientAccessUsersPage from '../pages/client/ClientAccessUsersPage.jsx'
import ClientGitHubConnectPage from '../pages/client/ClientGitHubConnectPage.jsx'
import CloudIntegrationsPage from '../pages/client/CloudIntegrationsPage.jsx'
import PagerPage from '../pages/deep/PagerPage.jsx'
import ClientUserHistoryPage from '../pages/client/ClientUserHistoryPage.jsx'
import ClientEmailHistoryPage from '../pages/client/ClientEmailHistoryPage.jsx'
import ClientJobHistoryPage from '../pages/client/ClientJobHistoryPage.jsx'
import DashboardPage from '../pages/deep/DashboardPage.jsx'
import ProjectsPage from '../pages/deep/ProjectsPage.jsx'
import DeepBackendExplorerPage from '../pages/deep/BackendExplorerPage.jsx'
import DeepEventSchedulerPage from '../pages/deep/DeepEventSchedulerPage.jsx'
import FlowStudioPage from '../pages/deep/FlowStudioPage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'

export { CLIENT_NAV, CLIENT_ACCESS_NAV, CLIENT_DEEP_BACKEND_NAV, CLIENT_HISTORY_NAV, CLIENT_PAGES_NAV }

/** Admin portal sidebar (admin.localhost only). */
export const ADMIN_NAV = [
  { to: '/overview', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/roles', label: 'Roles', icon: Shield },
  { to: '/admin/client-users', label: 'Client user management', icon: Users },
  { to: '/admin/admin-users', label: 'Admin user management', icon: UserCog },
  { to: '/admin/history/users', label: 'User history', icon: History },
  { to: '/admin/history/emails', label: 'Email history', icon: Mail },
  { to: '/admin/history/jobs', label: 'Job history', icon: CalendarClock },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function AdminPortalRoutes() {
  return (
    <>
      <Route index element={<HomeRedirect />} />
      <Route path="overview" element={<AdminOverviewPage />} />
      <Route path="roles" element={<AdminRolesPage />} />
      <Route path="admin/client-users" element={<ClientUserManagementPage />} />
      <Route path="admin/admin-users" element={<AdminUserManagementPage />} />
      <Route path="admin/feature-flags" element={<Navigate to="/overview" replace />} />
      <Route path="admin/history/users" element={<UserHistoryPage />} />
      <Route path="admin/history/emails" element={<EmailHistoryPage />} />
      <Route path="admin/history/jobs" element={<JobHistoryPage />} />
      <Route path="admin/users" element={<Navigate to="/admin/client-users" replace />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="settings/email-providers" element={<EmailProvidersPage />} />
      <Route path="settings/email-providers/:id" element={<EmailProviderDetailPage />} />
      <Route path="settings/api-tokens" element={<ApiTokenProvidersPage />} />
      <Route path="settings/api-tokens/:id" element={<ApiTokenProviderDetailPage />} />
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
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="projects" element={<ProjectsPage />} />
      <Route path="deep/explorer" element={<DeepBackendExplorerPage />} />
      <Route path="deep/explorer/:projectId" element={<DeepBackendExplorerPage />} />
      <Route path="deep/pager" element={<PagerPage />} />
      <Route path="deep/pager/:projectId" element={<PagerPage />} />
      <Route path="deep/scheduler" element={<DeepEventSchedulerPage />} />
      <Route path="deep/flow-studio" element={<FlowStudioPage />} />
      <Route path="deep/orchestration" element={<Navigate to="/deep/scheduler" replace />} />
      <Route path="deep/executions" element={<Navigate to="/deep/scheduler" replace />} />
      <Route path="backends" element={<Navigate to="/dashboard" replace />} />
      <Route path="backends/overview" element={<Navigate to="/dashboard" replace />} />
      <Route path="backends/registry" element={<BackendsPage />} />
      <Route path="backends/events" element={<EventSchedulerPage />} />
      <Route path="backends/mocks" element={<MockServersPage />} />
      <Route path="backends/injection" element={<DataInjectionPage />} />
      <Route path="backends/monitor" element={<ExecutionMonitorPage />} />
      <Route path="integrations/github" element={<ClientGitHubConnectPage />} />
      <Route path="integrations/cloud" element={<CloudIntegrationsPage />} />
      <Route path="backends/git" element={<Navigate to="/integrations/github" replace />} />
      <Route path="backends/assistant" element={<AIAssistantPage />} />
      <Route path="mocks" element={<Navigate to="/backends/mocks" replace />} />
      <Route path="scheduler" element={<Navigate to="/jobs" replace />} />
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
      <Route path="access/roles" element={<ClientAccessRolesPage />} />
      <Route path="access/users" element={<ClientAccessUsersPage />} />
      <Route path="roles" element={<Navigate to="/access/roles" replace />} />
      <Route path="admin/client-users" element={<Navigate to="/access/users" replace />} />
      <Route path="admin/admin-users" element={<Navigate to="/forbidden" replace />} />
      <Route path="admin/feature-flags" element={<Navigate to="/forbidden" replace />} />
      <Route path="jobs" element={<EventSchedulerPage />} />
      <Route path="access" element={<ClientAccessPage />} />
      <Route path="history/users" element={<ClientUserHistoryPage />} />
      <Route path="history/emails" element={<ClientEmailHistoryPage />} />
      <Route path="history/jobs" element={<ClientJobHistoryPage />} />
      <Route path="account" element={<ClientPortalPage />} />
      <Route path="client" element={<Navigate to="/account" replace />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="overview" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </>
  )
}
