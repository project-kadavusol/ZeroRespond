import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from 'recharts'
import { IncidentTable } from '../components/dashboard/IncidentTable'
import { DashboardHeatmap } from '../components/dashboard/DashboardHeatmap'
import { MOCK_INCIDENTS, MOCK_LIVE_ALERTS, MOCK_MTTD_DAYS } from '../mock/fixtures'
import { ZR_SEV_BG, ZR_SEV_ICON } from '../lib/incidentDisplay'

const TYPE_CHART = [
  { t: 'Ransom.', v: 8 },
  { t: 'SSH', v: 12 },
  { t: 'Web', v: 7 },
  { t: 'C2', v: 4 },
]

const tooltipSx = {
  contentStyle: {
    backgroundColor: '#0f1320',
    border: '1px solid var(--border2)',
    borderRadius: '6px',
    color: 'var(--txt)',
  },
}

export function DashboardPage() {
  const recent = MOCK_INCIDENTS.slice(0, 5)
  const miniAlerts = MOCK_LIVE_ALERTS.slice(0, 6)

  return (
    <div className="zr-page">
      <header className="zr-page-header">
        <div>
          <div className="zr-page-title">Security Dashboard</div>
          <div className="zr-page-sub">
            Live security posture · Updated every 30 seconds · KCT IT Dept
          </div>
        </div>
        <div className="zr-page-actions">
          <span className="zr-sync-note">Last sync: 2 min ago</span>
          <button type="button" className="btn btn-ghost btn-sm">
            ↻ Refresh
          </button>
          <Link to="/incidents" className="btn btn-primary btn-sm">
            + New Incident
          </Link>
        </div>
      </header>

      <div className="kpi-grid">
        <div
          className="kpi-card"
          style={{ '--kpi-color': 'var(--red)' } as CSSProperties}
        >
          <div className="kpi-val">3</div>
          <div className="kpi-lbl">Active Incidents</div>
          <div className="kpi-sub">2 open · 1 in progress</div>
          <div className="kpi-delta delta-down">▲ +2</div>
        </div>
        <div
          className="kpi-card"
          style={{ '--kpi-color': 'var(--accent)' } as CSSProperties}
        >
          <div className="kpi-val">4.2m</div>
          <div className="kpi-lbl">Mean Time to Detect</div>
          <div className="kpi-sub">avg across 50 alerts</div>
          <div className="kpi-delta delta-up">▼ -1.1m</div>
        </div>
        <div
          className="kpi-card"
          style={{ '--kpi-color': 'var(--accent2)' } as CSSProperties}
        >
          <div className="kpi-val">22m</div>
          <div className="kpi-lbl">Mean Time to Respond</div>
          <div className="kpi-sub">with playbook guidance</div>
          <div className="kpi-delta delta-up">▼ -8m</div>
        </div>
        <div
          className="kpi-card"
          style={{ '--kpi-color': 'var(--amber)' } as CSSProperties}
        >
          <div className="kpi-val">12%</div>
          <div className="kpi-lbl">False Positive Rate</div>
          <div className="kpi-sub">after Wazuh tuning</div>
          <div className="kpi-delta delta-up">▼ -16%</div>
        </div>
      </div>

      <div
        className="zr-dash-cols"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 360px',
          gap: '16px',
          marginBottom: '16px',
        }}
      >
        <div className="card zr-card-body-pad">
          <div className="zr-card-head">
            <div className="card-title" style={{ margin: 0 }}>
              Recent Incidents
            </div>
            <Link to="/incidents" className="btn btn-ghost btn-sm">
              View All →
            </Link>
          </div>
          <IncidentTable rows={recent} />
        </div>

        <div className="card zr-card-body-pad" style={{ maxHeight: '380px', display: 'flex', flexDirection: 'column' }}>
          <div className="zr-card-head" style={{ flexShrink: 0 }}>
            <div className="card-title" style={{ margin: 0 }}>
              Live Alert Feed
            </div>
            <div className="zr-live-pill">
              <span className="zr-live-dot" aria-hidden />
              LIVE
            </div>
          </div>
          <div className="alert-feed" style={{ overflowY: 'auto', flex: 1 }}>
            {miniAlerts.map((a, i) => (
              <Link key={a.id} to="/alerts" className="af-item">
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
                  <span className="af-rule">{a.ruleName}</span>
                  <span className="af-host">{a.host}</span>
                </span>
                <span className="af-meta">
                  <span className="af-time">{a.timestamp}</span>
                  {i < 3 ? <span className="af-new" aria-label="New" /> : null}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="metrics-grid-2" style={{ marginBottom: '16px' }}>
        <div className="chart-box">
          <div className="card-title" style={{ marginBottom: '0' }}>
            MTTD Trend · minutes
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_MTTD_DAYS}>
                <CartesianGrid stroke="#1c2236" strokeDasharray="4 4" />
                <XAxis dataKey="day" stroke="#5c6b8a" tick={{ fill: '#8895b3', fontSize: 11 }} />
                <YAxis stroke="#5c6b8a" tick={{ fill: '#8895b3', fontSize: 11 }} />
                <Tooltip {...tooltipSx} />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  stroke="#00E5B0"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#00E5B0' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-box">
          <div className="card-title" style={{ marginBottom: '0' }}>
            Incidents by Category
          </div>
          <div className="chart-area">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TYPE_CHART}>
                <CartesianGrid stroke="#1c2236" strokeDasharray="4 4" />
                <XAxis dataKey="t" stroke="#5c6b8a" tick={{ fill: '#8895b3', fontSize: 11 }} />
                <YAxis allowDecimals={false} stroke="#5c6b8a" tick={{ fill: '#8895b3', fontSize: 11 }} />
                <Tooltip {...tooltipSx} />
                <Bar dataKey="v" fill="#00E5B0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <DashboardHeatmap />
    </div>
  )
}
