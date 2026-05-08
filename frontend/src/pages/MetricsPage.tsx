import type { ReactNode } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Bar,
  BarChart,
  Pie,
  PieChart,
  Cell,
  Tooltip,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from 'recharts'
import { IncidentDensityHeatmap } from '../components/metrics/IncidentDensityHeatmap'
import {
  MOCK_INCIDENTS_BY_MONTH,
  MOCK_MTTD_DAYS,
  MOCK_MTTR_DAYS,
  MOCK_SEVERITY_MIX,
} from '../mock/fixtures'

const tooltip = {
  contentStyle: {
    backgroundColor: '#0f1320',
    border: '1px solid #252d47',
    borderRadius: '6px',
    color: '#e8eeff',
  },
}

export function MetricsPage() {
  return (
    <div className="zr-page">
      <header className="zr-page-header">
        <div>
          <div className="zr-page-title">Security Metrics</div>
          <div className="zr-page-sub">
            MTTD · MTTR · False positive rate · Incident volume — KCT lab simulation results
          </div>
        </div>
      </header>

      <div className="metrics-grid-2">
        <MetricPanel title="MTTD rolling · minutes">
          <div className="chart-area" style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_MTTD_DAYS}>
                <CartesianGrid stroke="#1c2236" strokeDasharray="4 4" />
                <XAxis dataKey="day" stroke="#8895b3" tick={{ fill: '#8895b3', fontSize: 11 }} />
                <YAxis stroke="#8895b3" tick={{ fill: '#8895b3', fontSize: 11 }} />
                <Tooltip {...tooltip} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  name="MTTD (min)"
                  stroke="#00E5B0"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#00E5B0' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MetricPanel>

        <MetricPanel title="MTTR · containment minutes">
          <div className="chart-area" style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_MTTR_DAYS}>
                <CartesianGrid stroke="#1c2236" strokeDasharray="4 4" />
                <XAxis dataKey="day" stroke="#8895b3" tick={{ fill: '#8895b3', fontSize: 11 }} />
                <YAxis stroke="#8895b3" tick={{ fill: '#8895b3', fontSize: 11 }} />
                <Tooltip {...tooltip} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  name="MTTR (min)"
                  stroke="#9B6DFF"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#9B6DFF' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MetricPanel>

        <MetricPanel title="Incidents per month">
          <div className="chart-area" style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_INCIDENTS_BY_MONTH}>
                <CartesianGrid stroke="#1c2236" strokeDasharray="4 4" />
                <XAxis dataKey="month" stroke="#8895b3" tick={{ fill: '#8895b3', fontSize: 11 }} />
                <YAxis allowDecimals={false} stroke="#8895b3" tick={{ fill: '#8895b3', fontSize: 11 }} />
                <Tooltip {...tooltip} />
                <Bar dataKey="count" name="Incidents" fill="#3B7CFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MetricPanel>

        <MetricPanel title="Severity distribution">
          <div className="chart-area" style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip {...tooltip} />
                <Legend />
                <Pie
                  data={MOCK_SEVERITY_MIX}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {MOCK_SEVERITY_MIX.map((entry) => (
                    <Cell key={entry.name} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </MetricPanel>
      </div>

      <div style={{ marginTop: '16px' }}>
        <IncidentDensityHeatmap />
      </div>
    </div>
  )
}

function MetricPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="chart-box">
      <h2 className="card-title" style={{ marginBottom: '12px' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}
