import { Link } from 'react-router-dom'
import { SeverityBadge } from '../SeverityBadge'
import type { IncidentRow } from '../../mock/fixtures'

type IncidentTableProps = {
  rows: IncidentRow[]
}

export function IncidentTable({ rows }: IncidentTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800">
      <table className="min-w-[42rem] w-full divide-y divide-zinc-800 text-sm">
        <thead className="bg-zinc-900/80">
          <tr>
            <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-400">
              Case ID
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-400">
              Severity
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-400">
              Attack type
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-400">
              Assigned to
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-400">
              Status
            </th>
            <th scope="col" className="px-4 py-3 text-left font-medium text-zinc-400">
              Opened
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800 bg-zinc-950">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-zinc-900/60">
              <td className="px-4 py-3 font-mono">
                <Link
                  to={`/incidents/${encodeURIComponent(row.id)}`}
                  className="text-teal-400 underline-offset-4 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400/60 rounded"
                >
                  {row.id}
                </Link>
              </td>
              <td className="px-4 py-3">
                <SeverityBadge severity={row.severity} />
              </td>
              <td className="px-4 py-3 text-zinc-200">{row.attackType}</td>
              <td className="px-4 py-3 text-zinc-400">{row.assignee}</td>
              <td className="px-4 py-3 text-zinc-300">{row.status}</td>
              <td className="px-4 py-3 text-zinc-500">{row.opened}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
