export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'resolved'

export interface EvidenceItem {
  n: string
  size?: string
  sha256?: string
  uploadedAt?: string
  attestation?: string
  category?: string
}

export const DPDP_CATEGORY_OPTIONS = [
  'Student Records',
  'Staff PII',
  'Financial & Fee Records',
  'Auth Credentials',
  'Health & Medical Data',
  'System / Network Configuration',
] as const

export interface Incident {
  id: string
  type: string
  sev: Severity
  sevLbl: string
  computer: string
  sourceIp?: string
  attackerIp?: string
  suspectPid?: string
  targetUser?: string
  modifiedFile?: string
  c2Ip?: string
  assignedTo: string
  openedTime: string
  openedFull: string
  detectedAt?: string
  breachEstAt?: string
  containedAt?: string
  resolvedAt?: string
  status: 'open' | 'investigating' | 'in-progress' | 'containing' | 'contained' | 'resolved' | 'false-positive'
  statusLbl: string
  curStep: number
  pb: 'ransomware' | 'bruteforce' | 'privilege' | 'fileintegrity'
  dataCategories: string
  dataCategoriesList?: string[]
  persons: number
  desc: string
  timeline: { t: string; a: string; type: 'done' | 'active' | 'pending'; user?: string }[]
  evidence: EvidenceItem[]
}

export interface PlaybookStep {
  title: string
  phase?: 'Identification' | 'Analysis' | 'Containment' | 'Evidence' | 'Eradication' | 'Recovery' | 'Hardening' | 'Reporting'
  plain: string
  linux: string
  windows: string
  exp: string
}

export interface Playbook {
  id?: string
  name: string
  mitreTag?: string
  isoPhase?: string
  desc?: string
  steps: PlaybookStep[]
}

export interface SystemItem {
  host: string
  type: 'endpoint' | 'server' | 'database' | 'fileserver' | 'cloud'
  typeLbl: string
  os: string
  dept: string
  status: 'online' | 'warning' | 'offline'
  lastLog: number
  alertsToday: number
  alertMax: string
}

export interface AlertItem {
  id: string
  name: string
  category: 'bf' | 'pe' | 'fim' | 'ra'
  sev: Severity
  desc: string
  computer: string
  ruleId: string
  time: string
  linkedCase?: string
}

export interface RuleItem {
  id: string
  name: string
  type: 'bf' | 'pe' | 'fim' | 'ra'
  typeLbl: string
  sev: Severity
  condition: string
  source: string
  active: boolean
  rawXml?: string
}

export interface AuditItem {
  t: string
  action: string
  ref: string
  detail: string
  user: string
}

export interface ReportHistoryItem {
  id: string
  caseId: string
  type: string
  generated: string
  status: string
}

