import { SeverityBadge, type Severity } from '../SeverityBadge'

type AlertSummaryCardProps = {
  plainSummary: string
  ruleId: string
  ruleName: string
  host: string
  sourceIp: string
  description: string
  detectedLocal: string
  severity: Severity
}

export function AlertSummaryCard({
  plainSummary,
  ruleId,
  ruleName,
  host,
  sourceIp,
  description,
  detectedLocal,
  severity,
}: AlertSummaryCardProps) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="min-w-0 max-w-prose">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            What we detected
          </p>
          <h2 className="mt-1 text-lg font-semibold leading-snug text-white">
            {plainSummary}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">{ruleName}</p>
          <p className="mt-1.5 text-xs text-zinc-500">
            Technical reference:{' '}
            <span className="font-mono text-zinc-500">{ruleId}</span>
          </p>
        </div>
        <SeverityBadge severity={severity} />
      </div>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-zinc-500">Affected host</dt>
          <dd className="font-mono text-zinc-200">{host}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">
            <span title="Potential source address from log correlation">
              Observed IP
            </span>
          </dt>
          <dd className="font-mono text-zinc-200">{sourceIp}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs text-zinc-500">Details</dt>
          <dd className="text-zinc-300">{description}</dd>
        </div>
        <div>
          <dt className="text-xs text-zinc-500">
            <span title="Adjusted for display; authoritative time is UTC when live.">
              Detection time
            </span>
          </dt>
          <dd className="text-zinc-400">{detectedLocal}</dd>
        </div>
      </dl>
    </section>
  )
}
