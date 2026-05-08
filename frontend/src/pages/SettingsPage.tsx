import { MOCK_SETTINGS_INTEGRATIONS } from '../mock/fixtures'

function statusPill(status: 'connected' | 'paused') {
  if (status === 'connected') return <span className="status st-done">Connected</span>
  return <span className="status st-progress">Paused</span>
}

export function SettingsPage() {
  return (
    <div className="zr-page">
      <header className="zr-page-header">
        <div>
          <div className="zr-page-title">Settings</div>
          <div className="zr-page-sub">Integrations, notifications, and platform behaviour</div>
        </div>
      </header>

      <div className="zr-settings-grid">
        <div className="card card-sm">
          <div className="card-title" style={{ marginBottom: '12px' }}>
            Integrations
          </div>
          {MOCK_SETTINGS_INTEGRATIONS.map((item) => (
            <div className="zr-toggle-row" key={item.name}>
              <div>
                <div className="td-title">{item.name}</div>
                <div className="td-sub">{item.detail}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                {statusPill(item.status)}
                <button type="button" className="btn btn-ghost btn-sm">
                  Configure
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="card card-sm">
          <div className="card-title" style={{ marginBottom: '12px' }}>
            Notifications
          </div>
          <div className="zr-toggle-row">
            <div>
              <div className="td-title">Severity ≥ High → email</div>
              <div className="td-sub">Owners + SOC distribution list</div>
            </div>
            <span className="status st-done">On</span>
          </div>
          <div className="zr-toggle-row">
            <div>
              <div className="td-title">Daily digest · 06:30 IST</div>
              <div className="td-sub">Open cases and overdue playbook steps</div>
            </div>
            <span className="status st-done">On</span>
          </div>
          <div className="zr-toggle-row">
            <div>
              <div className="td-title">Slack playbook escalations</div>
              <div className="td-sub">Only when playbook step stalls &gt; 15 min</div>
            </div>
            <span className="status st-progress">Off</span>
          </div>
        </div>

        <div className="card card-sm">
          <div className="card-title" style={{ marginBottom: '12px' }}>
            Platform
          </div>
          <div className="zr-toggle-row">
            <div>
              <div className="td-title">API access</div>
              <div className="td-sub">
                Bearer tokens · Manage from Security settings
              </div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm">
              Manage keys
            </button>
          </div>
          <div className="zr-toggle-row">
            <div>
              <div className="td-title">Audit log retention</div>
              <div className="td-sub">90 days · SOC admin actions included</div>
            </div>
            <button type="button" className="btn btn-ghost btn-sm">
              View audit
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