export interface SettingsData {
  orgName: string
  orgType: string
  city: string
  state: string
  dpoName: string
  dpoEmail: string
  dpoPhone: string
  certInEmail: string
  dpdpId: string
  autoReport: string
  wazuhUrl: string
  wazuhVersion: string
  wazuhUser: string
  wazuhPass: string
}

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'IR-08',
    type: 'Ransomware',
    sev: 'critical',
    sevLbl: 'Urgent',
    computer: 'KCTLAB-WIN01',
    sourceIp: '192.168.10.45',
    attackerIp: '185.220.101.5',
    suspectPid: '4892',
    c2Ip: '185.220.101.5',
    targetUser: 'faculty_admin',
    assignedTo: 'Naveen Kumar',
    openedTime: '02:13',
    openedFull: '08 Sep 2026, 02:13 IST',
    detectedAt: '2026-09-08T02:13:00+05:30',
    breachEstAt: '2026-09-08T01:45:00+05:30',
    status: 'in-progress',
    statusLbl: 'In Progress',
    curStep: 2,
    pb: 'ransomware',
    dataCategories: 'Student Records, Staff Information',
    dataCategoriesList: ['Student Records', 'Staff PII'],
    persons: 850,
    desc: 'Files on KCTLAB-WIN01 are being encrypted by ransomware. Immediate analysis and containment are required.',
    timeline: [
      { t: '02:13', a: 'Ransomware detection received and case opened', type: 'done' },
      { t: '02:15', a: 'Affected computer disconnected from the network', type: 'done' },
      { t: '02:17', a: 'Suspicious process identified for analysis (PID 4892)', type: 'done' },
      { t: '02:19', a: 'Preserving evidence and analysing ransomware activity', type: 'active' },
    ],
    evidence: [
      {
        n: 'screenshot_desktop.png',
        size: '1.4 MB',
        sha256: '9f83acde9234bcf1038e89ad01b44ec92e92c421b8f88722a44be495f82c4710',
        uploadedAt: '02:16 IST',
        attestation: 'Section 65B IT Act verified',
        category: 'Screenshot',
      },
      {
        n: 'netstat_output.txt',
        size: '48 KB',
        sha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a',
        uploadedAt: '02:18 IST',
        attestation: 'Volatile network socket snapshot',
        category: 'Network Capture',
      },
    ],
  },
  {
    id: 'IR-07',
    type: 'Brute Force',
    sev: 'high',
    sevLbl: 'High',
    computer: 'srv-web-01',
    sourceIp: '10.0.1.20',
    attackerIp: '198.51.100.77',
    targetUser: 'admin',
    assignedTo: 'Ragul',
    openedTime: '01:47',
    openedFull: '08 Sep 2026, 01:47 IST',
    detectedAt: '2026-09-08T01:47:00+05:30',
    breachEstAt: '2026-09-08T01:30:00+05:30',
    status: 'in-progress',
    statusLbl: 'In Progress',
    curStep: 4,
    pb: 'bruteforce',
    dataCategories: 'User Credentials',
    dataCategoriesList: ['Auth Credentials'],
    persons: 240,
    desc: '500 failed login attempts were detected on srv-web-01 from a single source in 8 minutes.',
    timeline: [
      { t: '01:47', a: 'Brute force detection received and case opened', type: 'done' },
      { t: '01:49', a: 'Attacker source blocked at firewall (198.51.100.77)', type: 'done' },
      { t: '01:52', a: 'Targeted accounts locked', type: 'done' },
      { t: '01:55', a: 'Authentication logs reviewed', type: 'done' },
      { t: '02:00', a: 'Monitoring for repeated attempts', type: 'active' },
    ],
    evidence: [
      {
        n: 'auth_logs_01.txt',
        size: '320 KB',
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        uploadedAt: '01:51 IST',
        attestation: 'Wazuh auth.log extract',
        category: 'Log File',
      },
    ],
  },
  {
    id: 'IR-06',
    type: 'Privilege Escalation',
    sev: 'high',
    sevLbl: 'High',
    computer: 'srv-infra-01',
    sourceIp: '10.0.2.14',
    targetUser: 'guest_student',
    suspectPid: '9124',
    assignedTo: 'Manikandan',
    openedTime: '23:11',
    openedFull: '07 Sep 2026, 23:11 IST',
    detectedAt: '2026-09-07T23:11:00+05:30',
    breachEstAt: '2026-09-07T23:05:00+05:30',
    status: 'in-progress',
    statusLbl: 'In Progress',
    curStep: 1,
    pb: 'privilege',
    dataCategories: 'Administrator Credentials',
    dataCategoriesList: ['Auth Credentials', 'System / Network Configuration'],
    persons: 1,
    desc: 'A standard user executed an unexpected administrative command. The activity requires privilege escalation analysis.',
    timeline: [
      { t: '23:11', a: 'Privilege escalation detection received and case opened', type: 'done' },
      { t: '23:13', a: 'Affected account and command activity identified', type: 'active' },
    ],
    evidence: [],
  },
  {
    id: 'IR-05',
    type: 'File Integrity',
    sev: 'medium',
    sevLbl: 'Medium',
    computer: 'fileserver-02',
    sourceIp: '10.0.3.50',
    modifiedFile: '/etc/shadow',
    assignedTo: 'Prithiv Raj',
    openedTime: '20:33',
    openedFull: '07 Sep 2026, 20:33 IST',
    detectedAt: '2026-09-07T20:33:00+05:30',
    breachEstAt: '2026-09-07T20:15:00+05:30',
    containedAt: '2026-09-07T22:00:00+05:30',
    resolvedAt: '2026-09-07T22:05:00+05:30',
    status: 'resolved',
    statusLbl: 'Resolved',
    curStep: 7,
    pb: 'fileintegrity',
    dataCategories: 'System Configuration',
    dataCategoriesList: ['System / Network Configuration'],
    persons: 0,
    desc: 'Unexpected changes to protected system files were detected and investigated.',
    timeline: [
      { t: '20:33', a: 'File integrity detection received and case opened', type: 'done' },
      { t: '20:35', a: 'Changed files identified (/etc/shadow)', type: 'done' },
      { t: '20:37', a: 'System logs preserved', type: 'done' },
      { t: '20:45', a: 'Changes reviewed against expected configuration', type: 'done' },
      { t: '21:10', a: 'No malicious persistence identified', type: 'done' },
      { t: '22:00', a: 'System restored to approved configuration', type: 'done' },
      { t: '22:05', a: 'System stability verified and case closed', type: 'done' },
    ],
    evidence: [
      {
        n: 'file_change_report.txt',
        size: '18 KB',
        sha256: '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918',
        uploadedAt: '20:38 IST',
        attestation: 'Wazuh FIM syscheck diff',
        category: 'Log File',
      },
      {
        n: 'access_report.pdf',
        size: '220 KB',
        sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f90123456789abcdef0123456789abcdef0',
        uploadedAt: '20:46 IST',
        attestation: 'Audit log export',
        category: 'Document / Report',
      },
    ],
  },
]

