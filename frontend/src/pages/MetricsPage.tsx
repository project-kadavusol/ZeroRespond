import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

/** Sample series for validating Recharts; replace with live MTTD/MTTR aggregates. */
const mttdTrend = [
  { day: 'Mon', minutes: 5.8 },
  { day: 'Tue', minutes: 4.2 },
  { day: 'Wed', minutes: 4.9 },
  { day: 'Thu', minutes: 3.6 },
  { day: 'Fri', minutes: 4.1 },
]

export function MetricsPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-semibold text-white">Operational metrics</h1>
        <p className="mt-1 text-sm text-zinc-400">
          MTTD/MTTR charts, incidents per month, severity distribution, calendar
          heatmap (Sprint 4). Below: placeholder line chart wired to Recharts.
        </p>
      </header>

      <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
        <h2 className="mb-4 text-sm font-medium text-zinc-300">
          MTTD rolling trend (minutes, simulated)
        </h2>
        <div className="h-64 w-full min-w-[18rem]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mttdTrend}>
              <CartesianGrid stroke="#3f3f46" strokeDasharray="4 4" />
              <XAxis dataKey="day" stroke="#a1a1aa" />
              <YAxis stroke="#a1a1aa" label={{ value: 'min', fill: '#a1a1aa', angle: -90 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#18181b',
                  border: '1px solid #3f3f46',
                }}
              />
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
      </section>
    </div>
  )
}
