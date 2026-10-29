import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useZeroRespond } from '../context/ZeroRespondContext'
import {
  TriangleAlert,
  CircleCheck,
  CircleX,
  Zap,
  Plus,
  ClipboardList,
  X,
} from 'lucide-react'

export function MonitoredSystemsPage() {
  const navigate = useNavigate()
  const { systems, incidents, openModal, removeSystem, showNotif, setCurrentCaseId, wazuhStatus } = useZeroRespond()

  const [lastSync, setLastSync] = useState('')

  useEffect(() => {
    const updateSync = () => {
      const now = new Date()
      const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }))
      setLastSync(ist.toLocaleTimeString('en-IN') + ' IST')
    }
    updateSync()
    const timer = setInterval(updateSync, 5000)
    return () => clearInterval(timer)
  }, [])

  const onlineCount = systems.filter(s => s.status === 'online').length
  const offlineCount = systems.filter(s => s.status === 'offline').length

  const handleOpenCase = (caseId: string) => {
    setCurrentCaseId(caseId)
    navigate(`/incidents/${caseId}`)
  }

  const handleViewLogs = (host: string) => {
    showNotif(
      `Logs — ${host}`,
      'Streaming live Wazuh agent telemetry for this host.',
      'low'
    )
  }

  const handleRemove = (host: string) => {
    if (confirm(`Remove ${host} from monitoring? Wazuh will stop collecting logs from this system.`)) {
      removeSystem(host)
    }
  }

  return (
    <div id="view-monitored" className="view" style={{ display: 'block' }}>
      <div className="page-hd">
        <h1>Monitored Systems</h1>
        <p>Every system ZeroRespond watches in real time through the Wazuh detection engine. Logs are collected continuously.</p>
      </div>

      <div
        className={`wazuh-status-bar ${wazuhStatus.connected ? 'connected' : 'disconnected'}`}
        style={{
          background: wazuhStatus.connected ? 'var(--c-low-bg)' : 'rgba(239, 68, 68, 0.08)',
          borderColor: wazuhStatus.connected ? 'var(--c-low-border)' : '#f87171',
        }}
      >
        <div className="wazuh-info">
          <span style={{ fontSize: '16px' }}>
            {wazuhStatus.connected ? (
              <CircleCheck size={20} color="var(--c-low)" />
            ) : (
              <TriangleAlert size={20} color="#dc2626" />
            )}
          </span>
          <div>
            <div style={{ fontWeight: 600, color: wazuhStatus.connected ? 'var(--text-1)' : '#dc2626' }}>
              {wazuhStatus.connected
                ? `Wazuh SIEM Active — Manager ${wazuhStatus.manager?.version || 'v4.14'} Online`
                : 'Wazuh Manager Disconnected'}
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-2)' }}>
              {wazuhStatus.connected
                ? `Connected to ${wazuhStatus.url}. ${systems.length} endpoints monitored with real-time log ingestion.`
                : wazuhStatus.error || 'Cannot reach Wazuh API. Check API configuration under Settings.'}
            </div>
          </div>
        </div>
        <span className="last-sync" id="last-sync-time">
          Last checked: {wazuhStatus.lastChecked || lastSync}
        </span>
      </div>

      <div className="sys-status-row">
        <div className="sys-stat-card">
          <div className="sys-stat-icon sys-stat-online">
            <CircleCheck size={20} color="#16a34a" />
          </div>
          <div>
            <div className="sys-stat-val sys-online" id="sys-online-count">
              {onlineCount}
            </div>
            <div className="sys-stat-lbl">Systems online</div>
          </div>
        </div>

        <div className="sys-stat-card">
          <div className="sys-stat-icon sys-stat-offline">
            <CircleX size={20} color="#dc2626" />
          </div>
          <div>
            <div className="sys-stat-val sys-offline" id="sys-offline-count">
              {offlineCount}
            </div>
            <div className="sys-stat-lbl">Systems offline</div>
          </div>
        </div>

        <div className="sys-stat-card">
          <div className="sys-stat-icon">
            <Zap size={20} color="var(--accent)" />
          </div>
          <div>
            <div className="sys-stat-val" id="sys-alerts-today">
              18
            </div>
            <div className="sys-stat-lbl">Alerts generated today</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hd">
          <span className="card-title">All Monitored Systems</span>
          <button className="btn btn-primary btn-sm" onClick={() => openModal('addSystem')}>
            <Plus size={14} /> Add System
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table id="systems-table">
            <thead>
              <tr>
                <th>Hostname / IP</th>
                <th>System Type</th>
                <th>Operating System</th>
                <th>Department</th>
                <th>Status</th>
                <th>Last Log</th>
                <th>Alerts Today</th>
                <th>Active Cases</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="systems-tbody">
              {systems.map(s => {
                const activeCases = incidents.filter(
                  i => i.computer === s.host && i.status !== 'resolved' && i.status !== 'false-positive'
                )

                return (
                  <tr key={s.host}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-brand)', fontSize: '13.5px' }}>
                        {s.host}
                      </strong>
                    </td>
                    <td>
                      <span className={`sys-type-badge ${s.type}`}>{s.typeLbl}</span>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--text-2)' }}>{s.os}</td>
                    <td style={{ fontSize: '12.5px', color: 'var(--text-3)' }}>{s.dept}</td>
                    <td>
                      <span className={`sys-status-pill ${s.status}`}>
                        {s.status === 'online' ? (
                          <CircleCheck size={12} />
                        ) : s.status === 'warning' ? (
                          <TriangleAlert size={12} />
                        ) : (
                          <CircleX size={12} />
                        )}
                        {s.status === 'online' ? 'Online' : s.status === 'warning' ? 'Warning' : 'Offline'}
                      </span>
                    </td>
                    <td>
                      <span className="last-log-time">{s.lastLog}s ago</span>
                    </td>
                    <td>
                      <span
                        className={`alerts-today-cell ${
                          s.alertsToday === 0
                            ? 'clean'
                            : s.alertMax === 'critical'
                            ? 'has-critical'
                            : 'has-high'
                        }`}
                      >
                        {s.alertsToday === 0 ? 'None' : `${s.alertsToday} (${s.alertMax})`}
                      </span>
                    </td>
                    <td>
                      {activeCases.length ? (
                        activeCases.map(i => (
                          <span
                            key={i.id}
                            onClick={() => handleOpenCase(i.id)}
                            style={{
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: `var(--c-${i.sev === 'critical' ? 'critical' : i.sev === 'high' ? 'high' : 'medium'})`,
                              background: `var(--c-${i.sev === 'critical' ? 'critical' : i.sev === 'high' ? 'high' : 'medium'}-bg)`,
                              padding: '2px 8px',
                              borderRadius: '10px',
                              border: `1px solid var(--c-${i.sev === 'critical' ? 'critical' : i.sev === 'high' ? 'high' : 'medium'}-border)`,
                              marginRight: '4px',
                            }}
                            title={`Open case ${i.id}`}
                          >
                            <ClipboardList size={12} /> {i.id}
                          </span>
                        ))
                      ) : (
                        <span style={{ fontSize: '12.5px', color: 'var(--text-3)' }}>None</span>
                      )}
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleViewLogs(s.host)}
                        style={{ padding: '4px 8px' }}
                      >
                        <ClipboardList size={13} /> Logs
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleRemove(s.host)}
                        style={{ padding: '4px 8px', marginLeft: '4px' }}
                      >
                        <X size={13} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