export const PLAYBOOKS: Record<string, Playbook> = {
  ransomware: {
    id: 'ransomware',
    name: 'Ransomware Containment & Recovery SOP',
    mitreTag: 'T1486 (Data Encrypted for Impact), T1071 (C2)',
    isoPhase: 'ISO 27035: Phase 3 (Containment) & Phase 4 (Eradication)',
    desc: 'Emergency isolation, malware process termination, volatile memory/log preservation, C2 blocking, clean restoration, and statutory DPDP Act §8(6) reporting.',
    steps: [
      {
        title: 'Host Network Isolation',
        phase: 'Containment',
        plain: 'Immediately sever all inbound and outbound network communication to halt active encryption and lateral spread across the subnet. Keep the machine powered on so volatile memory evidence is preserved.',
        linux: 'sudo iptables -I INPUT -j DROP\nsudo iptables -I OUTPUT -j DROP',
        windows: 'netsh advfirewall set allprofiles firewallpolicy blockinbound,blockoutbound',
        exp: 'Target machine drops all network connectivity. Active lateral infection across SMB/RDP is halted.',
      },
      {
        title: 'Identify Malicious Process & Connections',
        phase: 'Identification',
        plain: 'Scan active processes and socket listeners to locate the suspicious ransomware executable, associated PID, and command-and-control (C2) destination IP.',
        linux: 'ps aux --sort=-%cpu | head -20\nss -tulpn',
        windows: 'Get-Process | Sort-Object CPU -Descending | Select -First 20\nnetstat -ano',
        exp: 'Ransomware executable name, PID, and remote connection endpoints are identified and noted.',
      },
      {
        title: 'Preserve Volatile Memory & Forensic Logs',
        phase: 'Evidence',
        plain: 'Capture volatile system logs, active process listings, and network state before altering system state. Ensure SHA-256 integrity hash is computed.',
        linux: 'cp /var/log/syslog /tmp/syslog_dump.txt\ndmesg > /tmp/kernel_dmesg.txt\nsha256sum /tmp/syslog_dump.txt',
        windows: 'Get-EventLog -LogName Security -Newest 500 | Export-Csv -Path C:\\evid.csv\nipconfig /all > C:\\net.txt',
        exp: 'Forensic files are securely dumped to /tmp or C:\\, hashed, and attached to the incident evidence locker.',
      },
      {
        title: 'Terminate Malicious Ransomware Process',
        phase: 'Eradication',
        plain: 'Force-kill the identified ransomware process to stop active encryption of student, customer, and system files.',
        linux: 'sudo kill -9 [SUSPECT_PID]',
        windows: 'Stop-Process -Id [SUSPECT_PID] -Force',
        exp: 'The suspicious PID terminates; CPU usage returns to baseline, and disk write activity stops.',
      },
      {
        title: 'Block Malicious C2 on Host & Perimeter',
        phase: 'Containment',
        plain: 'Block identified command-and-control or extraction IP addresses at host level and upstream gateway to prevent secondary payload staging.',
        linux: 'sudo iptables -I OUTPUT -d [C2_IP] -j DROP',
        windows: 'New-NetFirewallRule -DisplayName "Block Ransomware C2" -Direction Outbound -RemoteAddress [C2_IP] -Action Block',
        exp: 'Host firewall rejects all future outbound handshakes to the attacker IP.',
      },
      {
        title: 'Restore Clean Data from Offline Backup',
        phase: 'Recovery',
        plain: 'Mount verified, immutable pre-incident backup. Test restoration in dry-run mode before overwriting encrypted volumes.',
        linux: 'rsync -av --dry-run /backup/clean-snapshot/ /data/restored/',
        windows: 'wbadmin get versions -backupTarget:[TARGET]',
        exp: 'Clean backup integrity is validated; files are restored and verified before network reconnect.',
      },
      {
        title: 'DPDP Act §8(6) & CERT-In Statutory Notice',
        phase: 'Reporting',
        plain: 'Verify affected personal data categories, record estimated impacted data principals, and generate the mandatory 6-hour CERT-In incident notification.',
        linux: '# Open ZeroRespond Reports view to generate pre-filled DPDP Section 8(6) compliance filing',
        windows: '# Open ZeroRespond Reports view to generate pre-filled DPDP Section 8(6) compliance filing',
        exp: 'Statutory compliance report generated and dispatched to CERT-In and Data Protection Board within SLA.',
      },
    ],
  },
  bruteforce: {
    id: 'bruteforce',
    name: 'Brute Force & Credential Attack Defense',
    mitreTag: 'T1110.001 (Password Guessing), T1110.003 (Password Spraying)',
    isoPhase: 'ISO 27035: Phase 3 (Containment) & Phase 4 (Hardening)',
    desc: 'Attacker IP perimeter drop, targeted account emergency locking, authentication audit for successful compromise, credential reset, and fail2ban rate limiting.',
    steps: [
      {
        title: 'Block Attacking Source IP',
        phase: 'Containment',
        plain: 'Immediately drop all incoming packets from the remote source IP performing automated password guessing against SSH/RDP/Web services.',
        linux: 'sudo iptables -I INPUT -s [ATTACKER_IP] -j DROP',
        windows: 'New-NetFirewallRule -DisplayName "Block BruteForce" -Direction Inbound -RemoteAddress [ATTACKER_IP] -Action Block',
        exp: 'Immediate cessation of inbound authentication requests from the attacker IP.',
      },
      {
        title: 'Protect Targeted User Accounts',
        phase: 'Containment',
        plain: 'Temporarily lock accounts sustaining high failure volumes to protect against credential stuffing while audit is underway.',
        linux: 'sudo passwd -l [TARGET_USER]',
        windows: 'Disable-ADAccount -Identity [TARGET_USER]',
        exp: 'User account status set to locked/disabled; ongoing authorization requests denied.',
      },
      {
        title: 'Audit Authentication Logs for Successful Compromise',
        phase: 'Identification',
        plain: 'Inspect security logs to confirm whether any login succeeded from the attacking IP prior to blocking.',
        linux: "grep 'Accepted' /var/log/auth.log | tail -50\nlast -n 20",
        windows: 'Get-WinEvent -FilterHashtable @{LogName="Security";Id=4624} -MaxEvents 50',
        exp: 'Determined with certainty whether the attacker succeeded or was fully repelled at the perimeter.',
      },
      {
        title: 'Force Immediate Credential Reset',
        phase: 'Eradication',
        plain: 'Issue a mandatory credential change for targeted users using organizational strong-password policies.',
        linux: 'sudo passwd [TARGET_USER]',
        windows: 'Set-ADAccountPassword -Identity [TARGET_USER] -Reset',
        exp: 'Existing password hash invalidated; user required to configure new credentials upon re-enablement.',
      },
      {
        title: 'Enable Automated Rate Limiting & Account Lockout',
        phase: 'Hardening',
        plain: 'Deploy or reload fail2ban on Linux or configure Active Directory account lockout policies to deter repeat automated attacks.',
        linux: 'sudo systemctl restart fail2ban\nfail2ban-client status sshd',
        windows: 'net accounts /lockoutthreshold:5 /lockoutduration:30',
        exp: 'System automatically bans any IP address that exceeds 5 failed attempts within 10 minutes.',
      },
      {
        title: 'Review Scheduled Tasks & Persistence',
        phase: 'Identification',
        plain: 'Ensure the attacker did not plant persistence mechanisms (cron jobs, scheduled tasks, authorized_keys) during any successful session.',
        linux: 'crontab -l\ncat /etc/cron.*/*\ncat ~/.ssh/authorized_keys',
        windows: 'Get-ScheduledTask | Where-Object {$_.State -eq "Ready"}',
        exp: 'No unauthorized cron entries, backdoor keys, or scheduled tasks identified on the system.',
      },
      {
        title: 'Preserve Authentication Logs & Close Case',
        phase: 'Reporting',
        plain: 'Export the authentication log segment to the Evidence Locker and finalize the incident summary with zero data exfiltration verified.',
        linux: '# Attach auth log dump to case evidence and confirm stability before case closure',
        windows: '# Attach Security Event CSV to case evidence and confirm stability before case closure',
        exp: 'Incident marked Contained/Resolved with permanent immutable audit trail in ZeroRespond.',
      },
    ],
  },
  privilege: {
    id: 'privilege',
    name: 'Privilege Escalation & Unauthorized Access',
    mitreTag: 'T1068 (Exploitation for Privilege Escalation), T1078 (Valid Accounts)',
    isoPhase: 'ISO 27035: Phase 3 (Containment) & Phase 5 (Recovery)',
    desc: 'Account investigation, volatile process tree capture, admin privilege revocation, local admin audit, sudoers/registry inspection, and permission re-baselining.',
    steps: [
      {
        title: 'Identify Account & Command History',
        phase: 'Identification',
        plain: 'Investigate the suspicious account, terminal session history, and recent privileged commands executed on the system.',
        linux: 'last -F [SUSPECT_USER]\ncat ~[SUSPECT_USER]/.bash_history | tail -100',
        windows: 'Get-WinEvent -FilterHashtable @{LogName="Security";Id=4688} -MaxEvents 50',
        exp: 'Exact command line, parent process, timestamp, and target user account documented.',
      },
      {
        title: 'Preserve Audit Logs & Process Tree',
        phase: 'Evidence',
        plain: 'Save authentication records and active process hierarchy before modifying account groups or terminating running sessions.',
        linux: 'cp /var/log/auth.log /tmp/auth_evid.log\nps -ef > /tmp/process_tree.txt',
        windows: 'Get-WinEvent -LogName Security -MaxEvents 500 | Export-Csv C:\\sec_log.csv',
        exp: 'Cryptographic evidence record created for post-incident review and accountability.',
      },
      {
        title: 'Revoke Elevated Access & Terminate Active Sessions',
        phase: 'Containment',
        plain: 'Immediately strip administrator / sudo privileges from the affected user and kill active interactive shells.',
        linux: 'sudo deluser [SUSPECT_USER] sudo\nsudo pkill -u [SUSPECT_USER]',
        windows: 'Remove-LocalGroupMember -Group "Administrators" -Member [SUSPECT_USER]',
        exp: 'User account dropped from administrative groups; active rogue sessions terminated.',
      },
      {
        title: 'Audit Local Administrator Group Membership',
        phase: 'Identification',
        plain: 'Inspect group membership to ensure no hidden or secondary backdoor accounts were created with root/administrator rights.',
        linux: 'getent group sudo\ngrep ":0:" /etc/passwd',
        windows: 'Get-LocalGroupMember -Group "Administrators"',
        exp: 'Confirmed that only verified organizational administrators maintain privileged status.',
      },
      {
        title: 'Inspect Sudoers & System Startup Configuration',
        phase: 'Eradication',
        plain: 'Verify that `/etc/sudoers` or registry Run keys have not been modified to allow passwordless execution or root escalation.',
        linux: 'sudo visudo -c\nls -la /etc/sudoers.d/',
        windows: 'Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
        exp: 'Sudoers syntax verified clean; unauthorized startup registry hooks eradicated.',
      },
      {
        title: 'Restore Approved Role Permissions',
        phase: 'Recovery',
        plain: 'Re-baseline file and directory permissions for the account according to the principle of least privilege.',
        linux: 'sudo chmod 750 /home/[SUSPECT_USER]\nsudo chown -R [SUSPECT_USER]:[SUSPECT_USER] /home/[SUSPECT_USER]',
        windows: 'icacls C:\\Users\\[SUSPECT_USER] /reset /t',
        exp: 'Account permissions successfully re-aligned with organizational policy.',
      },
      {
        title: 'Document Findings & Close Incident',
        phase: 'Reporting',
        plain: 'Record whether the incident was caused by an internal policy violation, misconfiguration, or external threat actor; finalize report.',
        linux: '# Record findings in ZeroRespond responder notes and close case',
        windows: '# Record findings in ZeroRespond responder notes and close case',
        exp: 'Post-incident review completed, root cause documented, and case closed.',
      },
    ],
  },
  fileintegrity: {
    id: 'fileintegrity',
    name: 'File Integrity Monitoring (FIM) & System Tampering',
    mitreTag: 'T1565 (Data Manipulation), T1036 (Masquerading)',
    isoPhase: 'ISO 27035: Phase 2 (Analysis) & Phase 4 (Eradication)',
    desc: 'Cryptographic hash verification, modified file quarantine, change authorization check, rogue process isolation, clean restoration, and Wazuh FIM re-baselining.',
    steps: [
      {
        title: 'Identify Changed Files & Hashes',
        phase: 'Identification',
        plain: 'Review the Wazuh Syscheck detection alert to pinpoint modified system or application binaries, modification timestamps, and new cryptographic hashes.',
        linux: 'stat [MODIFIED_FILE]\nsha256sum [MODIFIED_FILE]',
        windows: 'Get-Item [MODIFIED_FILE] | Format-List *\nGet-FileHash [MODIFIED_FILE] -Algorithm SHA256',
        exp: 'Confirmed file size, modification timestamp, owner, and current SHA-256 digest.',
      },
      {
        title: 'Quarantine Modified File Copy',
        phase: 'Evidence',
        plain: 'Copy the tampered file into an isolated staging directory for forensic diff analysis before overwriting.',
        linux: 'sudo cp [MODIFIED_FILE] /tmp/quarantine_[FILE].bak\nsha256sum /tmp/quarantine_[FILE].bak',
        windows: 'Copy-Item [MODIFIED_FILE] -Destination C:\\quarantine\\ -Force',
        exp: 'Evidence copy safely quarantined with recorded SHA-256 hash in case evidence locker.',
      },
      {
        title: 'Verify Against Approved Maintenance Records',
        phase: 'Analysis',
        plain: 'Cross-reference the change timestamp with IT change management, CI/CD pipeline deployments, or package manager history (`dpkg.log`).',
        linux: 'grep -E "install|upgrade" /var/log/dpkg.log | tail -20',
        windows: 'Get-HotFix | Sort-Object InstalledOn -Descending | Select -First 10',
        exp: 'Determined whether file modification was an approved system update (false positive) or unauthorized tampering.',
      },
      {
        title: 'Isolate Process or Restrict Modifying Account',
        phase: 'Containment',
        plain: 'If the change is unauthorized, identify and terminate the process holding a file descriptor to the targeted path.',
        linux: 'sudo fuser -v [MODIFIED_FILE]\nsudo kill -9 [LOCKING_PID]',
        windows: 'Get-Process | Where-Object {$_.Path -eq [MODIFIED_FILE]}',
        exp: 'Any unauthorized service or process attempting continued modification is terminated.',
      },
      {
        title: 'Restore Approved File from Golden Image / Backup',
        phase: 'Eradication',
        plain: 'Restore the verified configuration or binary from the approved repository or golden image backup.',
        linux: 'sudo cp /backup/clean/[FILE] [TARGET_PATH]\nsudo sha256sum [TARGET_PATH]',
        windows: 'Copy-Item -Path C:\\GoldenImage\\[FILE] -Destination [TARGET_PATH] -Force',
        exp: 'Target file restored; hash matches original approved baseline.',
      },
      {
        title: 'Reset File Permissions & Lock Immutability',
        phase: 'Hardening',
        plain: 'Ensure the restored file has strict ownership (`root:root` / `Administrators`) and cannot be modified by standard users.',
        linux: 'sudo chmod 644 [TARGET_PATH]\nsudo chown root:root [TARGET_PATH]',
        windows: 'icacls [TARGET_PATH] /inheritance:r /grant:r Administrators:F',
        exp: 'File write permissions restricted exclusively to authorized root/administrator accounts.',
      },
      {
        title: 'Trigger Wazuh FIM Syscheck Baseline Scan',
        phase: 'Recovery',
        plain: 'Instruct the Wazuh agent to perform an immediate integrity scan to verify the system is synchronized with the clean database.',
        linux: 'sudo /var/ossec/bin/wazuh-control restart',
        windows: 'Restart-Service -Name WazuhSvc',
        exp: 'Wazuh Syscheck engine acknowledges baseline restored; FIM alert cleared.',
      },
    ],
  },
}

