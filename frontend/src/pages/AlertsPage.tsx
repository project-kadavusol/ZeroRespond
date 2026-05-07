import { Link } from 'react-router-dom'
import { MOCK_LIVE_ALERTS } from '../mock/fixtures'
import { ZR_SEV_BG, ZR_SEV_ICON } from '../lib/incidentDisplay'

export function AlertsPage() {
  return (
    <div className="zr-page">
      <header className="zr-page-header">
        <div>
          <div className="zr-page-title">Live Alert Feed</div>
          <div className="zr-page-sub">
            Real-time Wazuh alert stream — sample alerts until your ingest is connected
          </div>
        </div>
      </header>

      <div
        className="card zr-card-body-pad"
        style={{ padding: '0', maxHeight: 'calc(100vh - 152px)', display: 'flex', flexDirection: 'column' }}
      >
        <div className="zr-card-head" style={{ flexShrink: 0 }}>
          <div className="card-title" style={{ margin: 0 }}>
            All alerts · {MOCK_LIVE_ALERTS.length} shown
          </div>
          <div className="zr-live-pill">
            <span className="zr-live-dot" aria-hidden />
            POLLING
          </div>
        </div>
        <div className="alert-feed" style={{ overflowY: 'auto', flex: 1 }}>
          {MOCK_LIVE_ALERTS.map((a, i) => (
            <Link
              key={a.id}
              to={`/incidents/${encodeURIComponent('INV-2042')}`}
              className="af-item"
            >
              <span
                className="af-sev-bar"
                style={{ background: ZR_SEV_BG[a.severity] }}
                aria-hidden
              />
              <span
                className="af-icon"
                style={{ background: `${ZR_SEV_BG[a.severity]}22` }}
                aria-hidden
              >
                {ZR_SEV_ICON[a.severity]}
              </span>
              <span className="af-main">
                <span className="af-rule">
                  {a.ruleId} — {a.ruleName}
                </span>
                <span className="af-host">{a.host}</span>
              </span>
              <span className="af-meta">
                <span className="af-time">{a.timestamp}</span>
                {i < 2 ? <span className="af-new" aria-label="Recent" /> : null}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
