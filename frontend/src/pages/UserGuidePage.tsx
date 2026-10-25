import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldCheck,
  ChevronDown,
  BookOpen,
  ListChecks,
  Scale,
  HelpCircle,
  Terminal,
  Activity,
  Server,
  Copy,
  Check,
  Lock,
  KeyRound,
  ArrowUp,
  Folder,
  Cpu,
  Clock,
  Layers,
} from 'lucide-react'

export function UserGuidePage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'overview' | 'walkthrough' | 'threats' | 'dpdp' | 'agents' | 'faq'>('overview')
  const [openFaq, setOpenFaq] = useState<Record<number, boolean>>({ 0: true, 1: true })
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(id)
    setTimeout(() => setCopiedCode(null), 1800)
  }

  const toggleFaq = (idx: number) => {
    setOpenFaq(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  const faqs = [
    {
      q: 'Do I need to be a specialized cybersecurity engineer or hacker to use ZeroRespond?',
      a: 'No, absolutely not. ZeroRespond is purposely engineered for everyday system administrators, college IT staff, and network managers. Every playbook step gives you exact, tested copy-paste commands for Linux and Windows, explains what they do in plain English, and tells you what expected output to look for in the "What you should see" box.',
    },
    {
      q: 'What should I do first when a Critical alert or active incident appears?',
      a: 'Do not panic. Navigate directly to "Incident Cases" and click on the case (e.g. IR-08). Follow Step 1 of the Playbook immediately to isolate the affected computer from the network. Disconnecting network access instantly stops ransomware encryption and halts lateral attacker spread across the subnet.',
    },
    {
      q: 'Why should I NEVER immediately pull the power plug or reboot an infected PC?',
      a: 'This is the golden rule of incident response: powering down clears volatile RAM memory. Active network socket connections, decrypted malware keys in memory, and running process trees will vanish. Without this volatile evidence, you cannot prove what data was compromised for the statutory DPDP report. Always disconnect network connectivity (cable or firewall drop) while keeping the power on.',
    },
    {
      q: 'What is the mandatory 6-Hour CERT-In reporting deadline?',
      a: 'Under Indian Computer Emergency Response Team (CERT-In) directions, cybersecurity incidents must be reported to incident@cert-in.org.in within 6 hours of discovery. ZeroRespond includes a live 6-hour countdown timer on the Dashboard and auto-generates the pre-filled CERT-In submission draft with all technical details filled in.',
    },
    {
      q: 'What if an alert is just a fellow IT staff member doing legitimate maintenance (False Positive)?',
      a: 'In the Incident Case view or Detection Feed, you can mark the alert as "False Positive" or mark individual steps as "Not Applicable". ZeroRespond will record this in the audit log and update the institution\'s false-positive rate metric so detection rules can be tuned.',
    },
    {
      q: 'Will running the "Host Isolation" command lock me out of my remote SSH or RDP session?',
      a: 'Yes, if you are connecting over the regular network. If you isolate a remote server using iptables or netsh, network traffic is blocked. In high-security environments, you should run isolation either from the physical machine console, an out-of-band management card (iLO/iDRAC), or configure an exception for the admin management subnet.',
    },
    {
      q: 'Is institutional data, student files, or server logs sent to any external cloud?',
      a: 'No. ZeroRespond is 100% self-hosted on your own Linux server. All PostgreSQL case data, logs, evidence files, and reports remain entirely on your local premises. No data ever leaves your organization.',
    },
    {
      q: 'How does the DPDP Act 2023 Section 8(6) report work?',
      a: 'When personal data (such as student marks, staff payroll, or medical records) is exposed, the law requires notifying both the Data Protection Board and affected individuals. ZeroRespond aggregates all timestamps, affected computer names, compromised data categories, and responder actions into an official legal PDF/HTML report ready for your management and Data Protection Officer (DPO).',
    },
  ]

  return (
    <div id="view-guide" className="view" style={{ display: 'block' }}>
      {/* Page Header */}
      <div className="page-hd">
        <h1>ZeroRespond User Guide &amp; Operational Manual</h1>
        <p>A practical, non-technical handbook for IT administrators, lab technicians, and responders protecting institutional systems.</p>
      </div>

      {/* Guide Hero (Without Emergency Alert) */}
      <div className="guide-hero">
        <div className="guide-hero-badge">
          <ShieldCheck size={14} /> Practical Cyber Defense Guide
        </div>
        <h2>Structured Incident Response Without Fear</h2>
        <p>
          When a cyberattack hits an organization without a dedicated 24/7 Security Operations Center (SOC), the default reaction is often panic, disorganized WhatsApp messages, and unrecorded actions. ZeroRespond changes this by giving you automated threat detection, plain-English step-by-step playbooks, and statutory Indian legal compliance in one unified system.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="guide-tabs" style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border)', marginBottom: '22px', flexWrap: 'wrap' }}>
        <button
          className={`guide-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BookOpen size={14} /> 1. Overview &amp; Daily Routine
        </button>
        <button
          className={`guide-tab ${activeTab === 'walkthrough' ? 'active' : ''}`}
          onClick={() => setActiveTab('walkthrough')}
        >
          <ListChecks size={14} /> 2. 5-Step Incident Walkthrough
        </button>
        <button
          className={`guide-tab ${activeTab === 'threats' ? 'active' : ''}`}
          onClick={() => setActiveTab('threats')}
        >
          <Layers size={14} /> 3. The 4 Threats Explained
        </button>
        <button
          className={`guide-tab ${activeTab === 'dpdp' ? 'active' : ''}`}
          onClick={() => setActiveTab('dpdp')}
        >
          <Scale size={14} /> 4. DPDP Act &amp; CERT-In Law
        </button>
        <button
          className={`guide-tab ${activeTab === 'agents' ? 'active' : ''}`}
          onClick={() => setActiveTab('agents')}
        >
          <Server size={14} /> 5. Agent Setup &amp; Systems
        </button>
        <button
          className={`guide-tab ${activeTab === 'faq' ? 'active' : ''}`}
          onClick={() => setActiveTab('faq')}
        >
          <HelpCircle size={14} /> 6. Real-World FAQ &amp; Troubleshooting
        </button>
      </div>

      {/* TAB 1: OVERVIEW & DAILY ROUTINE */}
      {activeTab === 'overview' && (
        <div className="guide-pane active">
          {/* Card: What ZeroRespond Does */}
          <div className="card" style={{ marginBottom: '18px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Activity size={18} color="var(--accent)" />
              What ZeroRespond Does in 30 Seconds
            </div>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.6, fontSize: '13.5px' }}>
              ZeroRespond connects three crucial layers that are normally separated across expensive tools:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '14px' }}>
              <div style={{ padding: '14px', background: 'var(--bg-base)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <strong style={{ color: 'var(--accent)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Cpu size={16} /> 1. Detection (Wazuh SIEM)
                </strong>
                <p style={{ fontSize: '12.5px', color: 'var(--text-2)', marginTop: '6px', lineHeight: 1.5 }}>
                  Monitors endpoints (Windows, Linux, databases) and alerts you the moment suspicious behavior like brute force or ransomware occurs.
                </p>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg-base)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <strong style={{ color: '#0891b2', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <ListChecks size={16} /> 2. Guided Response (Playbooks)
                </strong>
                <p style={{ fontSize: '12.5px', color: 'var(--text-2)', marginTop: '6px', lineHeight: 1.5 }}>
                  Tells you exactly what terminal commands to run step-by-step so you don&apos;t have to guess or improvise under stress.
                </p>
              </div>
              <div style={{ padding: '14px', background: 'var(--bg-base)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)' }}>
                <strong style={{ color: '#16a34a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scale size={16} /> 3. Compliance (DPDP &amp; CERT-In)
                </strong>
                <p style={{ fontSize: '12.5px', color: 'var(--text-2)', marginTop: '6px', lineHeight: 1.5 }}>
                  Auto-generates legal incident reports and pre-filled email notices for CERT-In within the mandatory 6-hour window.
                </p>
              </div>
            </div>
          </div>

          {/* Card: The 3-Minute Morning Routine */}
          <div className="card" style={{ marginBottom: '18px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Clock size={18} color="var(--accent)" />
              The 3-Minute Morning Checklist for Every IT Admin
            </div>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.6, fontSize: '13.5px' }}>
              Whenever you start your work day, perform these three quick checks to ensure your campus or office network is secure:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--bg-base)', borderRadius: 'var(--r-sm)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0891b2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <strong style={{ fontSize: '13.5px', color: 'var(--text-1)' }}>Check Topbar Status Indicator</strong>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-2)', marginTop: '2px' }}>
                    Verify the green pulsing dot says <strong>System Active</strong>. This confirms that the backend agent processor and event listeners are ingesting telemetry.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--bg-base)', borderRadius: 'var(--r-sm)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0891b2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <strong style={{ fontSize: '13.5px', color: 'var(--text-1)' }}>Check Monitored Systems</strong>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-2)', marginTop: '2px' }}>
                    Open <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/monitored')}>Monitored Systems</span>. Confirm all primary servers and critical faculty computers show <span className="badge badge-low">Online</span>. If any host shows &gt;60 minutes since last log, check whether it is powered off or lost internet connectivity.
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', background: 'var(--bg-base)', borderRadius: 'var(--r-sm)' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#0891b2', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', flexShrink: 0 }}>
                  3
                </div>
                <div>
                  <strong style={{ fontSize: '13.5px', color: 'var(--text-1)' }}>Review the Detection Feed</strong>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-2)', marginTop: '2px' }}>
                    Check <span style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => navigate('/alerts')}>Detection Feed</span>. Filter by <strong>Critical</strong> and <strong>High</strong>. If an alert has not been converted into an incident case, evaluate whether to click <strong>Create Incident</strong> or dismiss it.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 5-STEP INCIDENT WALKTHROUGH */}
      {activeTab === 'walkthrough' && (
        <div className="guide-pane active">
          <div className="card" style={{ marginBottom: '18px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ListChecks size={18} color="var(--accent)" />
              How to Handle an Incident from Start to Finish (5 Steps)
            </div>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.6, fontSize: '13.5px' }}>
              Follow this step-by-step workflow whenever a cyber incident is reported or detected:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
              {/* Step 1 */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', background: 'var(--bg-base)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-critical">Step 1: Alert Triage</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text-1)' }}>Review the Incoming Threat</strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                  When an alert arrives on the Dashboard or Detection Feed, read the alert name, target computer, and source IP. Click <strong>Create Incident</strong> (or click <strong>View Response</strong> if an automated case was already opened).
                </p>
              </div>

              {/* Step 2 */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', background: 'var(--bg-base)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-high">Step 2: Note the Statutory Countdown</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text-1)' }}>Check the 6-Hour Emergency Timer</strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                  At the top of the case screen, ZeroRespond starts a 6-hour statutory countdown clock. Under Indian CERT-In guidelines, high-severity breaches must be reported within 6 hours. The timer turns yellow at 3 hours and red at 1 hour remaining.
                </p>
              </div>

              {/* Step 3 */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', background: 'var(--bg-base)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-medium">Step 3: Execute Playbook Commands</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text-1)' }}>Follow the Step-by-Step SOP</strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5, marginBottom: '8px' }}>
                  Select the platform toggle (<strong>Linux</strong> or <strong>Windows</strong>). Click the <strong>Copy</strong> button on the command block, paste it into your terminal or PowerShell console on the affected computer, and compare the result with the green <em>&quot;What you should see&quot;</em> verification box. Once verified, click <strong>Done — Next Step</strong>.
                </p>
              </div>

              {/* Step 4 */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', background: 'var(--bg-base)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-low">Step 4: Attach Forensic Evidence</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text-1)' }}>Upload Logs &amp; Screenshots to Evidence Locker</strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                  In the right column, click <strong>+ Add Evidence</strong>. Select command dumps, error logs, or desktop screenshots. ZeroRespond automatically calculates the cryptographic <strong>SHA-256 hash</strong> of each file to guarantee chain-of-custody for legal audits.
                </p>
              </div>

              {/* Step 5 */}
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', background: 'var(--bg-base)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <span className="badge badge-low">Step 5: Verify &amp; Generate Compliance Report</span>
                  <strong style={{ fontSize: '14px', color: 'var(--text-1)' }}>Close Case &amp; Submit DPDP Notice</strong>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                  When all 7 steps are complete, the case marks as <strong>Contained</strong>. Click <strong>Generate &amp; View Report</strong> to produce the formal DPDP Act §8(6) report. You can download the PDF or HTML and copy the pre-filled email to send to CERT-In.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: THE 4 THREATS EXPLAINED */}
      {activeTab === 'threats' && (
        <div className="guide-pane active">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
            {/* Ransomware */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ padding: '8px', background: 'var(--c-critical-bg)', border: '1px solid var(--c-critical-border)', borderRadius: '8px', color: 'var(--c-critical)' }}>
                  <Lock size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>1. Ransomware Containment &amp; Recovery</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>MITRE T1486 (Data Encrypted for Impact)</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '12px' }}>
                <strong>What happened:</strong> A malicious program entered the machine (via infected USB, weak remote desktop password, or malicious download) and is actively encrypting files, appending strange extensions (e.g. <code>.locked</code>), and dropping ransom notes.
              </p>
              <div style={{ padding: '12px 14px', background: 'var(--c-high-bg)', border: '1px solid var(--c-high-border)', borderRadius: '6px', fontSize: '12.5px', color: 'var(--c-high)', marginBottom: '10px', lineHeight: 1.5 }}>
                <strong>CRITICAL RULE: DO NOT POWER OFF OR REBOOT THE COMPUTER.</strong> Powering off erases RAM memory where encryption keys, running malware threads, and the attacker&apos;s connection IP reside. Disconnect the LAN cable or run the host isolation firewall command instead!
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-2)' }}>
                <strong>Key Action:</strong> Execute Step 1 to isolate the host immediately, identify the process PID in Step 2, and terminate it in Step 4.
              </div>
            </div>

            {/* Brute Force */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ padding: '8px', background: 'var(--c-high-bg)', border: '1px solid var(--c-high-border)', borderRadius: '8px', color: 'var(--c-high)' }}>
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>2. Brute Force &amp; Password Guessing Attack</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>MITRE T1110 (Brute Force / Password Spraying)</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '10px' }}>
                <strong>What happened:</strong> An automated script on the internet is bombarding your SSH server (port 22) or Windows Remote Desktop (port 3389) with hundreds of username/password guesses per minute.
              </p>
              <div style={{ fontSize: '12.5px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                <strong>What to check:</strong> Run Step 3 (<code>grep &apos;Accepted&apos; /var/log/auth.log</code> or Event ID 4624). If you only see &quot;Failed password&quot;, the attacker did not break in! Simply drop their IP in the firewall and enable <code>fail2ban</code>. If you see &quot;Accepted&quot;, assume the account is compromised and reset the password immediately.
              </div>
            </div>

            {/* Privilege Escalation */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ padding: '8px', background: 'var(--c-medium-bg)', border: '1px solid var(--c-medium-border)', borderRadius: '8px', color: 'var(--c-medium)' }}>
                  <ArrowUp size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>3. Privilege Escalation &amp; Unauthorized Access</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>MITRE T1068 / T1078 (Valid Accounts &amp; Exploitation)</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '10px' }}>
                <strong>What happened:</strong> A regular student account, guest user, or hijacked web server account suddenly executed commands with root/administrator rights without authorization.
              </p>
              <div style={{ fontSize: '12.5px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                <strong>Key Action:</strong> Review command history using <code>cat ~[USER]/.bash_history</code>, revoke their sudo/admin rights in Step 3, and check <code>/etc/sudoers</code> in Step 5 to ensure they did not plant a permanent backdoor.
              </div>
            </div>

            {/* File Integrity */}
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ padding: '8px', background: 'var(--accent-light)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--accent)' }}>
                  <Folder size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-1)' }}>4. File Integrity Monitoring (FIM) &amp; Tampering</h3>
                  <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>MITRE T1565 (Data Manipulation)</span>
                </div>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.6, marginBottom: '10px' }}>
                <strong>What happened:</strong> Wazuh detected that a protected configuration file (like <code>/etc/passwd</code>, <code>/etc/shadow</code>, or an IIS web root script) was modified outside of an approved maintenance window.
              </p>
              <div style={{ fontSize: '12.5px', color: 'var(--text-2)', lineHeight: 1.5 }}>
                <strong>Key Action:</strong> Check whether an administrator performed a scheduled package upgrade. If unauthorized, quarantine the file, restore the verified golden copy from backup, and lock permissions to <code>644 root:root</code>.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DPDP ACT & CERT-IN COMPLIANCE */}
      {activeTab === 'dpdp' && (
        <div className="guide-pane active">
          <div className="card" style={{ marginBottom: '18px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Scale size={18} color="var(--accent)" />
              Indian Cybersecurity Law Demystified for IT Professionals
            </div>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.6, fontSize: '13.5px' }}>
              If your institution handles student data, staff payroll, or patient files, you are legally governed by Indian statutory mandates:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '16px' }}>
              <div style={{ padding: '16px', background: 'var(--c-critical-bg)', border: '1px solid var(--c-critical-border)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--c-critical)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} /> CERT-In 6-Hour Emergency Window
                </strong>
                <p style={{ fontSize: '12.5px', color: 'var(--text-2)', marginTop: '8px', lineHeight: 1.5 }}>
                  Under the CERT-In Directions (April 2022), organizations must report cyber incidents to <strong>incident@cert-in.org.in</strong> within <strong>6 hours of discovery</strong>. ZeroRespond pre-fills all mandatory fields (attack type, affected IPs, timestamps, actions taken) so you can dispatch the notice on time.
                </p>
              </div>

              <div style={{ padding: '16px', background: 'var(--c-high-bg)', border: '1px solid var(--c-high-border)', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--c-high)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Scale size={16} /> DPDP Act 2023 Section 8(6)
                </strong>
                <p style={{ fontSize: '12.5px', color: 'var(--text-2)', marginTop: '8px', lineHeight: 1.5 }}>
                  The Digital Personal Data Protection Act requires the <strong>Data Fiduciary</strong> (your institution) to notify both the <strong>Data Protection Board of India (DPBI)</strong> and impacted <strong>Data Principals</strong> (students/customers) when a breach occurs. ZeroRespond’s report builder is formatted specifically to satisfy Section 8(6) obligations.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px', padding: '14px', background: 'var(--bg-base)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '6px' }}>
                Mandatory Fields Included in Every ZeroRespond Report:
              </h4>
              <ul style={{ paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-2)', lineHeight: 1.7 }}>
                <li><strong>Incident Reference ID &amp; Timestamps:</strong> Discovery time, containment time, and total response duration.</li>
                <li><strong>Breach Classification:</strong> Categorized as Ransomware, Brute Force, Privilege Escalation, or FIM Tampering.</li>
                <li><strong>Categories of Data Compromised:</strong> PII, student marks, financial records, authentication credentials.</li>
                <li><strong>Estimated Persons Impacted:</strong> Number of data principals whose data was stored on the affected host.</li>
                <li><strong>Technical Mitigation Log:</strong> Chronological, immutable audit trail of playbook commands executed.</li>
                <li><strong>Data Protection Officer (DPO) Details:</strong> Institutional contact information pulled automatically from Settings.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: AGENT SETUP & SYSTEMS */}
      {activeTab === 'agents' && (
        <div className="guide-pane active">
          <div className="card" style={{ marginBottom: '18px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Server size={18} color="var(--accent)" />
              How to Connect Monitored Endpoints to ZeroRespond
            </div>
            <p style={{ color: 'var(--text-2)', lineHeight: 1.6, fontSize: '13.5px' }}>
              ZeroRespond receives telemetry from lightweight open-source Wazuh agents installed on your computers. The agent runs in the background, consumes less than 1% CPU, and streams events securely to your server.
            </p>

            {/* Linux Setup Snippet */}
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Terminal size={14} color="var(--accent)" /> Option A: Ubuntu / Debian Linux Server Setup
              </h4>
              <div className="code-block" style={{ marginTop: '8px' }}>
                <button
                  className="copy-btn"
                  onClick={() =>
                    handleCopy(
                      'curl -s https://packages.wazuh.com/key/GPG-KEY-WAZUH | sudo gpg --no-default-keyring --keyring gnupg-ring:/usr/share/keyrings/wazuh.gpg --import && sudo chmod 644 /usr/share/keyrings/wazuh.gpg\nWAZUH_MANAGER="192.168.1.100" sudo apt-get install wazuh-agent\nsudo systemctl enable wazuh-agent --now',
                      'linux_install'
                    )
                  }
                >
                  {copiedCode === 'linux_install' ? (
                    <>
                      <Check size={12} color="#16a34a" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy
                    </>
                  )}
                </button>
                <pre style={{ margin: 0, fontSize: '12px' }}>
                  {`# Replace 192.168.1.100 with your ZeroRespond server IP:\nWAZUH_MANAGER="192.168.1.100" sudo apt-get install wazuh-agent\nsudo systemctl enable wazuh-agent --now`}
                </pre>
              </div>
            </div>

            {/* Windows Setup Snippet */}
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Server size={14} color="var(--accent)" /> Option B: Windows Endpoint / Server Setup
              </h4>
              <div className="code-block" style={{ marginTop: '8px' }}>
                <button
                  className="copy-btn"
                  onClick={() =>
                    handleCopy(
                      'msiexec.exe /i wazuh-agent-4.7.0.msi /q WAZUH_MANAGER="192.168.1.100" WAZUH_REGISTRATION_SERVER="192.168.1.100"\nStart-Service -Name WazuhSvc',
                      'win_install'
                    )
                  }
                >
                  {copiedCode === 'win_install' ? (
                    <>
                      <Check size={12} color="#16a34a" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={12} /> Copy
                    </>
                  )}
                </button>
                <pre style={{ margin: 0, fontSize: '12px' }}>
                  {`# Run PowerShell as Administrator:\nmsiexec.exe /i wazuh-agent-4.7.0.msi /q WAZUH_MANAGER="192.168.1.100"\nStart-Service -Name WazuhSvc`}
                </pre>
              </div>
            </div>

            <div style={{ marginTop: '14px', fontSize: '12.5px', color: 'var(--text-2)' }}>
              Once started, the endpoint will automatically appear inside the <strong>Monitored Systems</strong> view with its IP address, operating system, and heartbeat counter.
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: FAQ & TROUBLESHOOTING */}
      {activeTab === 'faq' && (
        <div className="guide-pane active">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {faqs.map((f, i) => (
              <div key={i} className="guide-faq-item">
                <div className="guide-faq-q" onClick={() => toggleFaq(i)}>
                  <span style={{ fontWeight: 600, fontSize: '13.5px', color: 'var(--text-1)' }}>{f.q}</span>
                  <ChevronDown
                    size={16}
                    style={{
                      transform: openFaq[i] ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform .2s',
                      flexShrink: 0,
                    }}
                  />
                </div>
                {openFaq[i] && (
                  <div className="guide-faq-a" style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--text-2)' }}>
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