export const INITIAL_SYSTEMS: SystemItem[] = [
  { host: 'KCTLAB-WIN01', type: 'endpoint', typeLbl: 'Windows Endpoint', os: 'Windows 10', dept: 'IT Lab — Block A', status: 'online', lastLog: 12, alertsToday: 3, alertMax: 'critical' },
  { host: 'KCTLAB-WIN02', type: 'endpoint', typeLbl: 'Windows Endpoint', os: 'Windows 10', dept: 'IT Lab — Block B', status: 'online', lastLog: 28, alertsToday: 0, alertMax: '' },
  { host: 'srv-web-01', type: 'server', typeLbl: 'Linux Server', os: 'Ubuntu 22.04', dept: 'Web Services', status: 'online', lastLog: 8, alertsToday: 5, alertMax: 'high' },
  { host: 'db-server-01', type: 'database', typeLbl: 'Database Server', os: 'Ubuntu 22.04', dept: 'Data Centre', status: 'online', lastLog: 15, alertsToday: 1, alertMax: 'medium' },
  { host: 'fileserver-02', type: 'fileserver', typeLbl: 'File Server', os: 'Ubuntu 20.04', dept: 'Administration', status: 'online', lastLog: 22, alertsToday: 2, alertMax: 'medium' },
  { host: '10.0.0.22', type: 'endpoint', typeLbl: 'Windows Endpoint', os: 'Windows 11', dept: 'Faculty Workstations', status: 'online', lastLog: 41, alertsToday: 1, alertMax: 'medium' },
  { host: 'aws-ec2-prod', type: 'cloud', typeLbl: 'Cloud (AWS EC2)', os: 'Amazon Linux 2', dept: 'Cloud Infrastructure', status: 'online', lastLog: 19, alertsToday: 0, alertMax: '' },
]

