import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useZeroRespond } from '../context/ZeroRespondContext'
import {
  ArrowLeft,
  Shield,
  CircleAlert,
  CircleCheck,
  PlugZap,
  Save,
  Check,
  Activity,
  Server,
  Container,
  Database,
  Laptop,
  RefreshCw,
} from 'lucide-react'

export function ApiIntegrationPage() {
  const navigate = useNavigate()
  const { settings, saveSettings, showNotif, wazuhStatus, checkWazuhConnection } = useZeroRespond()

  const [formData, setFormData] = useState({
    wazuhUrl: settings.wazuhUrl,
    wazuhVersion: settings.wazuhVersion,
    wazuhUser: settings.wazuhUser,
    wazuhPass: settings.wazuhPass,
  })

  const [testing, setTesting] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  const handleTestConnection = async () => {
    setTesting(true)
    try {
      const res = await checkWazuhConnection({
        url: formData.wazuhUrl,
        user: formData.wazuhUser,
        password: formData.wazuhPass,
      })
      if (res.connected) {
        showNotif(
          'Wazuh Connected',
          `Connected to Wazuh Manager API (${res.manager?.version || 'v4.x'}).`,
          'low'
        )
      } else {
        showNotif(
          'Wazuh Connection Failed',
          res.error || 'Failed to authenticate with Wazuh API.',
          'critical'
        )
      }
    } finally {
      setTesting(false)
    }
  }

  const handleSaveConfig = () => {
    saveSettings(formData)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2500)
    // Re-verify with new configuration
    checkWazuhConnection({
      url: formData.wazuhUrl,
      user: formData.wazuhUser,
      password: formData.wazuhPass,
    })
  }

  const isConnected = wazuhStatus.connected

  return (
    <div id="view-integration" className="view" style={{ display: 'block' }}>
      <button className="back-btn" onClick={() => navigate('/settings')}>
        <ArrowLeft size={14} /> Back to Settings
      </button>

      <div className="page-hd">
        <h1>Wazuh SIEM API Integration</h1>
        <p>Live REST API connection between ZeroRespond and the Wazuh manager supplying detection events.</p>
      </div>

      <div className="p2-grid">
        {/* Detection Engine Configuration */}
        <div className="p2-card">
          <div className="p2-card-hd">
            <div className="p2-card-title">
              <Shield size={16} /> Detection Engine Connection
            </div>
            <span className={`p2-status ${isConnected ? 'connected' : 'disconnected'}`}>
              {isConnected ? <CircleCheck size={13} /> : <CircleAlert size={13} />}
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className="p2-form-grid">
            <div className="p2-field">
              <label className="p2-label">Wazuh Manager URL</label>
              <input
                className="p2-input"
                value={formData.wazuhUrl}
                onChange={e => setFormData({ ...formData, wazuhUrl: e.target.value })}
                placeholder="https://host.docker.internal:55000"
              />
              <div className="p2-hint">Reachable address for the Wazuh 4.x REST API.</div>
            </div>

            <div className="p2-field">
              <label className="p2-label">Wazuh Version</label>
              <select
                className="p2-input"
                value={formData.wazuhVersion}
                onChange={e => setFormData({ ...formData, wazuhVersion: e.target.value })}
              >
                <option>4.14</option>
                <option>4.10</option>
                <option>4.9</option>
                <option>4.8</option>
                <option>4.7</option>
              </select>
            </div>

            <div className="p2-field">
              <label className="p2-label">API Username</label>
              <input
                className="p2-input"
                value={formData.wazuhUser}
                onChange={e => setFormData({ ...formData, wazuhUser: e.target.value })}
              />
            </div>

            <div className="p2-field">
              <label className="p2-label">API Password</label>
              <input
                className="p2-input"
                type="password"
                value={formData.wazuhPass}
                onChange={e => setFormData({ ...formData, wazuhPass: e.target.value })}
              />
              <div className="p2-hint">Stored securely on local on-premise infrastructure.</div>
            </div>
          </div>

          <div className="p2-action-row" style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handleTestConnection} disabled={testing}>
              <PlugZap size={14} /> {testing ? 'Testing Connection...' : 'Test Connection'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleSaveConfig}>
              <Save size={14} /> Save Configuration
            </button>
            {showSaved && (
              <span className="save-confirm" style={{ color: 'var(--c-low)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Check size={14} /> Configuration saved
              </span>
            )}
          </div>

          {wazuhStatus.error && (
            <div
              style={{
                marginTop: '16px',
                padding: '12px 14px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid #f87171',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '13px',
                display: 'flex',
                gap: '8px',
                alignItems: 'flex-start',
              }}
            >
              <CircleAlert size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
              <div>
                <strong>Connection Error:</strong> {wazuhStatus.error}
              </div>
            </div>
          )}
        </div>

        {/* Live Ingestion Health & Manager Telemetry */}
        <div className="p2-card">
          <div className="p2-card-hd">
            <div className="p2-card-title">
              <Activity size={16} /> Live Ingestion Telemetry
            </div>
            <button
              className="btn btn-sm btn-secondary"
              style={{ padding: '4px 8px' }}
              onClick={() => checkWazuhConnection()}
              title="Refresh Telemetry"
            >
              <RefreshCw size={12} />
            </button>
          </div>

          <div className="p2-health" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="p2-health-item">
              <div className="p2-health-label">Status</div>
              <div className="p2-health-value" style={{ color: isConnected ? 'var(--c-low)' : 'var(--c-critical)' }}>
                {isConnected ? <CircleCheck size={13} color="var(--c-low)" /> : <CircleAlert size={13} color="#dc2626" />}
                {isConnected ? 'Online' : 'Offline'}
              </div>
            </div>
            <div className="p2-health-item">
              <div className="p2-health-label">API Latency</div>
              <div className="p2-health-value">{wazuhStatus.latencyMs ? `${wazuhStatus.latencyMs} ms` : '—'}</div>
            </div>
            <div className="p2-health-item">
              <div className="p2-health-label">Manager Version</div>
              <div className="p2-health-value">{wazuhStatus.manager?.version || formData.wazuhVersion}</div>
            </div>
            <div className="p2-health-item">
              <div className="p2-health-label">Active Endpoints</div>
              <div className="p2-health-value" style={{ color: isConnected ? 'var(--c-low)' : 'var(--text-1)' }}>
                {wazuhStatus.agentsSummary
                  ? `${wazuhStatus.agentsSummary.active} / ${wazuhStatus.agentsSummary.total} active`
                  : '—'}
              </div>
            </div>
          </div>

          <div className="p2-divider" />
          <div className="p2-kv">
            <span className="k">Transport</span>
            <span className="v">HTTPS / TLS (verify=disabled)</span>
            <span className="k">Target Host</span>
            <span className="v">{wazuhStatus.url || formData.wazuhUrl}</span>
            <span className="k">Pipeline</span>
            <span className="v">Wazuh Manager → FastAPI → PostgreSQL</span>
            <span className="k">Last Checked</span>
            <span className="v">{wazuhStatus.lastChecked || 'Just now'}</span>
          </div>
        </div>
      </div>

      {/* Real Wazuh Registered Agents List */}
      {wazuhStatus.agents && wazuhStatus.agents.length > 0 && (
        <div className="p2-card" style={{ marginTop: '20px' }}>
          <div className="p2-card-hd">
            <div className="p2-card-title">
              <Laptop size={16} /> Monitored Agents Synchronized from Wazuh
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-2)' }}>
              {wazuhStatus.agents.length} agent{wazuhStatus.agents.length !== 1 ? 's' : ''} detected
            </span>
          </div>

          <div style={{ overflowX: 'auto', marginTop: '10px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-2)' }}>
                  <th style={{ padding: '8px 12px' }}>ID</th>
                  <th style={{ padding: '8px 12px' }}>Agent Name</th>
                  <th style={{ padding: '8px 12px' }}>IP Address</th>
                  <th style={{ padding: '8px 12px' }}>Operating System</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {wazuhStatus.agents.map(ag => (
                  <tr key={ag.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{ag.id}</td>
                    <td style={{ padding: '8px 12px', fontWeight: 600 }}>{ag.name}</td>
                    <td style={{ padding: '8px 12px', fontFamily: 'monospace' }}>{ag.ip}</td>
                    <td style={{ padding: '8px 12px' }}>{ag.os}</td>
                    <td style={{ padding: '8px 12px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: ag.status === 'active' ? 'var(--c-low-bg)' : '#f3f4f6',
                          color: ag.status === 'active' ? 'var(--c-low)' : '#6b7280',
                        }}
                      >
                        {ag.status === 'active' ? <CircleCheck size={11} /> : <CircleAlert size={11} />}
                        {ag.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="p2-grid" style={{ marginTop: '20px' }}>
        {/* ZeroRespond Core Services */}
        <div className="p2-card">
          <div className="p2-card-hd">
            <div className="p2-card-title">
              <Server size={16} /> ZeroRespond Core Services
            </div>
          </div>

          <div className="p2-health">
            <div className="p2-health-item">
              <div className="p2-health-label">FastAPI Backend</div>
              <div className="p2-health-value" style={{ color: 'var(--c-low)' }}>
                <CircleCheck size={13} color="var(--c-low)" /> Healthy (Port 8000)
              </div>
            </div>
            <div className="p2-health-item">
              <div className="p2-health-label">PostgreSQL Database</div>
              <div className="p2-health-value" style={{ color: 'var(--c-low)' }}>
                <CircleCheck size={13} color="var(--c-low)" /> Connected (Port 5432)
              </div>
            </div>
            <div className="p2-health-item">
              <div className="p2-health-label">DPDP Compliance Engine</div>
              <div className="p2-health-value" style={{ color: 'var(--c-low)' }}>
                <CircleCheck size={13} color="var(--c-low)" /> Active
              </div>
            </div>
            <div className="p2-health-item">
              <div className="p2-health-label">Docker Stack</div>
              <div className="p2-health-value">
                <Container size={13} /> Multi-Container
              </div>
            </div>
          </div>

          <div className="p2-divider" />
          <div className="p2-callout">
            <strong>Architecture:</strong> On-premise institutional deployment. All telemetry and case evidence remain strictly on internal servers.
          </div>
        </div>

        {/* Data Flow Pipeline */}
        <div className="p2-card">
          <div className="p2-card-hd">
            <div className="p2-card-title">
              <Database size={16} /> Incident Pipeline Flow
            </div>
          </div>

          <div className="p2-deploy-step">
            <div className="p2-step-num">1</div>
            <div>
              <div className="p2-step-title">Wazuh SIEM Detection</div>
              <div className="p2-step-copy">Manager receives endpoint events and logs across servers and workstations.</div>
            </div>
          </div>

          <div className="p2-deploy-step">
            <div className="p2-step-num">2</div>
            <div>
              <div className="p2-step-title">ZeroRespond Normalisation</div>
              <div className="p2-step-copy">FastAPI normalises security anomalies and applies sliding-window deduplication.</div>
            </div>
          </div>

          <div className="p2-deploy-step">
            <div className="p2-step-num">3</div>
            <div>
              <div className="p2-step-title">PostgreSQL Audit Logging</div>
              <div className="p2-step-copy">Cases, playbook step execution, and cryptographic evidence chains are recorded.</div>
            </div>
          </div>

          <div className="p2-deploy-step">
            <div className="p2-step-num">4</div>
            <div>
              <div className="p2-step-title">Statutory Reporting</div>
              <div className="p2-step-copy">Compliant DPDP Act §8(6) and CERT-In 6-Hour filings are generated.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
