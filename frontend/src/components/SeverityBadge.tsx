export type Severity = 'critical' | 'high' | 'medium' | 'low'

const styles: Record<Severity, string> = {
  critical: 'bg-red-950 text-red-200 ring-1 ring-red-800',
  high: 'bg-orange-950 text-orange-200 ring-1 ring-orange-800',
  medium: 'bg-amber-950 text-amber-100 ring-1 ring-amber-800',
  low: 'bg-emerald-950 text-emerald-200 ring-1 ring-emerald-900',
}

const labels: Record<Severity, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
}

type SeverityBadgeProps = {
  severity: Severity
}

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={`inline-flex rounded px-2 py-0.5 text-xs font-semibold capitalize ${styles[severity]}`}
    >
      {labels[severity]}
    </span>
  )
}
