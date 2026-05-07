import type { Severity } from '../components/SeverityBadge'

/** Accent colors for alert feed stripes (ZR theme tokens). */
export const ZR_SEV_BG: Record<Severity, string> = {
  critical: 'var(--red)',
  high: 'var(--orange)',
  medium: 'var(--amber)',
  low: 'var(--accent2)',
}

/** Emoji icons matching dashboard mock tone. */
export const ZR_SEV_ICON: Record<Severity, string> = {
  critical: '🔴',
  high: '🟠',
  medium: '🟡',
  low: '🔵',
}

export function incidentStatusBadgeClass(status: string): string {
  const s = status.toLowerCase()
  if (s.includes('investigating')) return 'status st-progress'
  if (s.includes('open')) return 'status st-open'
  if (s.includes('resolved') || s.includes('closed')) return 'status st-done'
  return 'status st-progress'
}

export function pseudoMttdMinutes(id: string): string {
  let sum = 0
  for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i)
  const v = 3 + (sum % 25) / 10
  return `${v.toFixed(1)}m`
}