export const ALERT_TEMPLATES = [
  { name: 'SSH Brute Force Attack', category: 'bf' as const, sev: 'critical' as Severity, desc: '500+ failed SSH login attempts in 8 minutes from IP 185.220.101.x. Someone is trying to break into a server by repeatedly guessing the password.', computers: ['srv-web-01', '10.0.0.14', 'KCTLAB-WIN01'], ruleId: '5763' },
  { name: 'RDP Password Guessing', category: 'bf' as const, sev: 'high' as Severity, desc: '100+ failed Remote Desktop login attempts in 5 minutes. An attacker is trying to access a Windows computer by guessing login credentials.', computers: ['KCTLAB-WIN01', 'KCTLAB-WIN02', '10.0.0.5'], ruleId: '5764' },
  { name: 'Web Login Attack', category: 'bf' as const, sev: 'high' as Severity, desc: '200+ failed web application login attempts on the student portal in 10 minutes. Automated password guessing tool detected.', computers: ['srv-web-01', '10.0.0.14'], ruleId: '5765' },
  { name: 'Unexpected Sudo Command', category: 'pe' as const, sev: 'high' as Severity, desc: 'A regular user account ran a sudo (administrator) command they have not used before. This may indicate an account takeover attempt.', computers: ['10.0.0.22', 'research-pc-01', 'srv-web-01'], ruleId: '5406' },
  { name: 'New Admin Account Created', category: 'pe' as const, sev: 'critical' as Severity, desc: 'A new administrator account was created without going through the normal approval process. This is a common technique attackers use to maintain access.', computers: ['KCTLAB-WIN01', 'admin-panel', 'srv-infra-01'], ruleId: '5902' },
  { name: 'Service Account Acting as Admin', category: 'pe' as const, sev: 'high' as Severity, desc: 'A service account (meant for automated tasks) performed an interactive login and ran administrative commands. This may indicate the account has been hijacked.', computers: ['db-server-01', 'srv-web-01'], ruleId: '5403' },
  { name: 'Critical System File Modified', category: 'fim' as const, sev: 'critical' as Severity, desc: 'A critical system configuration file (/etc/passwd or /etc/shadow) was changed without a scheduled maintenance window. Attackers modify these files to create backdoor accounts.', computers: ['srv-web-01', '10.0.0.14', 'db-server-01'], ruleId: '5501' },
  { name: 'Config File Changed Unexpectedly', category: 'fim' as const, sev: 'medium' as Severity, desc: 'An important configuration file in the /etc/ directory was modified outside of normal working hours. Unexpected config changes can indicate a system compromise.', computers: ['srv-infra-01', 'KCTLAB-WIN01', '10.0.0.22'], ruleId: '5502' },
  { name: 'System Log File Deleted', category: 'fim' as const, sev: 'high' as Severity, desc: 'A system log file was deleted or cleared. Attackers delete logs to cover their tracks and hide evidence of what they did on a system.', computers: ['fileserver-02', 'db-server-01', 'srv-web-01'], ruleId: '5503' },
  { name: 'Mass File Encryption Detected', category: 'ra' as const, sev: 'critical' as Severity, desc: '100+ files renamed to .encrypted extension in 60 seconds. This is a strong sign of a ransomware attack actively encrypting your data right now.', computers: ['KCTLAB-WIN02', 'fileserver-02', '10.0.0.5'], ruleId: '5800' },
  { name: 'Ransomware C2 Communication', category: 'ra' as const, sev: 'critical' as Severity, desc: 'A computer is connecting to a known ransomware command-and-control server (185.220.101.x). This means malware is active and receiving instructions from the attacker.', computers: ['KCTLAB-WIN01', '10.0.0.22', 'research-pc-01'], ruleId: '5801' },
  { name: 'Shadow Copy Deletion Attempted', category: 'ra' as const, sev: 'critical' as Severity, desc: 'Someone ran a command to delete Windows backup copies (shadow copies). Ransomware does this before encrypting files so victims cannot restore from backup.', computers: ['KCTLAB-WIN01', 'KCTLAB-WIN02'], ruleId: '5802' },
]



