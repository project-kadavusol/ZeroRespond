import { useState, useEffect } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useZeroRespond } from '../context/ZeroRespondContext'
import {
  LayoutDashboard,
  Bell,
  Monitor,
  ClipboardList,
  ListChecks,
  PlayCircle,
  FileText,
  ScrollText,
  Settings,
  BookOpenCheck,
  Landmark,
  CircleCheck,
  X,
  AlertTriangle,
  Siren,
  Sun,
  Moon,
  Clock,
} from 'lucide-react'
import { NewIncidentModal } from '../components/modals/NewIncidentModal'
import { EvidenceModal } from '../components/modals/EvidenceModal'
import { AddSystemModal } from '../components/modals/AddSystemModal'
import { DetectionDetailModal } from '../components/modals/DetectionDetailModal'

function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard' || pathname === '/') return 'ZeroDashboard'
  if (pathname === '/alerts') return 'Detection Feed'
  if (pathname === '/monitored') return 'Monitored Systems'
  if (pathname === '/incidents') return 'Incident Cases'
  if (pathname.startsWith('/incidents/')) return 'Current Response'
  if (pathname === '/playbooks') return 'Response Playbooks'
  if (pathname === '/reports') return 'Incident Reports'
  if (pathname === '/audit') return 'Audit Log'
  if (pathname === '/rules') return 'Detection Rules'
  if (pathname === '/rules/editor') return 'Rule Editor'
  if (pathname === '/analysis') return 'Attack Analysis'
  if (pathname === '/metrics') return 'Statistics'
  if (pathname === '/settings') return 'Settings'
  if (pathname === '/integration') return 'API'
  if (pathname === '/guide') return 'User Guide'
  return 'ZeroDashboard'
}

