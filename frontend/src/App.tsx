import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { AlertsPage } from './pages/AlertsPage'
import { DashboardPage } from './pages/DashboardPage'
import { IncidentDetailPage } from './pages/IncidentDetailPage'
import { IncidentsPage } from './pages/IncidentsPage'
import { MetricsPage } from './pages/MetricsPage'
import { PlaybooksPage } from './pages/PlaybooksPage'

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
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