export const INITIAL_RULES: RuleItem[] = [
  { id: '5763', name: 'SSH Brute Force', type: 'bf', typeLbl: 'Brute Force', sev: 'critical', condition: '500+ failed SSH logins in 10 minutes from the same IP address', source: 'SSH / Auth Log', active: true },
  { id: '5764', name: 'RDP Password Guessing', type: 'bf', typeLbl: 'Brute Force', sev: 'high', condition: '100+ failed RDP login attempts in 5 minutes from a single source', source: 'Windows Event Log', active: true },
  { id: '5765', name: 'Web Application Login Attack', type: 'bf', typeLbl: 'Brute Force', sev: 'high', condition: '200+ failed web login attempts on a single form in 10 minutes', source: 'Web Server Log', active: true },
  { id: '5406', name: 'Unexpected Sudo Command', type: 'pe', typeLbl: 'Privilege Escalation', sev: 'high', condition: 'A regular (non-admin) user runs a sudo command they have not used before', source: 'Linux Syslog', active: true },
  { id: '5902', name: 'New Admin Account Created', type: 'pe', typeLbl: 'Privilege Escalation', sev: 'critical', condition: 'A new user account is added to the admin or wheel group outside maintenance hours', source: 'Windows Event Log', active: true },
  { id: '5403', name: 'Service Account Interactive Login', type: 'pe', typeLbl: 'Privilege Escalation', sev: 'high', condition: 'A service account performs an interactive (human) login and runs admin commands', source: 'Linux Syslog', active: true },
  { id: '5501', name: 'Critical System File Modified', type: 'fim', typeLbl: 'File Integrity', sev: 'critical', condition: 'Changes detected in /etc/passwd, /etc/shadow, or /etc/sudoers outside scheduled maintenance', source: 'File Monitor (FIM)', active: true },
  { id: '5502', name: 'Config File Changed Unexpectedly', type: 'fim', typeLbl: 'File Integrity', sev: 'medium', condition: 'Any file in /etc/ directory modified outside normal office hours (9 AM – 6 PM)', source: 'File Monitor (FIM)', active: true },
  { id: '5503', name: 'System Log File Deleted', type: 'fim', typeLbl: 'File Integrity', sev: 'high', condition: 'Any file in /var/log/ is deleted, moved, or cleared outside a scheduled log rotation', source: 'File Monitor (FIM)', active: true },
  { id: '5800', name: 'Mass File Encryption Detected', type: 'ra', typeLbl: 'Ransomware', sev: 'critical', condition: 'More than 100 files renamed to .encrypted, .locked, or .crypted extension within 60 seconds', source: 'File Monitor (FIM)', active: true },
  { id: '5801', name: 'Ransomware C2 Communication', type: 'ra', typeLbl: 'Ransomware', sev: 'critical', condition: 'Outbound connection to a known ransomware command-and-control IP or domain', source: 'Network / Firewall', active: true },
  { id: '5802', name: 'Shadow Copy Deletion', type: 'ra', typeLbl: 'Ransomware', sev: 'critical', condition: 'vssadmin delete shadows or wbadmin delete command executed by a non-administrator account', source: 'Windows Event Log', active: true },
]

export const INITIAL_AUDIT_LOG: AuditItem[] = [
  { t: '14:32', action: 'Detection received', ref: 'WZ-5800', detail: 'Mass file encryption detected on KCTLAB-WIN01', user: 'Wazuh' },
  { t: '14:33', action: 'Incident case opened', ref: 'IR-08', detail: 'Case created from ransomware detection', user: 'System' },
  { t: '14:35', action: 'Response started', ref: 'IR-08', detail: 'Ransomware response playbook started', user: 'Naveen Kumar' },
  { t: '14:39', action: 'Evidence attached', ref: 'IR-08', detail: 'netstat_output.txt added to case', user: 'Naveen Kumar' },
  { t: '15:30', action: 'Report generated', ref: 'IR-08', detail: 'Ransomware incident report generated from case record', user: 'System' },
]

export const INITIAL_REPORT_HISTORY: ReportHistoryItem[] = [
  { id: 'ZR-IR-08-2026', caseId: 'IR-08', type: 'Ransomware', generated: '08 Sep 2026, 03:20 IST', status: 'Generated' },
  { id: 'ZR-IR-05-2026', caseId: 'IR-05', type: 'File Integrity', generated: '07 Sep 2026, 22:05 IST', status: 'Generated' },
]

