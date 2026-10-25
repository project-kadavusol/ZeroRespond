import { useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { useZeroRespond } from '../context/ZeroRespondContext'
import { PLAYBOOKS } from '../mock/fixtures'
import type { Playbook } from '../mock/fixtures'
import {
  ListChecks,
  Lock,
  KeyRound,
  ArrowUp,
  Folder,
  ArrowRight,
  Terminal,
  AppWindow,
  Copy,
  Check,
  CircleCheck,
  ShieldAlert,
  Play,
  X,
  ExternalLink,
} from 'lucide-react'

export function PlaybooksPage() {
  const navigate = useNavigate()
  const { incidents, setCurrentCaseId, createIncident, showNotif } = useZeroRespond()

  const [inspectKey, setInspectKey] = useState<string | null>(null)
  const [platform, setPlatform] = useState<'linux' | 'windows'>('linux')
  const [copiedStep, setCopiedStep] = useState<number | null>(null)

  const playbookMeta: Record<string, { icon: ReactNode; typeName: string }> = {
    ransomware: {
      icon: <Lock size={22} color="var(--accent)" />,
      typeName: 'Ransomware',
    },
    bruteforce: {
      icon: <KeyRound size={22} color="var(--accent)" />,
      typeName: 'Brute Force',
    },
    privilege: {
      icon: <ArrowUp size={22} color="var(--accent)" />,
      typeName: 'Privilege Escalation',
    },
    fileintegrity: {
      icon: <Folder size={22} color="var(--accent)" />,
      typeName: 'File Integrity',
    },
  }

  const activePlaybook: Playbook | null = inspectKey ? PLAYBOOKS[inspectKey] || null : null

  const handleCopyCmd = (stepIdx: number, cmd: string) => {
    navigator.clipboard.writeText(cmd)
    setCopiedStep(stepIdx)
    setTimeout(() => setCopiedStep(null), 1800)
    showNotif('Command Copied', 'Ready to paste into terminal / PowerShell.', 'low')
  }

  const handleLaunchDrill = (key: string) => {
    const meta = playbookMeta[key]
    const pb = PLAYBOOKS[key]
    if (!meta || !pb) return

    const newId = createIncident({
      type: meta.typeName,
      computer: key === 'ransomware' ? 'KCTLAB-WIN01' : key === 'bruteforce' ? 'srv-web-01' : key === 'privilege' ? 'srv-infra-01' : 'fileserver-02',
      desc: `Simulated drill exercise executing ${pb.name} under ISO 27035 standards.`,
      sev: key === 'ransomware' ? 'critical' : key === 'bruteforce' ? 'high' : key === 'privilege' ? 'high' : 'medium',
    })
    setCurrentCaseId(newId)
    setInspectKey(null)
    navigate(`/incidents/${newId}`)
  }

  const handleOpenActive = (caseId: string) => {
    setCurrentCaseId(caseId)
    setInspectKey(null)
    navigate(`/incidents/${caseId}`)
  }

  return (
    <div id="view-playbooks" className="view" style={{ display: 'block' }}>
      <div className="page-hd">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1>Response Playbooks &amp; Standard Operating Procedures</h1>
            <p>
              Authoritative 7-step incident response procedures aligned with NIST SP 800-61, CERT-In guidelines, and India DPDP Act 2023 §8(6).
            </p>
          </div>
        </div>
      </div>

      <div className="info-banner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ListChecks size={18} color="var(--accent)" />
          <span>
            ZeroRespond provides 4 standardized playbooks for non-specialist admins: command-level guidance, dual Linux/Windows syntax, and automatic compliance logging.
          </span>
        </div>
      </div>

      {/* 4 Playbook Cards Grid */}
      <div className="playbook-library" id="playbook-library" style={{ marginTop: '16px' }}>
        {Object.entries(PLAYBOOKS).map(([key, pb]) => {
          const meta = playbookMeta[key] || {
            icon: <ListChecks size={22} color="var(--accent)" />,
            typeName: pb.name,
          }
          const activeInc = incidents.find(
            i => i.pb === key && i.status !== 'resolved' && i.status !== 'false-positive'
          )

          return (
            <div
              key={key}
              className="playbook-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              <div>
                <div className="playbook-card-top">
                  <div className="playbook-card-icon">{meta.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div className="playbook-card-title">{pb.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                      <span className="badge badge-low" style={{ fontSize: '11px', fontWeight: 600 }}>
                        {pb.steps.length} Steps
                      </span>
                      {pb.isoPhase && (
                        <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                          {pb.isoPhase.split(':')[0]}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="playbook-card-desc" style={{ marginTop: '10px', fontSize: '13px', lineHeight: 1.5 }}>
                  {pb.desc}
                </div>

                {pb.mitreTag && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '8px 10px',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: 'var(--accent)' }}>MITRE ATT&amp;CK:</span>{' '}
                    <span style={{ color: 'var(--text-2)' }}>{pb.mitreTag}</span>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '16px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border)',
                    marginBottom: '10px',
                    fontSize: '12.5px',
                  }}
                >
                  <span style={{ color: activeInc ? 'var(--c-critical)' : 'var(--text-3)', fontWeight: activeInc ? 600 : 400 }}>
                    {activeInc ? `● Active Case: ${activeInc.id}` : '○ No active incidents'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                    onClick={() => setInspectKey(key)}
                  >
                    <ExternalLink size={13} /> Inspect SOP
                  </button>

                  {activeInc ? (
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      onClick={() => handleOpenActive(activeInc.id)}
                    >
                      <ArrowRight size={13} /> Case {activeInc.id}
                    </button>
                  ) : (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      onClick={() => handleLaunchDrill(key)}
                      title="Create a drill incident using this playbook"
                    >
                      <Play size={12} /> Run Drill
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Playbook Procedure Inspector Modal */}
      {activePlaybook && inspectKey && (
        <div
          className="modal-overlay"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}
          onClick={() => setInspectKey(null)}
        >
          <div
            className="modal"
            style={{
              maxWidth: '820px',
              width: '92%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-hd" style={{ padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldAlert size={18} color="var(--accent)" />
                  <span className="modal-title" style={{ fontSize: '17px', fontWeight: 700 }}>
                    {activePlaybook.name}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {activePlaybook.mitreTag && (
                    <span style={{ fontSize: '11.5px', color: 'var(--text-2)' }}>
                      <strong style={{ color: 'var(--accent)' }}>MITRE:</strong> {activePlaybook.mitreTag}
                    </span>
                  )}
                  {activePlaybook.isoPhase && (
                    <span style={{ fontSize: '11.5px', color: 'var(--text-3)' }}>
                      • {activePlaybook.isoPhase}
                    </span>
                  )}
                </div>
              </div>
              <button className="modal-close" onClick={() => setInspectKey(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Modal Sub-bar: Description & Platform Switcher */}
            <div
              style={{
                padding: '12px 24px',
                background: 'var(--bg-base)',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '13px', color: 'var(--text-2)', maxWidth: '520px' }}>
                {activePlaybook.desc}
              </div>

              <div className="plat-toggle" style={{ margin: 0 }}>
                <button
                  className={`plat-btn ${platform === 'linux' ? 'active' : ''}`}
                  onClick={() => setPlatform('linux')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                >
                  <Terminal size={13} /> Linux (Bash)
                </button>
                <button
                  className={`plat-btn ${platform === 'windows' ? 'active' : ''}`}
                  onClick={() => setPlatform('windows')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                >
                  <AppWindow size={13} /> Windows (PowerShell)
                </button>
              </div>
            </div>

            {/* Modal Body: Steps List */}
            <div
              className="modal-body"
              style={{
                padding: '20px 24px',
                overflowY: 'auto',
                flex: 1,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {activePlaybook.steps.map((step, idx) => {
                  const cmd = platform === 'linux' ? step.linux : step.windows
                  const isCopied = copiedStep === idx

                  return (
                    <div
                      key={idx}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '14px 16px',
                        background: 'var(--bg-surface)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: '8px',
                          flexWrap: 'wrap',
                          gap: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              background: 'var(--accent)',
                              color: '#fff',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 700,
                            }}
                          >
                            {idx + 1}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-1)' }}>
                            Step {idx + 1}: {step.title}
                          </span>
                        </div>

                        {step.phase && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background:
                                step.phase === 'Containment'
                                  ? 'var(--c-critical-bg)'
                                  : step.phase === 'Evidence'
                                  ? 'var(--c-high-bg)'
                                  : step.phase === 'Eradication'
                                  ? 'var(--c-medium-bg)'
                                  : step.phase === 'Recovery'
                                  ? 'var(--c-low-bg)'
                                  : 'var(--accent-light)',
                              color:
                                step.phase === 'Containment'
                                  ? 'var(--c-critical)'
                                  : step.phase === 'Evidence'
                                  ? 'var(--c-high)'
                                  : step.phase === 'Eradication'
                                  ? 'var(--c-medium)'
                                  : step.phase === 'Recovery'
                                  ? 'var(--c-low)'
                                  : 'var(--accent)',
                              border: '1px solid var(--border)',
                            }}
                          >
                            {step.phase}
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '10px', lineHeight: 1.5 }}>
                        {step.plain}
                      </p>

                      <div className="code-block" style={{ marginBottom: '10px' }}>
                        <button
                          className="copy-btn"
                          onClick={() => handleCopyCmd(idx, cmd)}
                          style={{
                            fontSize: '11.5px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} color="#16a34a" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copy
                            </>
                          )}
                        </button>
                        <pre style={{ margin: 0, fontSize: '12px' }}>{cmd}</pre>
                      </div>

                      <div className="step-expected">
                        <div className="exp-lbl" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <CircleCheck size={14} /> What you should see:
                        </div>
                        {step.exp}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className="modal-footer"
              style={{
                padding: '14px 24px',
                borderTop: '1px solid var(--border)',
                background: 'var(--bg-base)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
              }}
            >
              <div style={{ fontSize: '12.5px', color: 'var(--text-3)' }}>
                7 verified steps • Compliant with DPDP Act 2023 §8(6)
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-secondary"
                  onClick={() => setInspectKey(null)}
                >
                  Close
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => handleLaunchDrill(inspectKey)}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Play size={14} /> Launch Drill Case
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
