import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { AlertsPage } from './pages/AlertsPage'
import { DashboardPage } from './pages/DashboardPage'
import { IncidentDetailPage } from './pages/IncidentDetailPage'
import { IncidentsPage } from './pages/IncidentsPage'
import { MetricsPage } from './pages/MetricsPage'
import { PlaybooksPage } from './pages/PlaybooksPage'
import { EvidencePage } from './pages/EvidencePage'
import { ReportsPage } from './pages/ReportsPage'
import { OrgProfilePage } from './pages/OrgProfilePage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/incidents" element={<IncidentsPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/metrics" element={<MetricsPage />} />
        <Route path="/playbooks" element={<PlaybooksPage />} />
        <Route path="/evidence" element={<EvidencePage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/org-profile" element={<OrgProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
