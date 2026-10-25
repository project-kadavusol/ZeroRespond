import { useNavigate } from 'react-router-dom'
import { useZeroRespond } from '../context/ZeroRespondContext'
import {
  ArrowUpRight,
  ArrowRight,
  CircleCheck,
  CircleX,
  TriangleAlert,
  Lock,
  KeyRound,
  ArrowUp,
  Folder,
} from 'lucide-react'

export function DashboardPage() {
  const navigate = useNavigate()
  const { incidents, systems, alerts, setCurrentCaseId } = useZeroRespond()

  const activeIncidents = incidents.filter(
    i => i.status !== 'resolved' && i.status !== 'false-positive'
  )
  const criticalCount = activeIncidents.filter(i => i.sev === 'critical').length

  const handleOpenCase = (id: string) => {
    setCurrentCaseId(id)
    navigate(`/incidents/${id}`)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Ransomware':
        return <Lock size={15} style={{ display: 'inline-block', marginRight: '4px' }} />
      case 'Brute Force':
        return <KeyRound size={15} style={{ display: 'inline-block', marginRight: '4px' }} />
      case 'Privilege Escalation':
        return <ArrowUp size={15} style={{ display: 'inline-block', marginRight: '4px' }} />
      case 'File Integrity':
        return <Folder size={15} style={{ display: 'inline-block', marginRight: '4px' }} />
      default:
        return <TriangleAlert size={15} style={{ display: 'inline-block', marginRight: '4px' }} />
    }
  }

  const sevColors: Record<string, string> = {
    critical: '#dc2626',
    high: '#d97706',
    medium: '#b45309',
    low: '#16a34a',
  }

  const heatmapLevels = [
    0, 1, 0, 2, 1, 0, 1, 2, 3, 1, 0, 2, 1, 0, 1, 0, 2, 1, 3, 2, 1, 0, 1, 2, 1,
    1, 2, 4, 1, 0, 2, 1, 0, 1, 2,
  ]

  const onlineSystems = systems.filter(s => s.status === 'online').length
  const offlineSystems = systems.filter(s => s.status === 'offline').length

  return (
    <div id="view-dashboard" className="view" style={{ display: 'block' }}>
      <div className="page-hd">
        <h1>ZeroDashboard</h1>
        <p>Current security activity and response workload across the four supported detection types.</p>
      </div>

      <div className="workflow-summary">
        <div
          className="workflow-card"
          onClick={() => navigate('/incidents')}
          style={{ cursor: 'pointer' }}
        >
          <div className="workflow-card-label">Active incidents</div>
          <div className="workflow-card-value" id="dash-open-count">
            {activeIncidents.length}
          </div>
          <div className="workflow-card-meta">
            Cases requiring response <ArrowUpRight size={14} style={{ display: 'inline-block' }} />
          </div>
        </div>

        <div
          className="workflow-card"
          onClick={() => navigate('/incidents')}
          style={{ cursor: 'pointer' }}
        >
          <div className="workflow-card-label">Critical incidents</div>
          <div className="workflow-card-value" id="dash-critical-count">
            {criticalCount}
          </div>
          <div className="workflow-card-meta">
            Immediate attention <ArrowUpRight size={14} style={{ display: 'inline-block' }} />
          </div>
        </div>

        <div className="workflow-card">
          <div className="workflow-card-label">Mean time to detect</div>
          <div className="workflow-card-value">4.2 min</div>
          <div className="workflow-card-meta">Current reporting period</div>
        </div>

        <div className="workflow-card">
          <div className="workflow-card-label">Mean time to respond</div>
          <div className="workflow-card-value">22 min</div>
          <div className="workflow-card-meta">Detection to containment</div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="workflow-strip">
          <div className="workflow-step active" onClick={() => navigate('/alerts')}>
            <div className="workflow-step-num">1</div>
            <div className="workflow-step-title">Detect</div>
            <div className="workflow-step-desc">Wazuh detection feed</div>
          </div>
          <div className="workflow-step" onClick={() => navigate('/incidents')}>
            <div className="workflow-step-num">2</div>
            <div className="workflow-step-title">Case</div>
            <div className="workflow-step-desc">Incident record</div>
          </div>
          <div className="workflow-step" onClick={() => navigate('/playbooks')}>
            <div className="workflow-step-num">3</div>
            <div className="workflow-step-title">Respond</div>
            <div className="workflow-step-desc">Guided playbook</div>
          </div>
          <div className="workflow-step" onClick={() => navigate('/incidents')}>
            <div className="workflow-step-num">4</div>
            <div className="workflow-step-title">Resolve</div>
            <div className="workflow-step-desc">Contain and close</div>
          </div>
          <div className="workflow-step" onClick={() => navigate('/reports')}>
            <div className="workflow-step-num">5</div>
            <div className="workflow-step-title">Report</div>
            <div className="workflow-step-desc">Incident report</div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <div className="dashboard-section-hd">
          <div>
            <div className="dashboard-section-title">Active incidents</div>
            <div className="dashboard-section-sub">
              Cases currently requiring investigation, containment, or resolution
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/incidents')}>
            View all <ArrowRight size={13} style={{ display: 'inline-block', marginLeft: '2px' }} />
          </button>
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="incident-list" id="dash-incident-list">
            {activeIncidents.length > 0 ? (
              activeIncidents.slice(0, 5).map(inc => (
                <div
                  key={inc.id}
                  className="incident-list-row"
                  onClick={() => handleOpenCase(inc.id)}
                >
                  <div>
                    <div className="incident-list-label">Case</div>
                    <div className="incident-list-value" style={{ fontFamily: 'var(--font-brand)' }}>
                      {inc.id}
                    </div>
                  </div>
                  <div className="incident-list-main">
                    <div className="incident-list-title" style={{ display: 'flex', alignItems: 'center' }}>
                      {getTypeIcon(inc.type)} {inc.type}
                    </div>
                    <div className="incident-list-meta">
                      {inc.computer} · Opened {inc.openedFull}
                    </div>
                  </div>
                  <div>
                    <div className="incident-list-label">Severity</div>
                    <div className="incident-priority">
                      <span className={`badge ${inc.sev}`}>
                        <span className="bdot" />
                        {inc.sevLbl}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="incident-list-label">Progress</div>
                    <div className="incident-list-value">
                      {inc.curStep}/7 steps
                    </div>
                  </div>
                  <div>
                    <div className="incident-list-label">Status</div>
                    <div className="incident-list-value">{inc.statusLbl}</div>
                  </div>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>
                No active incidents.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dash-grid">
        <div className="card">
          <div className="card-hd">
            <span className="card-title">Recent detections</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/alerts')}>
              Open feed <ArrowRight size={13} style={{ display: 'inline-block', marginLeft: '2px' }} />
            </button>
          </div>
          <div id="mini-feed">
            {alerts.length > 0 ? (
              alerts.slice(0, 5).map(a => (
                <div
                  key={a.id}
                  className="mini-al"
                  onClick={() => navigate('/alerts')}
                  style={{ cursor: 'pointer' }}
                >
                  <div
                    className="mini-al-dot"
                    style={{ background: sevColors[a.sev] || '#0891b2' }}
                  />
                  <div className="mini-al-text">
                    <div className="mini-al-name">{a.name}</div>
                    <div className="mini-al-host">
                      {a.computer} · <span style={{ color: 'var(--text-3)' }}>Rule {a.ruleId}</span>
                    </div>
                  </div>
                  <span className="mini-al-time">{a.time.split(' ')[0]}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
                No recent detections.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-hd">
            <span className="card-title">Monitored systems</span>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/monitored')}>
              View systems <ArrowRight size={13} style={{ display: 'inline-block', marginLeft: '2px' }} />
            </button>
          </div>
          <div className="case-kv">
            <div className="case-kv-item">
              <div className="case-kv-label">Online</div>
              <div
                className="case-kv-value"
                style={{ color: 'var(--c-low)', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <CircleCheck size={14} /> {onlineSystems} systems
              </div>
            </div>
            <div className="case-kv-item">
              <div className="case-kv-label">Offline</div>
              <div
                className="case-kv-value"
                style={{ color: 'var(--c-critical)', display: 'flex', alignItems: 'center', gap: '5px' }}
              >
                <CircleX size={14} /> {offlineSystems} systems
              </div>
            </div>
            <div className="case-kv-item">
              <div className="case-kv-label">Alerts today</div>
              <div className="case-kv-value">18 events</div>
            </div>
            <div className="case-kv-item">
              <div className="case-kv-label">Wazuh</div>
              <div className="case-kv-value" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <TriangleAlert size={14} color="#d97706" /> Demo mode
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-2)', marginBottom: '8px' }}>
              Incident Activity Heatmap (Last 35 Hours)
            </div>
            <div className="heatmap" id="heatmap" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {heatmapLevels.map((lvl, idx) => (
                <div
                  key={idx}
                  className={`hmap-cell l${lvl}`}
                  title={`${lvl} incident${lvl !== 1 ? 's' : ''}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
