import { Navigate, Route, Routes } from 'react-router-dom'
import { ZeroRespondProvider } from './context/ZeroRespondContext'
import { MainLayout } from './layouts/MainLayout'
import { DashboardPage } from './pages/DashboardPage'
import { AlertsPage } from './pages/AlertsPage'
import { MonitoredSystemsPage } from './pages/MonitoredSystemsPage'
import { IncidentsPage } from './pages/IncidentsPage'
import { IncidentDetailPage } from './pages/IncidentDetailPage'
import { PlaybooksPage } from './pages/PlaybooksPage'
import { ReportsPage } from './pages/ReportsPage'
import { AuditLogPage } from './pages/AuditLogPage'
import { DetectionRulesPage } from './pages/DetectionRulesPage'
import { RuleEditorPage } from './pages/RuleEditorPage'
import { SettingsPage } from './pages/SettingsPage'
import { ApiIntegrationPage } from './pages/ApiIntegrationPage'
import { UserGuidePage } from './pages/UserGuidePage'

export default function App() {
  return (
    <ZeroRespondProvider>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/monitored" element={<MonitoredSystemsPage />} />
          <Route path="/incidents" element={<IncidentsPage />} />
          <Route path="/incidents/:id" element={<IncidentDetailPage />} />
          <Route path="/playbooks" element={<PlaybooksPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/audit" element={<AuditLogPage />} />
          <Route path="/rules" element={<DetectionRulesPage />} />
          <Route path="/rules/editor" element={<RuleEditorPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/integration" element={<ApiIntegrationPage />} />
          <Route path="/guide" element={<UserGuidePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ZeroRespondProvider>
  )
}
