import { Link } from 'react-router-dom'
import { SeverityBadge } from '../components/SeverityBadge'

const mockRows = [
  {
    id: 'INV-2042',
    severity: 'critical' as const,
    attackType: 'Ransomware',
    assignee: 'IT SOC',
    status: 'Investigating',
    opened: 'Apr 26, 2026 · 02:47',
  },
  {
    id: 'INV-2038',
    severity: 'high' as const,
    attackType: 'Unauthorized access',
    assignee: 'Unassigned',
    status: 'Open',
    opened: 'Apr 25, 2026 · 14:12',
  },
]

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-white">
          Incident list
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Active and resolved incidents (mock data until backend `/cases`).
        </p>
      </header>

      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-800 text-sm">
          <thead className="bg-zinc-900/80">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">
                Case ID
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">
                Severity
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">
                Attack type
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">
                Assigned to
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-zinc-400">
                Opened
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-zinc-950">
            {mockRows.map((row) => (
              <tr key={row.id} className="hover:bg-zinc-900/60">
                <td className="px-4 py-3 font-mono">
                  <Link
                    to={`/incidents/${encodeURIComponent(row.id)}`}
                    className="text-teal-400 underline-offset-4 hover:underline"
                  >
                    {row.id}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <SeverityBadge severity={row.severity} />
                </td>
                <td className="px-4 py-3 text-zinc-200">{row.attackType}</td>
                <td className="px-4 py-3 text-zinc-400">{row.assignee}</td>
                <td className="px-4 py-3">{row.status}</td>
                <td className="px-4 py-3 text-zinc-500">{row.opened}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
