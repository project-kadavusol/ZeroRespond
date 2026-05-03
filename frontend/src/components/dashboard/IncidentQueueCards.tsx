import { Link } from 'react-router-dom'
import { SeverityBadge } from '../SeverityBadge'
import type { IncidentRow } from '../../mock/fixtures'

type IncidentQueueCardsProps = {
  rows: IncidentRow[]
  /** Show at most this many cards (e.g. top of queue). */
  limit?: number
}

export function IncidentQueueCards({
  rows,
  limit = 3,
}: IncidentQueueCardsProps) {
  const slice = rows.slice(0, limit)
  return (
    <ul className="space-y-3 md:hidden" aria-label="Recent incidents">
      {slice.map((row) => (
        <li key={row.id}>
          <Link
            to={`/incidents/${encodeURIComponent(row.id)}`}
            className="block rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 transition hover:border-zinc-700 hover:bg-zinc-900"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm text-teal-400">{row.id}</span>
              <SeverityBadge severity={row.severity} />
            </div>
            <p className="mt-2 font-medium text-zinc-100">{row.attackType}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {row.status} · {row.opened}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  )
}
