/**
 * Sprint 1 static fixtures — swap for API payloads in Sprint 2+.
 */
import type { Severity } from '../components/SeverityBadge'

export type IncidentRow = {
  id: string
  severity: Severity
  attackType: string
  assignee: string
  status: string
  opened: string
}

export const MOCK_INCIDENTS: IncidentRow[] = [
  {
    id: 'INV-2042',
    severity: 'critical',
    attackType: 'Ransomware',
    assignee: 'IT SOC',
    status: 'Investigating',
    opened: 'Apr 26, 2026 · 02:47',
  },
  {
    id: 'INV-2041',
    severity: 'high',
    attackType: 'Phishing / BEC',
    assignee: 'admin@campus.edu',
    status: 'Open',
    opened: 'Apr 26, 2026 · 01:03',
  },
  {
    id: 'INV-2038',
    severity: 'high',
    attackType: 'Unauthorized access',
    assignee: 'Unassigned',
    status: 'Open',
    opened: 'Apr 25, 2026 · 14:12',
  },
  {
    id: 'INV-2034',
    severity: 'medium',
    attackType: 'Data exfiltration',
    assignee: 'NetOps',
    status: 'Resolved',
    opened: 'Apr 22, 2026 · 09:51',
  },
  {
    id: 'INV-2030',
    severity: 'low',
    attackType: 'Insider misuse',
    assignee: 'HR liaison',
    status: 'Closed',
    opened: 'Apr 18, 2026 · 16:22',
  },
]

export type TimelineEntry = {
  at: string
  title: string
  detail?: string
}

export const MOCK_ALERT_SUMMARY = {
  ruleId: 'RULE-92011',
  ruleName: 'Mass file rename (ransomware indicator)',
  host: 'fin-srv-03.campus.edu',
  sourceIp: '10.42.17.91',
  description:
    'High volume of .locked files under /data/shares plus new outbound TLS to unseen IP.',
  detectedLocal: 'Apr 26, 2026 · 02:47 IST',
  severity: 'critical' as Severity,
}

export const MOCK_TIMELINE: TimelineEntry[] = [
  {
    at: '02:47:06',
    title: 'Detection',
    detail: 'Wazuh alerted on mass filesystem changes from winagent-02.',
  },
  {
    at: '02:48:51',
    title: 'Case opened',
    detail: 'Playbook «Ransomware Response» assigned automatically.',
  },
  {
    at: '02:51:20',
    title: 'Containment suggested',
    detail:
      'First playbook step dispatched (isolate host — pending responder).',
  },
]

export type PlaybookStep = {
  step: number
  title: string
  goal: string
  linux: string
  windows: string
  blocking: boolean
}

export const MOCK_RANSOMWARE_PLAYBOOK: { name: string; steps: PlaybookStep[] } =
  {
    name: 'Ransomware Response',
    steps: [
      {
        step: 1,
        title: 'Isolate the host immediately',
        goal:
          'Stop lateral movement — block ingress/egress except management until triage completes.',
        linux:
          'sudo iptables -I INPUT -j DROP && sudo iptables -I OUTPUT -j DROP',
        windows:
          'netsh advfirewall set allprofiles firewallpolicy blockinbound,blockoutbound',
        blocking: true,
      },
      {
        step: 2,
        title: 'Identify malicious process',
        goal: 'Enumerate listeners and correlate with suspicious filenames.',
        linux: 'sudo ss -tulpn ; ps auxwww | rg -i "encrypt|cipher"',
        windows: 'netstat -abno Tasklist /svc',
        blocking: true,
      },
      {
        step: 3,
        title: 'Preserve volatile evidence',
        goal: 'Memory image before powering off infected systems.',
        linux: 'sudo /opt/tools/acquire-memory.sh —out /srv/evidence/',
        windows: 'Use approved DFIR toolkit → capture RAM → hash outputs',
        blocking: false,
      },
      {
        step: 4,
        title: 'Block C2 / exfil egress',
        goal: 'Drop routes or upstream ACLs while keeping investigation ports open.',
        linux:
          'sudo ip route add unreachable <C2_IP> ; notify NetOps via ticket SEC-URG',
        windows: 'Add host firewall denies + corp firewall ticket for egress IP',
        blocking: false,
      },
    ],
  }

export type EvidenceItem = {
  filename: string
  sizeKb: number
  addedAt: string
}

export const MOCK_EVIDENCE: EvidenceItem[] = [
  {
    filename: 'memory_fin-srv-03_20260426.lz4',
    sizeKb: 2048,
    addedAt: 'Apr 26 · pending upload',
  },
  {
    filename: 'powershell_transcript_prefetch.txt',
    sizeKb: 12,
    addedAt: 'Apr 26 · 03:05',
  },
]

export type LiveAlertFixture = {
  id: string
  severity: Severity
  ruleName: string
  host: string
  timestamp: string
}

export const MOCK_LIVE_ALERTS: LiveAlertFixture[] = [
  {
    id: 'ALRT-98211',
    severity: 'critical',
    ruleName: 'RULE-92011 · ransomware mass rename',
    host: 'fin-srv-03',
    timestamp: '02:47:11',
  },
  {
    id: 'ALRT-98206',
    severity: 'high',
    ruleName: 'RULE-81102 · brute force SSH (>500 fails)',
    host: 'edge-gw',
    timestamp: '02:12:54',
  },
  {
    id: 'ALRT-98193',
    severity: 'medium',
    ruleName: 'RULE-44021 · TOR exit egress',
    host: 'lab-win-07',
    timestamp: '01:41:07',
  },
]

export const MOCK_MTTD_DAYS = [
  { day: 'Mon', minutes: 5.8 },
  { day: 'Tue', minutes: 4.2 },
  { day: 'Wed', minutes: 4.9 },
  { day: 'Thu', minutes: 3.6 },
  { day: 'Fri', minutes: 4.1 },
]

export const MOCK_MTTR_DAYS = [
  { day: 'Mon', minutes: 24 },
  { day: 'Tue', minutes: 19 },
  { day: 'Wed', minutes: 22 },
  { day: 'Thu', minutes: 18 },
  { day: 'Fri', minutes: 21 },
]

export const MOCK_INCIDENTS_BY_MONTH = [
  { month: 'Jan', count: 2 },
  { month: 'Feb', count: 4 },
  { month: 'Mar', count: 3 },
  { month: 'Apr', count: 5 },
]

export const MOCK_SEVERITY_MIX = [
  { name: 'Critical', value: 1, fill: '#7f1d1d' },
  { name: 'High', value: 6, fill: '#9a3412' },
  { name: 'Medium', value: 8, fill: '#a16207' },
  { name: 'Low', value: 4, fill: '#14532d' },
]

/** 35-day static grid for Sprint 1 heatmap visual (counts arbitrary). */
export const MOCK_HEATMAP_DAYS: { label: number; intensity: number }[] =
  Array.from({ length: 35 }, (_, i) => ({
    label: i + 1,
    intensity: [0, 0, 1, 2, 0, 3, 1][i % 7],
  }))
