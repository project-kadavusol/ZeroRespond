export type Severity = 'critical' | 'high' | 'medium' | 'low'

const zrClasses: Record<Severity, string> = {
  critical: 'sev sev-crit',
  high: 'sev sev-high',
  medium: 'sev sev-med',
  low: 'sev sev-low',
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
  return <span className={zrClasses[severity]}>{labels[severity]}</span>
}
