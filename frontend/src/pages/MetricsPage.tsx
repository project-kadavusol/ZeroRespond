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
    backgroundColor: '#18181b',
    border: '1px solid #3f3f46',
    borderRadius: '6px',
  },
}

export function MetricsPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header>
        <h1 className="text-xl font-semibold text-white md:text-2xl">
          Operational metrics
        </h1>
        <p className="mt-1 max-w-prose text-sm text-zinc-400">
          Four chart families + calendar heat prototype — aligns with Sprint&nbsp;4
          polish milestones; values are fixtures only (
          <span title="Rolling windows & API aggregation">MTTD&nbsp;/&nbsp;MTTR semantics</span>
          ).
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-2">
        <MetricPanel title="MTTD rolling · minutes (fixture)">
          <div className="h-60 w-full min-w-[16rem]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_MTTD_DAYS}>
                <CartesianGrid stroke="#3f3f46" strokeDasharray="4 4" />
                <XAxis dataKey="day" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip {...tooltip} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  name="MTTD (min)"
                  stroke="#2dd4bf"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MetricPanel>

        <MetricPanel title="MTTR · containment minutes (fixture)">
          <div className="h-60 w-full min-w-[16rem]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_MTTR_DAYS}>
                <CartesianGrid stroke="#3f3f46" strokeDasharray="4 4" />
                <XAxis dataKey="day" stroke="#a1a1aa" />
                <YAxis stroke="#a1a1aa" />
                <Tooltip {...tooltip} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="minutes"
                  name="MTTR (min)"
                  stroke="#a78bfa"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </MetricPanel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <MetricPanel title="Incidents per month (fixture)">
          <div className="h-60 w-full min-w-[16rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_INCIDENTS_BY_MONTH}>
                <CartesianGrid stroke="#3f3f46" strokeDasharray="4 4" />
                <XAxis dataKey="month" stroke="#a1a1aa" />
                <YAxis allowDecimals={false} stroke="#a1a1aa" />
                <Tooltip {...tooltip} />
                <Bar dataKey="count" name="Incidents" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </MetricPanel>

        <MetricPanel title="Severity distribution (fixture)">
          <div className="h-60 w-full min-w-[16rem]">
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

      <IncidentDensityHeatmap />
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
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="mb-4 text-sm font-medium text-zinc-300">{title}</h2>
      {children}
    </section>
  )
}
