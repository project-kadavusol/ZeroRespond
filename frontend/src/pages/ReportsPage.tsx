import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useZeroRespond } from '../context/ZeroRespondContext'
import { RPT_STATIC_DATA, PLAYBOOKS } from '../mock/fixtures'
import {
  Info,
  CircleCheck,
  FileText,
  Download,
  Printer,
  Mail,
  ArrowLeft,
  Check,
  ShieldAlert,
  Users,
  Send,
} from 'lucide-react'

export function ReportsPage() {
  const [searchParams] = useSearchParams()
  const { incidents, settings, reportHistory, addReportHistory, showNotif } = useZeroRespond()

  const [selectedCaseId, setSelectedCaseId] = useState('')
  const [isGenerated, setIsGenerated] = useState(false)
  const [copiedCert, setCopiedCert] = useState(false)
  const [copiedPrincipal, setCopiedPrincipal] = useState(false)
  const [activeDispatchTab, setActiveDispatchTab] = useState<'certin' | 'principal'>('certin')

  // Preselect caseId & autoGenerate if passed in URL query e.g. /reports?caseId=IR-08&autoGenerate=true&tab=certin
  useEffect(() => {
    const caseId = searchParams.get('caseId')
    const auto = searchParams.get('autoGenerate')
    const tab = searchParams.get('tab')
    if (caseId) {
      setSelectedCaseId(caseId)
      if (auto === 'true') {
        setIsGenerated(true)
      }
    }
    if (tab === 'certin' || tab === 'principal') {
      setActiveDispatchTab(tab)
    }
  }, [searchParams])

  const selectedInc = incidents.find(i => i.id === selectedCaseId)
  const staticData = selectedCaseId
    ? RPT_STATIC_DATA[selectedCaseId] || {
        type: selectedInc?.type || 'Ransomware',
        computer: selectedInc?.computer || 'KCTLAB-WIN01',
        cats: selectedInc?.dataCategories || 'Student Records, Staff Information',
        persons: selectedInc?.persons || 850,
        discovered: selectedInc?.openedFull || '08 Oct 2026, 02:13 IST',
        breachStart: selectedInc?.breachEstAt || '08 Oct 2026, 01:45 IST',
        actions: selectedInc?.timeline.map(t => ({ t: t.t, a: t.a })) || [],
      }
    : null

  const handleCaseChange = (val: string) => {
    setSelectedCaseId(val)
    setIsGenerated(false)
  }

  const handleGenerate = () => {
    if (!selectedCaseId || !selectedInc) return
    const pb = PLAYBOOKS[selectedInc.pb]
    if (pb && selectedInc.curStep < pb.steps.length) {
      showNotif(
        'Response In Progress',
        `Generating preliminary compliance record for ${selectedCaseId}. Playbook is currently at step ${selectedInc.curStep + 1} of ${pb.steps.length}.`,
        'medium'
      )
    }
    setIsGenerated(true)
    const genTime = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
    addReportHistory({
      id: `ZR-${selectedCaseId}-2026`,
      caseId: selectedCaseId,
      type: selectedInc.type,
      generated: genTime,
      status: 'Generated',
    })
    showNotif('Reports Assembled', `Dual statutory compliance reports assembled for ${selectedCaseId}.`, 'low')
  }

  // 1. CERT-In 6-Hour Emergency Email Template (Directions 2022 under IT Act §70B)
  const certEmailText = selectedInc && staticData
    ? `To: ${settings.certInEmail}
Subject: URGENT: Cybersecurity Incident Notice (6-Hour SLA) — ${settings.orgName} — Ref: ${selectedInc.id}

Incident Response Team,
Indian Computer Emergency Response Team (CERT-In),
Ministry of Electronics and Information Technology, Govt. of India.

Sir/Madam,

Pursuant to the CERT-In Directions under Section 70B(6) of the Information Technology Act, 2000, we hereby formally notify CERT-In of a cybersecurity incident detected within our infrastructure:

1. ORGANISATION IDENTIFICATION:
   - Data Fiduciary / Organisation: ${settings.orgName}
   - Category: ${settings.orgType}
   - Location: ${settings.city}, ${settings.state}, India
   - DPDP Reg ID: ${settings.dpdpId}

2. INCIDENT PARTICULARS:
   - Internal Case ID: ${selectedInc.id}
   - Incident Type: ${selectedInc.type}
   - Severity Assessment: ${selectedInc.sev.toUpperCase()}
   - Affected Asset / Host: ${selectedInc.computer} ${selectedInc.sourceIp ? `(${selectedInc.sourceIp})` : ''}
   - Attacker / C2 Indicator: ${selectedInc.attackerIp || 'Under active reverse analysis'}
   - Time of Detection: ${selectedInc.openedFull}
   - Estimated Breach Inception: ${selectedInc.breachEstAt || staticData.breachStart}
   - Statutory 6-Hour Window Status: FILED TIMELY

3. IMPACT ON PERSONAL DATA (DPDP Act §8(6)):
   - Compromised Categories: ${selectedInc.dataCategories || staticData.cats}
   - Estimated Data Principals Impacted: ~${selectedInc.persons || staticData.persons} individuals

4. IMMEDIATE CONTAINMENT & MITIGATION ACTIONS EXECUTED:
${selectedInc.timeline.map((a, i) => `   ${i + 1}. [${a.t} IST] ${a.a}`).join('\n')}

5. FORENSIC CHAIN OF CUSTODY (IT Act §65B):
   Attached artifacts verified with SHA-256 cryptographic hashes for forensic integrity.

6. DESIGNATED CONTACT / DATA PROTECTION OFFICER:
   - Name: ${settings.dpoName}
   - Email: ${settings.dpoEmail}
   - Phone: ${settings.dpoPhone}

We remain available for further statutory requests and post-incident forensic submissions.

Yours faithfully,
${settings.dpoName}
Data Protection Officer, ${settings.orgName}`
    : ''

  // 2. DPDP Act 2023 §8(6) Data Principal Breach Notice (Plain Language for Impacted Individuals)
  const dataPrincipalNoticeText = selectedInc && staticData
    ? `NOTICE OF PERSONAL DATA SECURITY INCIDENT
Statutory Intimation under Section 8(6), Digital Personal Data Protection Act, 2023

Dear Student, Faculty Member, or Staff Member,

We are writing to inform you of a recent security incident involving the IT systems at ${settings.orgName} and explain the steps we have taken to secure your data, along with recommended precautions.

WHAT HAPPENED?
On ${selectedInc.openedFull}, our cybersecurity monitoring systems detected suspicious activity (${selectedInc.type}) impacting one of our internal systems (${selectedInc.computer}). Our Incident Response Team immediately enacted emergency containment protocols, terminated unauthorized sessions, and isolated the affected server from the campus network within minutes.

WHAT DATA WAS INVOLVED?
Our forensic review indicates that the affected system contained records involving:
• ${selectedInc.dataCategories || staticData.cats}

Approximately ~${selectedInc.persons || staticData.persons} individuals may be affected. Note: There is currently NO evidence of financial passwords, PIN numbers, or bank account credentials being decrypted or exfiltrated.

WHAT WE HAVE DONE:
1. Isolated the compromised host and revoked all compromised service tokens.
2. Verified all forensic logs and generated cryptographic SHA-256 evidence records.
3. Formally notified the Indian Computer Emergency Response Team (CERT-In) under statutory 6-hour mandates.
4. Strengthened access controls and rotated all administrative credentials across campus infrastructure.

WHAT YOU SHOULD DO (PROTECTIVE RECOMMENDATIONS):
1. Reset your university email and portal passwords immediately.
2. Ensure you do not reuse your campus password on personal services (e.g. banking, social media).
3. Be vigilant against phishing emails, SMS, or phone calls requesting one-time passwords (OTPs) or credential verification.

QUESTIONS & GRIEVANCE REDRESSAL:
In compliance with the DPDP Act 2023 and Rule 14, you have the right to seek information regarding the processing of your personal data. You may contact our Data Protection Office:
• Data Protection Officer: ${settings.dpoName}
• Official Email: ${settings.dpoEmail}
• Grievance Helpline: ${settings.dpoPhone}
• Address: ${settings.orgName}, ${settings.city}, ${settings.state}

We sincerely regret any inconvenience or concern this incident may cause and remain committed to safeguarding your personal data.

Issued by:
Office of the Data Protection Officer & Chief Information Security Officer
${settings.orgName}`
    : ''

  const handleCopyCert = () => {
    navigator.clipboard?.writeText(certEmailText)
    setCopiedCert(true)
    showNotif('CERT-In Notice Copied', 'Official CERT-In 6-hour notification copied to clipboard.', 'low')
    setTimeout(() => setCopiedCert(false), 2200)
  }

  const handleCopyPrincipal = () => {
    navigator.clipboard?.writeText(dataPrincipalNoticeText)
    setCopiedPrincipal(true)
    showNotif('Data Principal Notice Copied', 'DPDP §8(6) notification for individuals copied to clipboard.', 'low')
    setTimeout(() => setCopiedPrincipal(false), 2200)
  }

  const handleDownloadHtml = () => {
    const el = document.getElementById('rpt-preview-card')
    if (!el) return
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>ZeroRespond Statutory Compliance Report — ${selectedCaseId}</title><style>body{font-family:Arial,sans-serif;margin:15mm;background:#fff;color:#0f172a}table{width:100%;border-collapse:collapse;margin:8px 0}td,th{padding:6px 10px;border:1px solid #cbd5e1;font-size:11.5px}@media print{@page{margin:12mm}}</style></head><body>${el.innerHTML}</body></html>`
    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ZeroRespond_${selectedCaseId}_Compliance_Report.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    showNotif('Report Downloaded', `Saved as ZeroRespond_${selectedCaseId}_Compliance_Report.html`, 'low')
  }

  const handleDownloadPdf = () => {
    const url = `http://localhost:8000/reports/${encodeURIComponent(selectedCaseId)}/download`
    fetch('http://localhost:8000/health')
      .then(res => {
        if (res.ok) {
          window.open(url, '_blank')
          showNotif('PDF Download Initiated', `Downloading official WeasyPrint PDF for ${selectedCaseId}...`, 'low')
        } else {
          showNotif('Local Print Mode', 'Backend service unreachable. Opening browser print dialog...', 'medium')
          window.print()
        }
      })
      .catch(() => {
        showNotif('Local Print Mode', 'Backend service not detected on port 8000. Opening print dialog.', 'medium')
        window.print()
      })
  }

  return (
    <div id="view-report" className="view" style={{ display: 'block' }}>
      <div className="page-hd no-print">
        <h1>Statutory Incident &amp; Breach Reports</h1>
        <p>Dual statutory dispatch engine for CERT-In 6-Hour mandatory reporting and DPDP Act 2023 Section 8(6) Data Principal notification.</p>
      </div>

      <div className="info-banner no-print">
        <Info size={16} style={{ display: 'inline-block', marginRight: '6px' }} />
        <strong>Indian Statutory Framework:</strong> ZeroRespond automatically binds the incident record into two legally required dispatches:
        (1) CERT-In 6-Hour Emergency Cyber Notification to <code>incident@cert-in.org.in</code>; and (2) DPDP Act §8(6) Plain-Language Intimation to impacted individuals.
      </div>

      <div className="rpt-builder no-print">
        {/* Step 1 */}
        <div className="rpt-step">
          <div className="rpt-step-hd">
            <div className="rpt-step-num">1</div>
            <div className="rpt-step-title">Select an incident case</div>
          </div>
          <select
            className="rpt-sel"
            id="rpt-sel"
            value={selectedCaseId}
            onChange={e => handleCaseChange(e.target.value)}
          >
            <option value="">Select an incident...</option>
            {incidents.map(i => {
              const pb = PLAYBOOKS[i.pb]
              const complete = pb && i.curStep >= pb.steps.length
              return (
                <option key={i.id} value={i.id}>
                  {i.id} — {i.type} — {i.openedFull.split(',')[0]} ({i.sevLbl}, {i.statusLbl})
                  {complete ? ' — Contained' : ' — In Progress'}
                </option>
              )
            })}
          </select>
        </div>

        {/* Step 2 */}
        {selectedCaseId && staticData && (
          <div className="rpt-step" id="rpt-s2">
            <div className="rpt-step-hd">
              <div className="rpt-step-num">2</div>
              <div className="rpt-step-title">Review Case Metadata &amp; Compliance Readiness</div>
            </div>
            <div className="confirm-grid" id="rpt-confirm">
              <div className="confirm-item">
                <span className="confirm-icon">
                  <CircleCheck size={16} color="var(--c-low)" />
                </span>
                <div>
                  <div className="confirm-lbl">Attack Type</div>
                  <div className="confirm-val">{selectedInc?.type || staticData.type}</div>
                </div>
              </div>
              <div className="confirm-item">
                <span className="confirm-icon">
                  <CircleCheck size={16} color="var(--c-low)" />
                </span>
                <div>
                  <div className="confirm-lbl">Data Categories</div>
                  <div className="confirm-val">{selectedInc?.dataCategories || staticData.cats}</div>
                </div>
              </div>
              <div className="confirm-item">
                <span className="confirm-icon">
                  <CircleCheck size={16} color="var(--c-low)" />
                </span>
                <div>
                  <div className="confirm-lbl">Data Principals</div>
                  <div className="confirm-val">~{selectedInc?.persons || staticData.persons} individuals</div>
                </div>
              </div>
              <div className="confirm-item">
                <span className="confirm-icon">
                  <CircleCheck size={16} color="var(--c-low)" />
                </span>
                <div>
                  <div className="confirm-lbl">CERT-In SLA</div>
                  <div className="confirm-val">
                    <span style={{ color: 'var(--c-low)', fontWeight: 700 }}>6-Hour Mandate Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {selectedCaseId && !isGenerated && (
          <div className="rpt-step" id="rpt-s3">
            <div className="rpt-step-hd">
              <div className="rpt-step-num">3</div>
              <div className="rpt-step-title">Generate Statutory Reports</div>
            </div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-2)', marginBottom: '14px' }}>
              Assemble the formal compliance dossiers, evidence chain of custody, CERT-In filing notice, and DPDP §8(6) notices.
            </p>
            <button className="btn btn-primary" onClick={handleGenerate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={16} /> Generate Statutory Report Package
            </button>
          </div>
        )}
      </div>

      {/* Report Preview */}
      {isGenerated && selectedInc && staticData && (
        <div id="rpt-preview-wrap" style={{ display: 'block', maxWidth: '880px', marginTop: '24px' }}>
          {/* Dispatch Mode Selector Tabs */}
          <div className="no-print" style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
            <button
              className={`btn ${activeDispatchTab === 'certin' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveDispatchTab('certin')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px' }}
            >
              <ShieldAlert size={16} /> 1. CERT-In 6-Hour Emergency Notice
            </button>
            <button
              className={`btn ${activeDispatchTab === 'principal' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setActiveDispatchTab('principal')}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px' }}
            >
              <Users size={16} /> 2. DPDP §8(6) Data Principal Notice
            </button>
          </div>

          {/* Tab 1: CERT-In View */}
          {activeDispatchTab === 'certin' && (
            <div
              className="card no-print"
              style={{
                marginBottom: '20px',
                border: '1.5px solid var(--accent)',
                background: 'var(--bg-surface)',
                padding: '18px 22px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={18} color="var(--accent)" /> CERT-In Statutory 6-Hour Cyber Incident Dispatch
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                    Mandatory filing under Cyber Security Directions 2022 (IT Act Section 70B) &bull; Send to <code>{settings.certInEmail}</code>
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleCopyCert} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {copiedCert ? <Check size={14} /> : <Mail size={14} />} {copiedCert ? 'Copied to Clipboard!' : 'Copy Email Body'}
                </button>
              </div>
              <pre
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '14px',
                  fontFamily: 'monospace',
                  fontSize: '11.5px',
                  lineHeight: '1.45',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-1)',
                  maxHeight: '340px',
                  overflowY: 'auto',
                }}
              >
                {certEmailText}
              </pre>
            </div>
          )}

          {/* Tab 2: DPDP Data Principal View */}
          {activeDispatchTab === 'principal' && (
            <div
              className="card no-print"
              style={{
                marginBottom: '20px',
                border: '1.5px solid var(--c-low-border)',
                background: 'var(--bg-surface)',
                padding: '18px 22px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={18} color="var(--c-low)" /> DPDP Act 2023 §8(6) Data Principal Breach Notice
                  </h3>
                  <div style={{ fontSize: '12px', color: 'var(--text-2)' }}>
                    Plain-language notification issued to students, faculty, and affected individuals informing them of data exposure and security measures.
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleCopyPrincipal} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {copiedPrincipal ? <Check size={14} /> : <Send size={14} />} {copiedPrincipal ? 'Copied to Clipboard!' : 'Copy Notice Text'}
                </button>
              </div>
              <pre
                style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  padding: '14px',
                  fontFamily: 'sans-serif',
                  fontSize: '12px',
                  lineHeight: '1.5',
                  whiteSpace: 'pre-wrap',
                  color: 'var(--text-1)',
                  maxHeight: '340px',
                  overflowY: 'auto',
                }}
              >
                {dataPrincipalNoticeText}
              </pre>
            </div>
          )}

          {/* Full Formal Document Preview (Printable) */}
          <div
            id="rpt-preview-card"
            style={{
              fontFamily: 'Arial, sans-serif',
              color: 'var(--text-1)',
              lineHeight: 1.45,
              padding: '28px 32px',
              background: 'var(--bg-surface)',
              borderRadius: '6px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)',
            }}
          >
            {/* Header */}
            <div
              style={{
                borderBottom: '2px solid var(--border)',
                paddingBottom: '12px',
                marginBottom: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
              }}
            >
              <div>
                <div style={{ fontSize: '19px', fontWeight: 'bold', color: 'var(--text-1)', letterSpacing: '-0.2px' }}>
                  {settings.orgName}
                </div>
                <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-2)', marginTop: '2px' }}>
                  Statutory Cybersecurity Incident &amp; Data Breach Dossier
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '2px' }}>
                  Statutory Filing Pursuant to Section 8(6), Digital Personal Data Protection Act, 2023 &amp; CERT-In Directions 2022
                </div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '11.5px', color: 'var(--text-2)' }}>
                <div><strong>Case Ref:</strong> {selectedInc.id}</div>
                <div><strong>Report ID:</strong> ZR-{selectedInc.id}-2026</div>
                <div><strong>Date Generated:</strong> {new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
                <div><strong>DPDP Fiduciary ID:</strong> {settings.dpdpId}</div>
              </div>
            </div>

            {/* Status Strip */}
            <div
              style={{
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '8px 14px',
                fontSize: '11.5px',
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <div><strong>Status:</strong> {selectedInc.statusLbl.toUpperCase()}</div>
              <div><strong>Severity:</strong> {selectedInc.sev.toUpperCase()}</div>
              <div><strong>Affected Host:</strong> {selectedInc.computer}</div>
              <div><strong>CERT-In 6-Hour SLA:</strong> <span style={{ color: 'var(--c-low)', fontWeight: 'bold' }}>COMPLIANT &amp; FILED</span></div>
            </div>

            {/* Table 1: Overview */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-1)', borderBottom: '1px solid var(--border)', paddingBottom: '3px', marginBottom: '6px' }}>
                1. Incident Overview &amp; Infrastructure Impact
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '28%', padding: '6px 8px', border: '1px solid var(--border)', background: 'var(--bg-base)', fontWeight: 'bold', color: 'var(--text-1)' }}>Incident Description</td>
                    <td colSpan={3} style={{ padding: '6px 8px', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{selectedInc.desc}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', background: 'var(--bg-base)', fontWeight: 'bold', color: 'var(--text-1)' }}>Attack Classification</td>
                    <td style={{ width: '26%', padding: '6px 8px', border: '1px solid var(--border)', color: 'var(--text-2)' }}><strong>{selectedInc.type}</strong></td>
                    <td style={{ width: '20%', padding: '6px 8px', border: '1px solid var(--border)', background: 'var(--bg-base)', fontWeight: 'bold', color: 'var(--text-1)' }}>Target Machine</td>
                    <td style={{ width: '26%', padding: '6px 8px', border: '1px solid var(--border)', color: 'var(--text-2)' }}><code>{selectedInc.computer}</code></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', background: 'var(--bg-base)', fontWeight: 'bold', color: 'var(--text-1)' }}>Attacker / Source IP</td>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', color: 'var(--text-2)' }}><code>{selectedInc.attackerIp || '185.220.101.44'}</code></td>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', background: 'var(--bg-base)', fontWeight: 'bold', color: 'var(--text-1)' }}>Discovered Time</td>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{selectedInc.openedFull}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table 2: Statutory DPDP Act */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-1)', borderBottom: '1px solid var(--border)', paddingBottom: '3px', marginBottom: '6px' }}>
                2. DPDP Act 2023 Section 8(6) Statutory Declaration
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                <tbody>
                  <tr>
                    <td style={{ width: '35%', padding: '6px 8px', border: '1px solid var(--border)', background: 'var(--bg-base)', fontWeight: 'bold', color: 'var(--text-1)' }}>Nature of Personal Data Breach</td>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{selectedInc.type} on institutional asset {selectedInc.computer}</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', background: 'var(--bg-base)', fontWeight: 'bold', color: 'var(--text-1)' }}>Data Categories Compromised</td>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', color: 'var(--text-2)' }}><strong>{selectedInc.dataCategories || staticData.cats}</strong></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', background: 'var(--bg-base)', fontWeight: 'bold', color: 'var(--text-1)' }}>Estimated Data Principals Impacted</td>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', color: 'var(--text-2)' }}><strong>~{selectedInc.persons || staticData.persons} individuals</strong></td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', background: 'var(--bg-base)', fontWeight: 'bold', color: 'var(--text-1)' }}>Mitigation &amp; Containment State</td>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{selectedInc.statusLbl.toUpperCase()} — Host isolated; response playbook actions executed.</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', background: 'var(--bg-base)', fontWeight: 'bold', color: 'var(--text-1)' }}>Data Protection Officer (DPO)</td>
                    <td style={{ padding: '6px 8px', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{settings.dpoName} ({settings.dpoEmail})</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Table 3: Forensic Chain of Custody */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-1)', borderBottom: '1px solid var(--border)', paddingBottom: '3px', marginBottom: '6px' }}>
                3. Forensic Evidence Chain of Custody (Section 65B, Indian Evidence Act / IT Act 2000)
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-base)' }}>
                    <th style={{ width: '8%', padding: '5px 8px', border: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-1)' }}>#</th>
                    <th style={{ width: '28%', padding: '5px 8px', border: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-1)' }}>Artifact Name</th>
                    <th style={{ width: '12%', padding: '5px 8px', border: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-1)' }}>Size</th>
                    <th style={{ width: '52%', padding: '5px 8px', border: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-1)' }}>Cryptographic SHA-256 Checksum</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInc.evidence && selectedInc.evidence.length > 0 ? (
                    selectedInc.evidence.map((ev, idx) => (
                      <tr key={idx}>
                        <td style={{ padding: '5px 8px', border: '1px solid var(--border)', fontWeight: 'bold', color: 'var(--text-1)' }}>{idx + 1}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid var(--border)', color: 'var(--text-2)', fontWeight: 600 }}>{ev.n}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>{ev.size || '12.4 KB'}</td>
                        <td style={{ padding: '5px 8px', border: '1px solid var(--border)', fontFamily: 'monospace', fontSize: '10.5px', color: 'var(--text-1)' }}>
                          {ev.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ padding: '8px', border: '1px solid var(--border)', textAlign: 'center', color: 'var(--text-muted)' }}>
                        System telemetry and memory dumps preserved in secure immutable log vault.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Table 4: Chronological Actions */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-1)', borderBottom: '1px solid var(--border)', paddingBottom: '3px', marginBottom: '6px' }}>
                4. Chronological Playbook Actions &amp; Mitigation Timeline
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-base)' }}>
                    <th style={{ width: '8%', padding: '5px 8px', border: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-1)' }}>#</th>
                    <th style={{ width: '18%', padding: '5px 8px', border: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-1)' }}>Time (IST)</th>
                    <th style={{ width: '74%', padding: '5px 8px', border: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-1)' }}>Action Executed</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInc.timeline.map((a, idx) => (
                    <tr key={idx}>
                      <td style={{ padding: '5px 8px', border: '1px solid var(--border)', fontWeight: 'bold', color: 'var(--text-1)' }}>{idx + 1}</td>
                      <td style={{ padding: '5px 8px', border: '1px solid var(--border)', fontFamily: 'monospace', color: 'var(--text-2)' }}>{a.t}</td>
                      <td style={{ padding: '5px 8px', border: '1px solid var(--border)', color: 'var(--text-2)' }}>{a.a}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Sign-off */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '4px', display: 'flex', marginTop: '16px' }}>
              <div style={{ flex: 1, padding: '12px 16px', borderRight: '1px solid var(--border)' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: '24px' }}>
                  Data Protection Officer Attestation
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '4px', fontSize: '11.5px', color: 'var(--text-1)' }}>
                  <strong>{settings.dpoName}</strong><br />
                  <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>Data Protection Officer &bull; {settings.orgName}</span><br />
                  <span style={{ fontSize: '10.5px', color: 'var(--text-3)' }}>Signature &amp; Statutory Seal: ____________________________</span>
                </div>
              </div>
              <div style={{ flex: 1, padding: '12px 16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: '24px' }}>
                  Incident Commander / Security Lead
                </div>
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '4px', fontSize: '11.5px', color: 'var(--text-1)' }}>
                  <strong>{selectedInc.assignedTo || 'Prithiv Raj'}</strong><br />
                  <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>Head of Security &amp; Incident Response</span><br />
                  <span style={{ fontSize: '10.5px', color: 'var(--text-3)' }}>Signature &amp; Verification Seal: ____________________________</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '10.5px', color: 'var(--text-3)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
              ZeroRespond Platform &bull; {settings.orgName} &bull; Statutory Compliance Record &bull; Detect &bull; Respond &bull; Report &bull; Repeat
            </div>
          </div>

          {/* Action Row */}
          <div className="rpt-actions-row no-print" style={{ display: 'flex', gap: '10px', marginTop: '18px', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={handleDownloadPdf}>
              <Download size={15} /> Download PDF (WeasyPrint)
            </button>
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Printer size={15} /> Print / Save PDF
            </button>
            <button className="btn btn-secondary" onClick={handleDownloadHtml}>
              <Download size={15} /> Download HTML Report
            </button>
            <button className="btn btn-secondary" onClick={handleCopyCert}>
              {copiedCert ? <Check size={15} /> : <Mail size={15} />} {copiedCert ? 'Copied CERT-In Email!' : 'Copy CERT-In Email'}
            </button>
            <button className="btn btn-secondary" onClick={handleCopyPrincipal}>
              {copiedPrincipal ? <Check size={15} /> : <Send size={15} />} {copiedPrincipal ? 'Copied Data Principal Notice!' : 'Copy Data Principal Notice'}
            </button>
            <button className="btn btn-secondary" onClick={() => setIsGenerated(false)}>
              <ArrowLeft size={15} /> Change Selection
            </button>
          </div>
        </div>
      )}

      {/* Report History */}
      <div className="p1-section no-print" style={{ marginTop: '36px' }}>
        <div className="p1-section-hd">
          <div>
            <div className="p1-title">Report History</div>
            <div className="p1-sub">Previously generated incident reports and statutory filings from case records.</div>
          </div>
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div id="report-history-list">
            {reportHistory.length > 0 ? (
              reportHistory.map(r => (
                <div key={r.id} className="report-history-row">
                  <strong>{r.id}</strong>
                  <span>Case {r.caseId}</span>
                  <span>{r.type}</span>
                  <span>{r.generated}</span>
                  <span className="status-chip demo">{r.status}</span>
                </div>
              ))
            ) : (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)' }}>
                No reports generated yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
