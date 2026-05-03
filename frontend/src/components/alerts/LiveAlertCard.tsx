import { Link } from 'react-router-dom'
import { SeverityBadge } from '../SeverityBadge'
import type { LiveAlertFixture } from '../../mock/fixtures'

type LiveAlertCardProps = {
  alert: LiveAlertFixture
}

export function LiveAlertCard({ alert }: LiveAlertCardProps) {
  return (
    <li className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-zinc-500">{alert.id}</span>
            <SeverityBadge severity={alert.severity} />
          </div>
          <p className="mt-2 text-sm font-medium leading-snug text-zinc-100">
            {alert.plainSummary}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            <span className="text-zinc-400">{alert.ruleName}</span>
            <span className="mx-1.5 text-zinc-600">·</span>
            <span className="font-mono text-zinc-500">{alert.ruleId}</span>
          </p>
          <p className="mt-1 text-xs text-zinc-500">
            Host{' '}
            <span className="font-mono text-zinc-400">{alert.host}</span> ·{' '}
            <span className="font-mono text-zinc-500">{alert.timestamp}</span>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            to="/dashboard"
            title="Opens the incident queue"
            className="rounded-md border border-teal-800/70 bg-teal-950/50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-teal-200 hover:bg-teal-900/70"
          >
            Create case
          </Link>
        </div>
      </div>
    </li>
  )
}
