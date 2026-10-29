import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useZeroRespond } from '../context/ZeroRespondContext'
import {
  Landmark,
  User,
  Scale,
  Save,
  Check,
  Settings2,
  PlugZap,
  ChevronRight,
  Plug,
  Lightbulb,
} from 'lucide-react'

export function SettingsPage() {
  const navigate = useNavigate()
  const { settings, saveSettings, wazuhStatus } = useZeroRespond()

  const [formData, setFormData] = useState({ ...settings })
  const [showSavedConfirm, setShowSavedConfirm] = useState(false)

  const handleChange = (field: keyof typeof settings, val: string) => {
    setFormData(prev => ({ ...prev, [field]: val }))
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    saveSettings(formData)
    setShowSavedConfirm(true)
    setTimeout(() => setShowSavedConfirm(false), 3000)
  }

  return (
    <div id="view-settings" className="view" style={{ display: 'block' }}>
      <div className="page-hd">
        <h1>Settings — Organisation Profile</h1>
        <p>These organisation details are used in official DPDP reports. Set them once during deployment.</p>
      </div>

      <form onSubmit={handleSave}>
        <div className="settings-grid">
          {/* Organisation Details */}
          <div className="settings-card">
            <div className="settings-card-title">
              <Landmark size={16} /> Organisation Details
            </div>
            <div className="settings-field">
              <label className="settings-lbl">Organisation Name</label>
              <input
                className="settings-val"
                id="s-orgname"
                value={formData.orgName}
                onChange={e => handleChange('orgName', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label className="settings-lbl">Organisation Type</label>
              <select
                className="settings-val"
                id="s-orgtype"
                value={formData.orgType}
                onChange={e => handleChange('orgType', e.target.value)}
              >
                <option>Educational Institution</option>
                <option>Hospital / Healthcare</option>
                <option>NGO / Non-Profit</option>
                <option>Startup / SMB</option>
                <option>Government Office</option>
                <option>Other</option>
              </select>
            </div>
            <div className="settings-field">
              <label className="settings-lbl">City / District</label>
              <input
                className="settings-val"
                id="s-city"
                value={formData.city}
                onChange={e => handleChange('city', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label className="settings-lbl">State</label>
              <input
                className="settings-val"
                id="s-state"
                value={formData.state}
                onChange={e => handleChange('state', e.target.value)}
              />
            </div>
          </div>

          {/* Data Protection Officer */}
          <div className="settings-card">
            <div className="settings-card-title">
              <User size={16} /> Data Protection Officer
            </div>
            <div className="settings-field">
              <label className="settings-lbl">DPO Name / Department</label>
              <input
                className="settings-val"
                id="s-dponame"
                value={formData.dpoName}
                onChange={e => handleChange('dpoName', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label className="settings-lbl">DPO Email</label>
              <input
                className="settings-val"
                id="s-dpoemail"
                type="email"
                value={formData.dpoEmail}
                onChange={e => handleChange('dpoEmail', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label className="settings-lbl">DPO Phone</label>
              <input
                className="settings-val"
                id="s-dpophone"
                value={formData.dpoPhone}
                onChange={e => handleChange('dpoPhone', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label className="settings-lbl">CERT-In Notification Email</label>
              <input className="settings-val" id="s-certin" value={formData.certInEmail} disabled />
              <div className="form-hint" style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-3)' }}>
                Fixed by CERT-In — cannot be changed
              </div>
            </div>
          </div>
        </div>

        {/* DPDP Compliance Settings */}
        <div className="settings-card" style={{ marginBottom: '20px' }}>
          <div className="settings-card-title">
            <Scale size={16} /> DPDP Compliance Settings
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div className="settings-field">
              <label className="settings-lbl">CERT-In Reporting Window</label>
              <input className="settings-val" value="6 hours (mandatory)" disabled />
            </div>
            <div className="settings-field">
              <label className="settings-lbl">Data Board Reporting Window</label>
              <input className="settings-val" value="72 hours (mandatory)" disabled />
            </div>
            <div className="settings-field">
              <label className="settings-lbl">Organisation DPDP Registration ID</label>
              <input
                className="settings-val"
                id="s-dpdpid"
                value={formData.dpdpId}
                placeholder="Enter DPDP registration ID (if registered)"
                onChange={e => handleChange('dpdpId', e.target.value)}
              />
            </div>
            <div className="settings-field">
              <label className="settings-lbl">Auto-generate report on incident resolution</label>
              <select
                className="settings-val"
                id="s-autoreport"
                value={formData.autoReport}
                onChange={e => handleChange('autoReport', e.target.value)}
              >
                <option>Yes — prompt to generate</option>
                <option>No — generate manually</option>
              </select>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Save size={15} /> Save Changes
          </button>
          {showSavedConfirm && (
            <span className="save-confirm" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--c-low)', fontWeight: 600 }}>
              <Check size={14} /> Settings saved successfully
            </span>
          )}
        </div>
      </form>

      {/* Quick Nav Cards */}
      <div className="p3-settings-grid">
        <button className="p3-settings-card" onClick={() => navigate('/rules')}>
          <div className="p3-settings-icon">
            <Settings2 size={18} />
          </div>
          <div>
            <strong>Detection Rules</strong>
            <span>Configure Wazuh detection rules and monitored attack patterns.</span>
          </div>
          <ChevronRight size={18} className="p3-settings-arrow" />
        </button>

        <button className="p3-settings-card" onClick={() => navigate('/integration')}>
          <div className="p3-settings-icon">
            <PlugZap size={18} />
          </div>
          <div>
            <strong>API</strong>
            <span>Connection, ingestion health, and deployment configuration.</span>
          </div>
          <ChevronRight size={18} className="p3-settings-arrow" />
        </button>
      </div>

      {/* Backend Status Card */}
      <div className="backend-status-card" style={{ marginTop: '24px' }}>
        <div className="card-title" style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Plug size={16} /> System &amp; Backend Status
        </div>
        <div className="backend-row">
          <span className="backend-lbl">ZeroRespond Version</span>
          <span className="backend-val">
            v2.0 (Production) <span className="status-chip active" style={{ background: 'var(--c-low-bg)', color: 'var(--c-low)' }}>Active</span>
          </span>
        </div>
        <div className="backend-row">
          <span className="backend-lbl">Wazuh Detection Engine</span>
          <span className="backend-val">
            <span
              className="status-chip"
              style={{
                background: wazuhStatus.connected ? 'var(--c-low-bg)' : 'rgba(239, 68, 68, 0.1)',
                color: wazuhStatus.connected ? 'var(--c-low)' : '#dc2626',
              }}
            >
              {wazuhStatus.connected ? `Connected (${wazuhStatus.manager?.version || 'v4.14'})` : 'Offline'}
            </span>{' '}
            <span style={{ fontSize: '12.5px', color: 'var(--text-3)' }}>Wazuh SIEM REST API</span>
          </span>
        </div>
        <div className="backend-row">
          <span className="backend-lbl">FastAPI Backend</span>
          <span className="backend-val">
            <span className="status-chip active" style={{ background: 'var(--c-low-bg)', color: 'var(--c-low)' }}>Ready / Port 8000</span>
          </span>
        </div>
        <div className="backend-row">
          <span className="backend-lbl">PostgreSQL Database</span>
          <span className="backend-val">
            <span className="status-chip active" style={{ background: 'var(--c-low-bg)', color: 'var(--c-low)' }}>Ready / Port 5432</span>
          </span>
        </div>
        <div className="backend-row">
          <span className="backend-lbl">Report Generator (WeasyPrint)</span>
          <span className="backend-val">
            <span className="status-chip active" style={{ background: 'var(--c-low-bg)', color: 'var(--c-low)' }}>Ready</span>
          </span>
        </div>
        <div className="backend-row">
          <span className="backend-lbl">Deployment Mode</span>
          <span className="backend-val">Full Stack (Vite React + FastAPI + PostgreSQL)</span>
        </div>
        <div
          style={{
            marginTop: '14px',
            padding: '12px 14px',
            background: 'var(--accent-light)',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--r-sm)',
            fontSize: '13px',
            color: '#0e7490',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Lightbulb size={16} style={{ flexShrink: 0 }} />
          <span>
            Production Note: To connect to your live Wazuh cluster, configure your <code>.env</code> file with your Wazuh API token and run <code>docker compose up</code>.
          </span>
        </div>
      </div>
    </div>
  )
}
