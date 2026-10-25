import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useZeroRespond } from '../context/ZeroRespondContext'
import { PLAYBOOKS, DPDP_CATEGORY_OPTIONS } from '../mock/fixtures'
import type { Incident } from '../mock/fixtures'
import {
  ArrowLeft,
  ArrowRight,
  Laptop,
  Clock3,
  Check,
  TriangleAlert,
  CircleCheck,
  Paperclip,
  Plus,
  FileText,
  Terminal,
  AppWindow,
  Copy,
  HelpCircle,
  MinusCircle,
  Undo2,
  PencilLine,
  Lock,
  ShieldAlert,
  Sliders,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    incidents,
    updateStatus,
    updateIncidentDetails,
    completeStep,
    skipStep,
    undoStep,
    saveStepNote,
    stepNotes,
    updatePersons,
    openModal,
    showNotif,
  } = useZeroRespond()

  const inc = incidents.find(i => i.id === id) || incidents[0]
  const [platform, setPlatform] = useState<'linux' | 'windows'>('linux')
  const [copiedStep, setCopiedStep] = useState<number | null>(null)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)
  const [timerText, setTimerText] = useState('')
  const [timerCls, setTimerCls] = useState<'safe' | 'warn' | 'urgent' | 'expired'>('safe')
  const [isVariablesOpen, setIsVariablesOpen] = useState(true)

  // Live playbook dynamic variables state
  const [attackerIp, setAttackerIp] = useState(inc?.attackerIp || '185.220.101.44')
  const [suspectPid, setSuspectPid] = useState(inc?.suspectPid || '4192')
  const [targetUser, setTargetUser] = useState(inc?.targetUser || 'faculty_admin')
  const [modifiedFile, setModifiedFile] = useState(inc?.modifiedFile || '/etc/shadow')
  const [c2Ip, setC2Ip] = useState(inc?.c2Ip || '198.51.100.23')

  // Sync variables if incident changes
  useEffect(() => {
    if (inc) {
      setAttackerIp(inc.attackerIp || '185.220.101.44')
      setSuspectPid(inc.suspectPid || '4192')
      setTargetUser(inc.targetUser || 'faculty_admin')
      setModifiedFile(inc.modifiedFile || '/etc/shadow')
      setC2Ip(inc.c2Ip || '198.51.100.23')
    }
  }, [inc?.id])

  // Live CERT-In 6-hour deadline countdown timer
  useEffect(() => {
    if (!inc) return
    const DEADLINE_MS = 6 * 60 * 60 * 1000

    const parseOpenTime = () => {
      try {
        if (inc.detectedAt) {
          const d = new Date(inc.detectedAt)
          if (!isNaN(d.getTime())) return d
        }
        const clean = inc.openedFull.replace(' IST', '').trim()
        const d = new Date(clean + ' GMT+0530')
        if (!isNaN(d.getTime())) return d
      } catch (e) {}
      return new Date(Date.now() - 3600 * 1000)
    }

    const openedAt = parseOpenTime()

    const tick = () => {
      if (inc.status === 'resolved' || inc.status === 'false-positive') {
        setTimerText('')
        return
      }
      const elapsed = Date.now() - openedAt.getTime()
      const remaining = DEADLINE_MS - elapsed

      if (remaining <= 0) {
        setTimerText('CERT-In 6h Deadline Expired')
        setTimerCls('expired')
        return
      }

      const totalSec = Math.floor(remaining / 1000)
      const h = Math.floor(totalSec / 3600)
      const m = Math.floor((totalSec % 3600) / 60)
      const s = totalSec % 60
      const pad = (n: number) => String(n).padStart(2, '0')
      setTimerText(`${pad(h)}h ${pad(m)}m ${pad(s)}s left`)
      setTimerCls(h >= 3 ? 'safe' : h >= 1 ? 'warn' : 'urgent')
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [inc])

  if (!inc) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Incident not found</h2>
        <button className="btn btn-primary" onClick={() => navigate('/incidents')}>
          Back to Incidents
        </button>
      </div>
    )
  }

  const pb = PLAYBOOKS[inc.pb] || PLAYBOOKS.ransomware
  const total = pb.steps.length
  const pct = Math.round((inc.curStep / total) * 100)

  // Save modified dynamic variables back to incident context
  const handleSaveVariables = () => {
    updateIncidentDetails(inc.id, {
      attackerIp: attackerIp.trim(),
      suspectPid: suspectPid.trim(),
      targetUser: targetUser.trim(),
      modifiedFile: modifiedFile.trim(),
      c2Ip: c2Ip.trim(),
    })
    showNotif('Variables Saved', 'Playbook commands updated with live incident context.', 'low')
  }

  // Interpolate command using active variables
  const getInterpolatedCmd = (rawCmd: string) => {
    const curAttackerIp = attackerIp.trim() || '185.220.101.44'
    const curC2Ip = c2Ip.trim() || '198.51.100.23'
    const curPid = suspectPid.trim() || '4192'
    const curUser = targetUser.trim() || 'faculty_admin'
    const curFile = modifiedFile.trim() || '/etc/shadow'
    const fileNameOnly = curFile.split('/').pop() || 'shadow'

    return rawCmd
      .replace(/\[ATTACKER_IP\]/g, curAttackerIp)
      .replace(/\[C2_IP\]/g, curC2Ip)
      .replace(/\[SUSPECT_PID\]/g, curPid)
      .replace(/\[PID\]/g, curPid)
      .replace(/\[TARGET_USER\]/g, curUser)
      .replace(/\[SUSPECT_USER\]/g, curUser)
      .replace(/\[MODIFIED_FILE\]/g, curFile)
      .replace(/\[TARGET_PATH\]/g, curFile)
      .replace(/\[FILE\]/g, fileNameOnly)
  }

  const handleCopyCmd = (stepIdx: number, cmd: string) => {
    navigator.clipboard?.writeText(cmd)
    setCopiedStep(stepIdx)
    showNotif('Command Copied', 'Interpolated command copied to clipboard.', 'low')
    setTimeout(() => setCopiedStep(null), 2000)
  }

  const handleCopyHash = (hash: string) => {
    navigator.clipboard?.writeText(hash)
    setCopiedHash(hash)
    showNotif('Hash Copied', 'SHA-256 hash copied to clipboard.', 'low')
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const handleShowHelp = (stepIdx: number) => {
    const step = pb.steps[stepIdx]
    alert(`Help for Step ${stepIdx + 1}: ${step.title}\n\n${step.plain}\n\nExpected result:\n${step.exp}`)
  }

  const handleGoToReport = () => {
    navigate(`/reports?caseId=${inc.id}&autoGenerate=true`)
  }

  const toggleCategory = (cat: string) => {
    const currentList = inc.dataCategoriesList || []
    const updated = currentList.includes(cat)
      ? currentList.filter(c => c !== cat)
      : [...currentList, cat]
    const categoriesStr = updated.length > 0 ? updated.join(', ') : 'None specified'
    updateIncidentDetails(inc.id, {
      dataCategoriesList: updated,
      dataCategories: categoriesStr,
    })
  }

  const isCriticalOrHigh = inc.sev === 'critical' || inc.sev === 'high'

  return (
    <div id="view-case-detail" className="view" style={{ display: 'block' }}>
      <button className="back-btn" onClick={() => navigate('/incidents')}>
        <ArrowLeft size={14} /> Back to Incident Cases
      </button>

      {/* Prominent Statutory CERT-In 6-Hour SLA Alert Banner */}
      {isCriticalOrHigh && inc.status !== 'resolved' && inc.status !== 'false-positive' && timerText && (
        <div
          style={{
            background:
              timerCls === 'urgent' || timerCls === 'expired'
                ? 'var(--c-critical-bg)'
                : timerCls === 'warn'
                ? '#fffbeb'
                : 'var(--c-low-bg)',
            border: `1.5px solid ${
              timerCls === 'urgent' || timerCls === 'expired'
                ? 'var(--c-critical-border)'
                : timerCls === 'warn'
                ? '#fde68a'
                : 'var(--c-low-border)'
            }`,
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '14px',
            boxShadow: 'var(--shadow-sm)',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldAlert
              size={26}
              color={
                timerCls === 'urgent' || timerCls === 'expired'
                  ? 'var(--c-critical)'
                  : timerCls === 'warn'
                  ? '#b45309'
                  : 'var(--c-low)'
              }
            />
            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '14px',
                  color:
                    timerCls === 'urgent' || timerCls === 'expired'
                      ? 'var(--c-critical)'
                      : timerCls === 'warn'
                      ? '#92400e'
                      : 'var(--c-low)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span>CERT-In Mandatory 6-Hour Reporting Window:</span>
                <span className={`dpdp-timer ${timerCls}`} style={{ padding: '3px 10px', fontSize: '13px' }}>
                  <Clock3 size={13} /> {timerText}
                </span>
              </div>
              <div style={{ fontSize: '12.5px', color: 'var(--text-2)', marginTop: '3px' }}>
                Under CERT-In Directions 2022 (IT Act §70B), cyber incidents of severity High or Urgent must be reported to{' '}
                <strong style={{ color: 'var(--text-1)' }}>incident@cert-in.org.in</strong> within 6 hours of discovery.
              </div>
            </div>
          </div>
          <button
            className="btn btn-primary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            onClick={() => navigate(`/reports?caseId=${inc.id}&autoGenerate=true&tab=certin`)}
          >
            <FileText size={14} /> Draft CERT-In 6h Notice <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* Case Header Block */}
      <div className="case-hd-block">
        <div className="case-hd-top">
          <div>
            <div className="case-title-row">
              <span className="case-id">{inc.id}</span>
              <span className={`badge ${inc.sev}`}>
                <span className="bdot" />
                {inc.sevLbl}
              </span>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-1)' }}>
                {inc.type} Response
              </span>
            </div>
            <div className="case-meta">
              <span
                style={{ cursor: 'pointer', color: 'var(--accent)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => navigate('/monitored')}
                title="View in Monitored Systems"
              >
                <Laptop size={14} /> {inc.computer}
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <Clock3 size={14} /> Opened {inc.openedFull}
              </span>
              {timerText && (
                <span className={`dpdp-timer ${timerCls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Clock3 size={12} /> {timerText}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-2)' }}>Status:</span>
            <select
              className="status-sel"
              value={inc.status}
              onChange={e => updateStatus(inc.id, e.target.value as Incident['status'])}
            >
              <option value="open">Open</option>
              <option value="investigating">Investigating</option>
              <option value="containing">Containing</option>
              <option value="contained">Contained</option>
              <option value="resolved">Resolved</option>
              <option value="false-positive">False Positive</option>
            </select>
          </div>
        </div>
        <div className="case-desc">
          <TriangleAlert size={15} color="#d97706" style={{ display: 'inline-block', marginRight: '6px' }} />
          {inc.desc}
        </div>
      </div>

      {/* Step Progress Block */}
      <div className="step-prog">
        <div className="step-dots">
          {pb.steps.map((_, i) => {
            const st = i < inc.curStep ? 'done' : i === inc.curStep ? 'active' : 'pending'
            return (
              <div key={i} className="step-dot-wrap">
                <div className={`step-dot ${st}`}>
                  {i < inc.curStep ? <Check size={12} /> : i + 1}
                </div>
                {i < pb.steps.length - 1 && (
                  <div className={`step-conn ${i < inc.curStep ? 'done' : ''}`} />
                )}
              </div>
            )
          })}
        </div>
        <div className="prog-bar-wrap">
          <div className="prog-bar">
            <div className="prog-bar-fill" style={{ width: `${pct}%` }} />
          </div>
          <span className="prog-label">
            Step {Math.min(inc.curStep + 1, total)} of {total} — {pct}% complete
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="case-grid">
        <div id="pb-block">
          {/* Live Incident Variables / Dynamic Substitution Drawer */}
          <div
            className="card"
            style={{
              padding: '14px 18px',
              marginBottom: '16px',
              border: '1.5px solid var(--border)',
              background: 'var(--bg-surface)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
              }}
              onClick={() => setIsVariablesOpen(prev => !prev)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sliders size={16} color="var(--accent)" />
                <span style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--text-1)' }}>
                  Live Playbook Target Variables &amp; Command Interpolation
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background: 'var(--accent-light)',
                    color: 'var(--accent)',
                    fontWeight: 600,
                  }}
                >
                  Reactive
                </span>
              </div>
              <button
                type="button"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)' }}
                aria-label="Toggle variables drawer"
              >
                {isVariablesOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            </div>

            {isVariablesOpen && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: '10px' }}>
                  Update identified forensic indicators below. Playbook commands and isolation scripts will immediately substitute these variables:
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '10px', marginBottom: '10px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '3px' }}>
                      Attacker / Source IP:
                    </label>
                    <input
                      className="finput"
                      style={{ width: '100%', height: '32px', fontSize: '12px', fontFamily: 'monospace' }}
                      value={attackerIp}
                      onChange={e => setAttackerIp(e.target.value)}
                      placeholder="185.220.101.44"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '3px' }}>
                      Suspect Process PID:
                    </label>
                    <input
                      className="finput"
                      style={{ width: '100%', height: '32px', fontSize: '12px', fontFamily: 'monospace' }}
                      value={suspectPid}
                      onChange={e => setSuspectPid(e.target.value)}
                      placeholder="4192"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '3px' }}>
                      Target / Compromised User:
                    </label>
                    <input
                      className="finput"
                      style={{ width: '100%', height: '32px', fontSize: '12px', fontFamily: 'monospace' }}
                      value={targetUser}
                      onChange={e => setTargetUser(e.target.value)}
                      placeholder="faculty_admin"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '3px' }}>
                      Target File / Path:
                    </label>
                    <input
                      className="finput"
                      style={{ width: '100%', height: '32px', fontSize: '12px', fontFamily: 'monospace' }}
                      value={modifiedFile}
                      onChange={e => setModifiedFile(e.target.value)}
                      placeholder="/etc/shadow"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '3px' }}>
                      C2 Host / IP:
                    </label>
                    <input
                      className="finput"
                      style={{ width: '100%', height: '32px', fontSize: '12px', fontFamily: 'monospace' }}
                      value={c2Ip}
                      onChange={e => setC2Ip(e.target.value)}
                      placeholder="198.51.100.23"
                    />
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleSaveVariables}
                    style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px' }}
                  >
                    <Check size={13} /> Save Variables to Incident
                  </button>
                </div>
              </div>
            )}
          </div>

          {inc.curStep >= total && (
            <div
              style={{
                background: 'var(--c-low-bg)',
                border: '1.5px solid var(--c-low-border)',
                borderRadius: '10px',
                padding: '14px 18px',
                marginBottom: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                boxShadow: 'var(--shadow-sm)',
              }}
            >
              <div>
                <div style={{ fontWeight: 700, color: 'var(--c-low)', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CircleCheck size={16} /> Response Playbook Completed — Incident Contained
                </div>
                <div style={{ color: 'var(--text-2)', fontSize: '12.5px', marginTop: '3px' }}>
                  All mitigation actions executed. The statutory CERT-In 6-hour notice and DPDP §8(6) Data Principal reports are ready for dispatch.
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleGoToReport}>
                <FileText size={14} /> Generate &amp; View Reports
              </button>
            </div>
          )}

          <div className="pb-card">
            <div className="pb-hd">
              <div>
                <span className="pb-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText size={16} /> {pb.name}
                </span>
                {pb.mitreTag && (
                  <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span><strong style={{ color: 'var(--accent)' }}>MITRE:</strong> {pb.mitreTag}</span>
                    {pb.isoPhase && <span>• {pb.isoPhase}</span>}
                  </div>
                )}
              </div>
              {inc.curStep >= total ? (
                <button className="btn btn-primary btn-sm" onClick={handleGoToReport}>
                  <FileText size={13} /> Generate Report
                </button>
              ) : (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() =>
                    showNotif('Report In-Progress', 'Preliminary report view is accessible; complete remaining steps for full containment attestation.', 'low')
                  }
                >
                  <Lock size={13} /> Step {inc.curStep + 1} of {total} in progress
                </button>
              )}
            </div>

            <div>
              {pb.steps.map((step, i) => {
                const st = i < inc.curStep ? 'done' : i === inc.curStep ? 'active' : 'pending'
                const doneTime = i < inc.curStep ? inc.timeline[i + 1]?.t || '' : ''
                const rawCmd = platform === 'linux' ? step.linux : step.windows
                const cmd = getInterpolatedCmd(rawCmd)

                return (
                  <div key={i} className={`pb-step ${st}`}>
                    <div className="step-hd">
                      <div className="step-num">
                        {st === 'done' ? <Check size={14} /> : i + 1}
                      </div>
                      <div className="step-title-txt">
                        Step {i + 1}: {step.title}
                        {step.phase && (
                          <span
                            style={{
                              marginLeft: '8px',
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: 'var(--accent-light)',
                              color: 'var(--accent)',
                              border: '1px solid var(--border)',
                              display: 'inline-block',
                              verticalAlign: 'middle',
                            }}
                          >
                            {step.phase}
                          </span>
                        )}
                      </div>
                      {st === 'done' && (
                        <>
                          <span className="step-done-lbl" style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                            <Check size={11} /> Done
                          </span>
                          <span className="step-done-time">{doneTime}</span>
                        </>
                      )}
                    </div>

                    <div className="step-body" style={{ display: st !== 'pending' ? 'block' : 'none' }}>
                      <p className="step-plain">{step.plain}</p>

                      <div className="plat-toggle">
                        <button
                          className={`plat-btn ${platform === 'linux' ? 'active' : ''}`}
                          onClick={() => setPlatform('linux')}
                        >
                          <Terminal size={13} /> Linux
                        </button>
                        <button
                          className={`plat-btn ${platform === 'windows' ? 'active' : ''}`}
                          onClick={() => setPlatform('windows')}
                        >
                          <AppWindow size={13} /> Windows
                        </button>
                      </div>

                      <div className="code-block">
                        <button className="copy-btn" onClick={() => handleCopyCmd(i, cmd)}>
                          {copiedStep === i ? (
                            <>
                              <Check size={12} /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={12} /> Copy
                            </>
                          )}
                        </button>
                        <pre>{cmd}</pre>
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '3px', marginBottom: '8px' }}>
                        * Active parameters interpolated: Host: <code>{inc.computer}</code> | Attacker IP: <code>{attackerIp}</code> | PID: <code>{suspectPid}</code>
                      </div>

                      <div className="step-expected">
                        <div className="exp-lbl">
                          <CircleCheck size={14} /> What you should see:
                        </div>
                        {step.exp}
                      </div>

                      <div className="step-actions-row">
                        <button className="btn btn-ghost btn-sm" onClick={() => handleShowHelp(i)}>
                          <HelpCircle size={13} /> Need help?
                        </button>
                        {st === 'active' && (
                          <>
                            <button className="btn btn-success" onClick={() => completeStep(inc.id, i, cmd)}>
                              <Check size={14} /> Done — Next Step <ArrowRight size={14} />
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => skipStep(inc.id, i)}
                              title="Mark this step as not applicable"
                            >
                              <MinusCircle size={13} /> Not applicable
                            </button>
                          </>
                        )}
                        {st === 'done' && i === inc.curStep - 1 && (
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: 'var(--c-high)', borderColor: 'var(--c-high-border)' }}
                            onClick={() => undoStep(inc.id, i)}
                          >
                            <Undo2 size={13} /> Undo step
                          </button>
                        )}
                      </div>

                      <div className="step-notes-wrap">
                        <div className="step-notes-lbl">
                          <PencilLine size={13} /> Analyst notes for this step
                        </div>
                        <textarea
                          className="step-notes-input"
                          placeholder="Record observations, sensor log output, or exact command execution deviations..."
                          value={stepNotes[inc.id]?.[i] || ''}
                          onChange={e => saveStepNote(inc.id, i, e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div id="case-right-block" className="case-right">
          {/* Incident Timeline */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock3 size={15} /> Incident Timeline
            </div>
            <div className="timeline-list">
              {inc.timeline.map((t, idx) => (
                <div key={idx} className="tl-item">
                  <span className="tl-time">{t.t}</span>
                  <div className={`tl-dot ${t.type}`} />
                  <span className="tl-action">{t.a}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Forensic Evidence Chain of Custody */}
          <div className="card">
            <div className="card-hd">
              <div>
                <span className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Paperclip size={15} /> Forensic Evidence ({inc.evidence.length})
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-3)', display: 'block', marginTop: '2px' }}>
                  Section 65B Indian Evidence / IT Act Admissibility
                </span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => openModal('evidence', { caseId: inc.id })}>
                <Plus size={13} /> Add Evidence
              </button>
            </div>
            <div className="ev-list" style={{ marginTop: '10px' }}>
              {inc.evidence.length ? (
                inc.evidence.map((e, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '8px 10px',
                      background: 'var(--bg-base)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--r-sm)',
                      marginBottom: '6px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FileText size={14} color="var(--accent)" /> {e.n}
                        {e.size && <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({e.size})</span>}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '10px',
                          background: 'var(--c-low-bg)',
                          color: 'var(--c-low)',
                          border: '1px solid var(--c-low-border)',
                          fontWeight: 600,
                        }}
                      >
                        §65B
                      </span>
                    </div>
                    {e.sha256 ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '10.5px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                          SHA-256: {e.sha256.slice(0, 16)}...
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyHash(e.sha256!)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '11px' }}
                          title="Copy full SHA-256 hash"
                        >
                          {copiedHash === e.sha256 ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    ) : null}
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '12.5px', color: 'var(--text-3)', padding: '6px 0' }}>
                  No evidence uploaded yet. Add memory dumps, logs, or PCAP traces for statutory preservation.
                </div>
              )}
            </div>
          </div>

          {/* Incident Details & DPDP Category Chips */}
          <div className="card">
            <div className="card-title" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={15} /> Statutory Incident Profile
            </div>
            <div className="dpdp-fields">
              <div className="dpdp-row">
                <span className="dpdp-lbl">Attack Type</span>
                <span className="dpdp-val">{inc.type}</span>
              </div>
              <div className="dpdp-row">
                <span className="dpdp-lbl">Affected Asset</span>
                <span className="dpdp-val"><code>{inc.computer}</code></span>
              </div>
              <div className="dpdp-row">
                <span className="dpdp-lbl">Attacker IP</span>
                <span className="dpdp-val"><code>{attackerIp}</code></span>
              </div>
              <div className="dpdp-row" style={{ alignItems: 'flex-start' }}>
                <span className="dpdp-lbl" style={{ paddingTop: '4px' }}>
                  DPDP Data At Risk:
                </span>
                <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'flex-end' }}>
                  {DPDP_CATEGORY_OPTIONS.map(cat => {
                    const isSel = (inc.dataCategoriesList || []).includes(cat)
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        style={{
                          fontSize: '10.5px',
                          padding: '2px 7px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          background: isSel ? 'var(--accent)' : 'var(--bg-base)',
                          color: isSel ? '#ffffff' : 'var(--text-2)',
                          border: `1px solid ${isSel ? 'var(--accent)' : 'var(--border)'}`,
                          transition: 'all 0.15s ease',
                        }}
                        title={isSel ? 'Click to deselect' : 'Click to select category'}
                      >
                        {isSel ? '✓ ' : '+ '}{cat}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="dpdp-row">
                <span className="dpdp-lbl">
                  Impacted Principals
                  <span className="tip" style={{ marginLeft: '4px' }}>
                    <span className="tip-icon">i</span>
                    <span className="tip-pop">
                      Estimate the number of individuals whose personal data may have been exposed. Required for DPDP Act Section 8(6) reporting.
                    </span>
                  </span>
                </span>
                <span className="dpdp-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  ~
                  <input
                    type="number"
                    min="0"
                    value={inc.persons}
                    onChange={e => updatePersons(inc.id, parseInt(e.target.value, 10) || 0)}
                    style={{
                      width: '80px',
                      padding: '3px 7px',
                      borderRadius: 'var(--r-sm)',
                      border: '1.5px solid var(--border-2)',
                      fontFamily: 'var(--font-brand)',
                      fontSize: '13px',
                      color: 'var(--text-1)',
                      background: 'var(--bg-base)',
                    }}
                  />
                </span>
              </div>
            </div>
            <div className="divider" style={{ margin: '14px 0' }} />
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleGoToReport}>
              <FileText size={14} /> Open Statutory Reports Dispatch
            </button>
            <div style={{ fontSize: '11.5px', color: 'var(--text-3)', textAlign: 'center', marginTop: '6px' }}>
              Generates both CERT-In 6-Hour Emergency Filing &amp; DPDP §8(6) Notice
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
