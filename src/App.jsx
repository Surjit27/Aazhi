import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout.jsx'
import BackendLayout from './components/layout/BackendLayout.jsx'
import BackendsPage from './pages/BackendsPage.jsx'
import BackendOverviewPage from './pages/BackendOverviewPage.jsx'
import BackendExplorerPage from './pages/BackendExplorerPage.jsx'
import WorkflowBuilderPage from './pages/WorkflowBuilderPage.jsx'
import MockServersPage from './pages/MockServersPage.jsx'
import EventSchedulerPage from './pages/EventSchedulerPage.jsx'
import DataInjectionPage from './pages/DataInjectionPage.jsx'
import ExecutionMonitorPage from './pages/ExecutionMonitorPage.jsx'
import GitIntegrationPage from './pages/GitIntegrationPage.jsx'
import AIAssistantPage from './pages/AIAssistantPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/backends" replace />} />
        <Route path="backends" element={<BackendsPage />} />
        <Route path="backends/:backendId" element={<BackendLayout />}>
          <Route index element={<BackendOverviewPage />} />
          <Route path="explorer" element={<BackendExplorerPage />} />
          <Route path="workflow" element={<WorkflowBuilderPage />} />
        </Route>

        <Route path="overview" element={<Navigate to="/backends/orders" replace />} />
        <Route path="explorer" element={<Navigate to="/backends/orders/explorer" replace />} />
        <Route path="workflow" element={<Navigate to="/backends/orders/workflow" replace />} />

        <Route path="mocks" element={<MockServersPage />} />
        <Route path="scheduler" element={<EventSchedulerPage />} />
        <Route path="injection" element={<DataInjectionPage />} />
        <Route path="monitor" element={<ExecutionMonitorPage />} />
        <Route path="git" element={<GitIntegrationPage />} />
        <Route path="assistant" element={<AIAssistantPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