export function MainLayout() {
  const { pathname } = useLocation()
  const {
    incidents,
    systems,
    alerts,
    settings,
    currentCaseId,
    toggleSidebar,
    theme,
    toggleTheme,
    notifs,
    dismissNotif,
  } = useZeroRespond()

  const [timeStr, setTimeStr] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
      const p = (n: number) => String(n).padStart(2, '0')
      setTimeStr(`${p(ist.getHours())}:${p(ist.getMinutes())}:${p(ist.getSeconds())} IST`)
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  // Find most urgent active incident for topbar SLA warning
  const urgentInc = incidents.find(
    i => (i.sev === 'critical' || i.sev === 'high') && i.status !== 'resolved' && i.status !== 'false-positive'
  )

  const [topSlaText, setTopSlaText] = useState('')
  const [topSlaCls, setTopSlaCls] = useState('safe')

  useEffect(() => {
    if (!urgentInc) {
      setTopSlaText('')
      return
    }
    const DEADLINE_MS = 6 * 60 * 60 * 1000
    const parseOpenTime = () => {
      try {
        if (urgentInc.detectedAt) {
          const d = new Date(urgentInc.detectedAt)
          if (!isNaN(d.getTime())) return d
        }
        const clean = urgentInc.openedFull.replace(' IST', '').trim()
        const d = new Date(clean + ' GMT+0530')
        if (!isNaN(d.getTime())) return d
      } catch (e) {}
      return new Date(Date.now() - 3600 * 1000)
    }

    const openedAt = parseOpenTime()
    const tick = () => {
      const elapsed = Date.now() - openedAt.getTime()
      const remaining = DEADLINE_MS - elapsed
      if (remaining <= 0) {
        setTopSlaText(`${urgentInc.id}: SLA Expired`)
        setTopSlaCls('expired')
        return
      }
      const totalSec = Math.floor(remaining / 1000)
      const h = Math.floor(totalSec / 3600)
      const m = Math.floor((totalSec % 3600) / 60)
      const s = totalSec % 60
      const pad = (n: number) => String(n).padStart(2, '0')
      setTopSlaText(`${urgentInc.id} CERT-In: ${pad(h)}:${pad(m)}:${pad(s)}`)
      setTopSlaCls(h >= 3 ? 'safe' : h >= 1 ? 'warn' : 'urgent')
    }
    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [urgentInc])

  const activeIncidentsCount = incidents.filter(
    i => i.status !== 'resolved' && i.status !== 'false-positive'
  ).length

  const pageTitle = getPageTitle(pathname)
  const isCaseDetail = pathname.startsWith('/incidents/')

  return (
    <>
      {/* Topbar */}
      <header id="topbar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            id="sb-toggle"
            onClick={toggleSidebar}
            title="Toggle navigation"
            aria-label="Toggle navigation"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="topbar-brand">
            Zero<span>Respond</span>
          </div>
          <span className="page-title" id="page-title">
            {pageTitle}
          </span>
        </div>
        <div className="topbar-right">
          {topSlaText && urgentInc && (
            <NavLink
              to={`/incidents/${urgentInc.id}`}
              className={`dpdp-timer ${topSlaCls}`}
              style={{ textDecoration: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              title={`Urgent statutory case ${urgentInc.id} (${urgentInc.type}) — Click to respond`}
            >
              <Clock size={12} /> {topSlaText}
            </NavLink>
          )}
          <div className="sys-status">
            <div className="sys-dot" />
            System Active
          </div>
          <span id="live-time">{timeStr}</span>
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode (Default)' : 'Switch to Dark Mode'}
            aria-label="Toggle light or dark theme"
          >
            {theme === 'dark' ? <Sun size={13} color="#f59e0b" /> : <Moon size={13} />}
            <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
          </button>
          <div className="user-av">IT</div>
        </div>
      </header>

      {/* Sidebar */}
      <nav id="sidebar">
        <div className="sb-logo">
          <div className="sb-logo-text">
            Zero<span>Respond</span>
          </div>
          <div className="sb-logo-sub">Incident Response Platform</div>
        </div>

        <div className="sb-nav">
          <div className="sb-section-label">Monitor</div>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <LayoutDashboard size={16} />
            </span>
            Dashboard
          </NavLink>

          <NavLink
            to="/alerts"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <Bell size={16} />
            </span>
            Detection Feed
            <span className="nav-badge" id="al-badge">
              {alerts.length}
            </span>
          </NavLink>

          <NavLink
            to="/monitored"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <Monitor size={16} />
            </span>
            Monitored Systems
            <span className="nav-badge blue" id="sys-badge">
              {systems.length}
            </span>
          </NavLink>

          <div className="sb-section-label">Respond</div>
          <NavLink
            to="/incidents"
            end
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <ClipboardList size={16} />
            </span>
            Incident Cases
            <span className="nav-badge blue" id="inc-badge">
              {activeIncidentsCount}
            </span>
          </NavLink>

          <NavLink
            to="/playbooks"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <ListChecks size={16} />
            </span>
            Playbooks
          </NavLink>

          {isCaseDetail && (
            <NavLink
              to={`/incidents/${currentCaseId || 'IR-08'}`}
              className="nav-item active"
            >
              <span className="nav-icon">
                <PlayCircle size={16} />
              </span>
              Current Response
            </NavLink>
          )}

          <div className="sb-section-label">Report</div>
          <NavLink
            to="/reports"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <FileText size={16} />
            </span>
            Incident Reports
          </NavLink>

          <NavLink
            to="/audit"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <ScrollText size={16} />
            </span>
            Audit Log
          </NavLink>

          <div className="sb-section-label">System</div>
          <NavLink
            to="/settings"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <Settings size={16} />
            </span>
            Settings
          </NavLink>

          <div className="sb-section-label">Help &amp; Training</div>
          <NavLink
            to="/guide"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">
              <BookOpenCheck size={16} />
            </span>
            User Guide
          </NavLink>
        </div>

        <div className="sb-footer">
          <div className="sb-org" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Landmark size={14} /> {settings.orgName}
          </div>
          <div className="sb-compliance" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CircleCheck size={14} /> DPDP Act / CERT-In reporting support
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="content">
        <Outlet />
      </main>

      {/* Notifications Toast Area */}
      <div id="notif-area">
        {notifs.map(n => {
          const borderClr =
            { critical: '#dc2626', high: '#d97706', medium: '#b45309', low: '#2563eb' }[n.sev] ||
            '#2563eb'
          return (
            <div key={n.id} className="notif" style={{ borderLeftColor: borderClr }}>
              <div style={{ fontSize: '18px', flexShrink: 0 }}>
                {n.sev === 'critical' ? (
                  <Siren size={20} color="#dc2626" />
                ) : n.sev === 'high' ? (
                  <AlertTriangle size={20} color="#d97706" />
                ) : (
                  <CircleCheck size={20} color="#16a34a" />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div className="notif-title">{n.title}</div>
                <div className="notif-body-text">{n.body}</div>
              </div>
              <button
                className="notif-close"
                onClick={() => dismissNotif(n.id)}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Global Modals */}
      <NewIncidentModal />
      <EvidenceModal />
      <AddSystemModal />
      <DetectionDetailModal />
    </>
  )
}
