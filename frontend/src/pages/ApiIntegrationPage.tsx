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
} from 'lucide-react'

export function ApiIntegrationPage() {
  const navigate = useNavigate()
  const { settings, saveSettings, showNotif } = useZeroRespond()

  const [formData, setFormData] = useState({
    wazuhUrl: settings.wazuhUrl,
    wazuhVersion: settings.wazuhVersion,
    wazuhUser: settings.wazuhUser,
    wazuhPass: settings.wazuhPass,
  })

  const [isConnected, setIsConnected] = useState(false)
  const [testing, setTesting] = useState(false)
  const [showSaved, setShowSaved] = useState(false)

  const handleTestConnection = () => {
    setTesting(true)
    setTimeout(() => {
      setTesting(false)
      setIsConnected(true)
      showNotif('Wazuh Connection', 'Connected to Wazuh Manager API successfully.', 'low')
    }, 800)
  }

  const handleSaveConfig = () => {
    saveSettings(formData)
    setShowSaved(true)
    setTimeout(() => setShowSaved(false), 2500)
  }

  return (
    <div id="view-integration" className="view" style={{ display: 'block' }}>
      <button className="back-btn" onClick={() => navigate('/settings')}>
        <ArrowLeft size={14} /> Back to Settings
      </button>

      <div className="page-hd">
        <h1>API</h1>
        <p>Configure the connection between ZeroRespond and the Wazuh manager that supplies detection events.</p>
      </div>

      <div className="p2-grid">
        {/* Detection Engine */}
        <div className="p2-card">
          <div className="p2-card-hd">
            <div className="p2-card-title">
              <Shield size={16} /> Detection Engine
            </div>
            <span className={`p2-status ${isConnected ? 'connected' : 'demo'}`}>
              {isConnected ? <CircleCheck size={13} /> : <CircleAlert size={13} />}
              {isConnected ? 'Connected' : 'Demo / Ready'}
            </span>
          </div>

          <div className="p2-form-grid">
            <div className="p2-field">
              <label className="p2-label">Wazuh Manager URL</label>
              <input
                className="p2-input"
                value={formData.wazuhUrl}
                onChange={e => setFormData({ ...formData, wazuhUrl: e.target.value })}
              />
              <div className="p2-hint">Endpoint reachable from the ZeroRespond backend.</div>
            </div>

            <div className="p2-field">
              <label className="p2-label">Wazuh Version</label>
              <select
                className="p2-input"
                value={formData.wazuhVersion}
                onChange={e => setFormData({ ...formData, wazuhVersion: e.target.value })}
              >
                <option>4.7</option>
                <option>4.8</option>
                <option>4.9</option>
                <option>4.10</option>
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
              <div className="p2-hint">Stored securely on your on-premise deployment.</div>
            </div>
          </div>

          <div className="p2-action-row" style={{ marginTop: '16px', display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button className="btn btn-primary btn-sm" onClick={handleTestConnection} disabled={testing}>
              <PlugZap size={14} /> {testing ? 'Testing...' : 'Test Connection'}
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
        </div>

        {/* Ingestion Health */}
        <div className="p2-card">
          <div className="p2-card-hd">
            <div className="p2-card-title">
              <Activity size={16} /> Ingestion Health
            </div>
          </div>

          <div className="p2-health" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="p2-health-item">
              <div className="p2-health-label">Connection</div>
              <div className="p2-health-value" style={{ color: isConnected ? 'var(--c-low)' : 'var(--text-1)' }}>
                {isConnected ? <CircleCheck size={13} color="var(--c-low)" /> : <CircleAlert size={13} color="#d97706" />}
                {isConnected ? 'Connected' : 'Demo State'}
              </div>
            </div>
            <div className="p2-health-item">
              <div className="p2-health-label">Last Event</div>
              <div className="p2-health-value">{isConnected ? 'Just now' : '8s ago'}</div>
            </div>
            <div className="p2-health-item">
              <div className="p2-health-label">Events Today</div>
              <div className="p2-health-value">18,421</div>
            </div>
            <div className="p2-health-item">
              <div className="p2-health-label">Queue</div>
              <div className="p2-health-value" style={{ color: 'var(--c-low)' }}>
                <CircleCheck size={13} color="var(--c-low)" /> Normal
              </div>
            </div>
          </div>

          <div className="p2-divider" />
          <div className="p2-kv">
            <span className="k">Transport</span>
            <span className="v">HTTPS / TLS</span>
            <span className="k">Source</span>
            <span className="v">Wazuh Manager API</span>
            <span className="k">Event path</span>
            <span className="v">Wazuh → FastAPI → PostgreSQL</span>
          </div>
        </div>
      </div>

      <div className="p2-grid" style={{ marginTop: '20px' }}>
        {/* ZeroRespond Services */}
        <div className="p2-card">
          <div className="p2-card-hd">
            <div className="p2-card-title">
              <Server size={16} /> ZeroRespond Services
            </div>
          </div>

          <div className="p2-health">
            <div className="p2-health-item">
              <div className="p2-health-label">FastAPI</div>
              <div className="p2-health-value" style={{ color: 'var(--c-low)' }}>
                <CircleCheck size={13} color="var(--c-low)" /> Ready
              </div>
            </div>
            <div className="p2-health-item">
              <div className="p2-health-label">PostgreSQL</div>
              <div className="p2-health-value" style={{ color: 'var(--c-low)' }}>
                <CircleCheck size={13} color="var(--c-low)" /> Ready
              </div>
            </div>
            <div className="p2-health-item">
              <div className="p2-health-label">WeasyPrint</div>
              <div className="p2-health-value" style={{ color: 'var(--c-low)' }}>
                <CircleCheck size={13} color="var(--c-low)" /> Ready
              </div>
            </div>
            <div className="p2-health-item">
              <div className="p2-health-label">Docker</div>
              <div className="p2-health-value">
                <Container size={13} /> Compose
              </div>
            </div>
          </div>

          <div className="p2-divider" />
          <div className="p2-callout">
            <strong>Deployment model:</strong> On-premise server running ZeroRespond core stack. The browser is only the UI interface; all incident telemetry stays on local institutional infrastructure.
          </div>
        </div>

        {/* Data Flow */}
        <div className="p2-card">
          <div className="p2-card-hd">
            <div className="p2-card-title">
              <Database size={16} /> Data Flow Pipeline
            </div>
          </div>

          <div className="p2-deploy-step">
            <div className="p2-step-num">1</div>
            <div>
              <div className="p2-step-title">Wazuh detects</div>
              <div className="p2-step-copy">Manager receives endpoint and server events in real time.</div>
            </div>
          </div>

          <div className="p2-deploy-step">
            <div className="p2-step-num">2</div>
            <div>
              <div className="p2-step-title">ZeroRespond ingests</div>
              <div className="p2-step-copy">FastAPI normalises alerts into actionable incidents.</div>
            </div>
          </div>

          <div className="p2-deploy-step">
            <div className="p2-step-num">3</div>
            <div>
              <div className="p2-step-title">PostgreSQL records</div>
              <div className="p2-step-copy">Cases, evidence timeline, and responder actions are safely logged.</div>
            </div>
          </div>

          <div className="p2-deploy-step">
            <div className="p2-step-num">4</div>
            <div>
              <div className="p2-step-title">Report generated</div>
              <div className="p2-step-copy">WeasyPrint generates statutory DPDP Act §8(6) PDF filings.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
