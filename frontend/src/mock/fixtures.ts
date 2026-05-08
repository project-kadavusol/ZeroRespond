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
  plainSummary:
    'Many shared files were renamed with a .locked extension on fin-srv-03 — a pattern that often indicates ransomware.',
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

/** Global evidence locker — artefacts linked across cases (Sprint 1 demo). */
export type EvidenceVaultRow = {
  id: string
  filename: string
  incidentId: string
  kind: string
  sizeKb: number
  sha256short: string
  addedAt: string
}

export const MOCK_EVIDENCE_VAULT: EvidenceVaultRow[] = [
  {
    id: 'EVD-9912',
    filename: 'memory_fin-srv-03_20260426.lz4',
    incidentId: 'INV-2042',
    kind: 'Memory image',
    sizeKb: 2048000,
    sha256short: 'a91f…c883',
    addedAt: 'Apr 26, 2026 · 03:12',
  },
  {
    id: 'EVD-9908',
    filename: 'wazuh_alert_92200.json',
    incidentId: 'INV-2042',
    kind: 'Alert export',
    sizeKb: 3,
    sha256short: '74be…019a',
    addedAt: 'Apr 26, 2026 · 02:49',
  },
  {
    id: 'EVD-9891',
    filename: 'edge-gw_ssh_auth_failures.pcap.gz',
    incidentId: 'INV-2038',
    kind: 'Network capture',
    sizeKb: 18420,
    sha256short: 'c3d4…eef0',
    addedAt: 'Apr 25, 2026 · 22:41',
  },
  {
    id: 'EVD-9822',
    filename: 'powershell_transcript_prefetch.txt',
    incidentId: 'INV-2042',
    kind: 'Host artefact',
    sizeKb: 12,
    sha256short: '11aa…4499',
    addedAt: 'Apr 26, 2026 · 03:05',
  },
  {
    id: 'EVD-9755',
    filename: 'lab-win-07_prefetch_efdr.zip',
    incidentId: 'INV-2034',
    kind: 'Forensic bundle',
    sizeKb: 98200,
    sha256short: 'ffb0…12cd',
    addedAt: 'Apr 23, 2026 · 18:06',
  },
]

export type ReportVaultRow = {
  id: string
  title: string
  type: 'Executive' | 'DPDP' | 'Technical' | 'Lessons learned'
  incidentId: string | null
  createdAt: string
  pages: number
}

export const MOCK_REPORTS_VAULT: ReportVaultRow[] = [
  {
    id: 'RPT-0488',
    title: 'DPDP breach notification draft — ransomware cluster',
    type: 'DPDP',
    incidentId: 'INV-2042',
    createdAt: 'Apr 26, 2026 · 11:40',
    pages: 7,
  },
  {
    id: 'RPT-0487',
    title: 'Executive summary · Q2 IR posture',
    type: 'Executive',
    incidentId: null,
    createdAt: 'Apr 26, 2026 · 09:05',
    pages: 3,
  },
  {
    id: 'RPT-0472',
    title: 'Technical timeline & IOC package',
    type: 'Technical',
    incidentId: 'INV-2038',
    createdAt: 'Apr 25, 2026 · 16:21',
    pages: 12,
  },
  {
    id: 'RPT-0461',
    title: 'Post-incident review · phishing wave',
    type: 'Lessons learned',
    incidentId: 'INV-2041',
    createdAt: 'Apr 24, 2026 · 14:08',
    pages: 5,
  },
]

export const MOCK_ORG_PROFILE = {
  legalName: 'Kumaraguru College of Technology',
  tradingAs: 'KCT IT Dept',
  industry: 'Education',
  timezone: 'Asia/Kolkata',
  dpdpNominee: 'dpo@kct.ac.in',
  dataRegion: 'India (primary workloads)',
  supportEmail: 'soc@campus.edu',
  retentionEvidenceDays: '365',
  slackWebhookMasked: 'https://hooks.slack.com/services/····/····',
}

export type IntegrationStatus = 'connected' | 'paused'

export const MOCK_SETTINGS_INTEGRATIONS: {
  name: string
  detail: string
  status: IntegrationStatus
}[] = [
  {
    name: 'Wazuh manager',
    detail: 'Ingest RULE-81102, RULE-92011 · 50+ decoder rules · 9200/tcp',
    status: 'connected',
  },
  {
    name: 'Outbound email (SOC)',
    detail: 'Playbook notifications · incident owners',
    status: 'connected',
  },
  {
    name: 'Slack escalation',
    detail: MOCK_ORG_PROFILE.slackWebhookMasked,
    status: 'paused',
  },
]

export type LiveAlertFixture = {
  id: string
  severity: Severity
  plainSummary: string
  ruleId: string
  ruleName: string
  host: string
  timestamp: string
}

