import { Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './layouts/MainLayout'
import { AlertsPage } from './pages/AlertsPage'
import { DashboardPage } from './pages/DashboardPage'
import { IncidentDetailPage } from './pages/IncidentDetailPage'
import { MetricsPage } from './pages/MetricsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/incidents/:id" element={<IncidentDetailPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/metrics" element={<MetricsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