export const MOCK_LIVE_ALERTS: LiveAlertFixture[] = [
  {
    id: 'ALRT-98211',
    severity: 'critical',
    plainSummary:
      'Unusual mass file renames on fin-srv-03 — treat as possible ransomware until ruled out.',
    ruleId: 'RULE-92011',
    ruleName: 'Ransomware mass rename',
    host: 'fin-srv-03',
    timestamp: '02:47:11',
  },
  {
    id: 'ALRT-98206',
    severity: 'high',
    plainSummary:
      'More than 500 failed SSH logins on edge-gw — likely a brute-force attempt from the network.',
    ruleId: 'RULE-81102',
    ruleName: 'Brute force SSH',
    host: 'edge-gw',
    timestamp: '02:12:54',
  },
  {
    id: 'ALRT-98193',
    severity: 'medium',
    plainSummary:
      'Traffic to a known Tor exit node from lab-win-07 — may be policy bypass or unwanted software.',
    ruleId: 'RULE-44021',
    ruleName: 'Tor exit egress',
    host: 'lab-win-07',
    timestamp: '01:41:07',
  },
]

/** High-level case lifecycle for the phase strip (currentIndex = active step). */
export const MOCK_INCIDENT_PHASE_STRIP = {
  phases: [
    { id: 'detected', label: 'Detected' },
    { id: 'opened', label: 'Case opened' },
    { id: 'playbook', label: 'Playbook' },
    { id: 'containment', label: 'Containment' },
    { id: 'resolved', label: 'Resolved' },
  ] as const,
  /** 0-based; playbook step is in progress for the demo timeline. */
  currentIndex: 2,
}

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
  { name: 'Critical', value: 1, fill: '#FF4555' },
  { name: 'High', value: 6, fill: '#FF7043' },
  { name: 'Medium', value: 8, fill: '#FFB300' },
  { name: 'Low', value: 4, fill: '#3B7CFF' },
]

/** 7×24-hour grid aligned with dashboard mock heatmap */
export const MOCK_HEATMAP_WEEK_HOURS: Record<string, number[]> = {
  Mon: [
    0, 0, 1, 0, 0, 0, 0, 0, 2, 1, 0, 0, 1, 0, 0, 0, 0, 3, 1, 0, 0, 1, 0, 0,
  ],
  Tue: [
    0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 1, 0, 0, 1, 0, 0, 0, 2, 0, 0, 1, 0, 0, 0,
  ],
  Wed: [
    0, 0, 2, 0, 0, 0, 0, 0, 1, 3, 1, 0, 2, 0, 0, 0, 1, 4, 1, 0, 0, 0, 0, 0,
  ],
  Thu: [
    0, 0, 0, 1, 0, 0, 0, 0, 2, 1, 0, 1, 0, 0, 1, 0, 2, 1, 0, 0, 0, 1, 0, 0,
  ],
  Fri: [
    1, 0, 0, 0, 0, 0, 0, 2, 1, 2, 0, 0, 0, 1, 0, 0, 1, 2, 0, 1, 0, 0, 0, 0,
  ],
  Sat: [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ],
  Sun: [
    0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,
  ],
}

/** 35-day activity grid for contribution-style heatmap. Counts simulate real lab alert volume. */
export const MOCK_HEATMAP_DAYS: { label: number; count: number }[] = [
  // Week 1 (Apr 4–10) — low baseline
  { label: 1, count: 0 }, { label: 2, count: 1 }, { label: 3, count: 0 },
  { label: 4, count: 2 }, { label: 5, count: 0 }, { label: 6, count: 0 }, { label: 7, count: 0 },
  // Week 2 (Apr 11–17) — uptick mid-week
  { label: 8, count: 1 }, { label: 9, count: 3 }, { label: 10, count: 4 },
  { label: 11, count: 2 }, { label: 12, count: 1 }, { label: 13, count: 0 }, { label: 14, count: 0 },
  // Week 3 (Apr 18–24) — ransomware simulation spike
  { label: 15, count: 0 }, { label: 16, count: 2 }, { label: 17, count: 5 },
  { label: 18, count: 7 }, { label: 19, count: 6 }, { label: 20, count: 1 }, { label: 21, count: 0 },
  // Week 4 (Apr 25–May 1) — active IR period
  { label: 22, count: 2 }, { label: 23, count: 4 }, { label: 24, count: 8 },
  { label: 25, count: 5 }, { label: 26, count: 3 }, { label: 27, count: 0 }, { label: 28, count: 0 },
  // Week 5 (May 2–8) — current week, partial
  { label: 29, count: 1 }, { label: 30, count: 2 }, { label: 31, count: 3 },
  { label: 32, count: 4 }, { label: 33, count: 2 }, { label: 34, count: 0 }, { label: 35, count: 0 },
]
