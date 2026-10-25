import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useZeroRespond } from '../context/ZeroRespondContext'
import type { AlertItem, Severity } from '../mock/fixtures'
import {
  Info,
  Pause,
  Play,
  Trash2,
  Download,
  Laptop,
  HelpCircle,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  Lock,
  KeyRound,
  ArrowUp,
  Folder,
} from 'lucide-react'

export function AlertsPage() {
  const navigate = useNavigate()
  const { alerts, dismissAlert, clearAlerts, createIncident } = useZeroRespond()

  const [sevFilter, setSevFilter] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [search, setSearch] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})

  const toggleExpand = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const categoryDetails: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
    bf: { label: 'Brute Force', icon: <KeyRound size={13} />, cls: 'bf' },
    pe: { label: 'Privilege Escalation', icon: <ArrowUp size={13} />, cls: 'pe' },
    fim: { label: 'File Integrity', icon: <Folder size={13} />, cls: 'fim' },
    ra: { label: 'Ransomware', icon: <Lock size={13} />, cls: 'ra' },
  }

  const explanations: Record<string, string> = {
    critical:
      'This is a high-priority warning that needs immediate attention right now. If not handled quickly, the attacker could cause significant damage to your systems and data.',
    high:
      'This warning needs attention soon. While not an immediate emergency, delaying your response could allow the situation to worsen significantly.',
    medium:
      'This is a moderate concern worth investigating. It is not an emergency, but should be reviewed within a few hours.',
    low:
      'This is a low-priority notice. Worth reviewing when time allows, but not urgent. It may be normal activity or a minor misconfiguration.',
  }

  const filteredAlerts = alerts.filter(a => {
    if (sevFilter && a.sev !== sevFilter) return false
    if (catFilter && a.category !== catFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        a.name.toLowerCase().includes(q) ||
        a.desc.toLowerCase().includes(q) ||
        a.computer.toLowerCase().includes(q)
      )
    }
    return true
  })

  const exportAlerts = () => {
    if (!alerts.length) return
    const lines = ['ID,Time,Severity,Attack Type,Name,Computer,Rule ID,Description']
    alerts.forEach(a => {
      lines.push(
        [
          a.id,
          a.time,
          a.sev,
          categoryDetails[a.category]?.label || a.category,
          `"${a.name}"`,
          a.computer,
          a.ruleId || '',
          `"${a.desc}"`,
        ].join(',')
      )
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ZeroRespond-detections-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleStartResponse = (alert: AlertItem) => {
    const catNames: Record<string, string> = {
      bf: 'Brute Force',
      pe: 'Privilege Escalation',
      fim: 'File Integrity',
      ra: 'Ransomware',
    }
    const attackType = catNames[alert.category] || 'Ransomware'
    const newId = createIncident({
      type: attackType,
      computer: alert.computer,
      desc: alert.desc,
      sev: alert.sev as Severity,
    })
    navigate(`/incidents/${newId}`)
  }

  return (
    <div id="view-alerts" className="view" style={{ display: 'block' }}>
      <div className="page-hd">
        <h1>Detection Feed</h1>
        <p>Wazuh detections received by ZeroRespond. New detections appear at the top as they are received.</p>
      </div>

      <div className="info-banner">
        <Info size={16} style={{ display: 'inline-block', marginRight: '6px' }} />
        Warnings are raised when a detection rule matches an event. Select{' '}
        <strong>"View details"</strong> to review the detection and{' '}
        <strong>"Start Response"</strong> to open the response workflow.
      </div>

      <div className="al-filters">
        <select
          className="fselect"
          id="f-sev"
          value={sevFilter}
          onChange={e => setSevFilter(e.target.value)}
        >
          <option value="">All urgency levels</option>
          <option value="critical">Urgent only</option>
          <option value="high">High only</option>
          <option value="medium">Medium only</option>
          <option value="low">Low only</option>
        </select>

        <select
          className="fselect"
          id="f-cat"
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
        >
          <option value="">All attack types</option>
          <option value="bf">Brute Force</option>
          <option value="pe">Privilege Escalation</option>
          <option value="fim">File Integrity</option>
          <option value="ra">Ransomware</option>
        </select>

        <input
          className="finput"
          type="text"
          placeholder="Search warnings..."
          id="f-search"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setIsPaused(!isPaused)}
        >
          {isPaused ? <Play size={13} /> : <Pause size={13} />} {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button className="btn btn-secondary btn-sm" onClick={clearAlerts}>
          <Trash2 size={13} /> Clear
        </button>

        <button className="btn btn-secondary btn-sm" onClick={exportAlerts}>
          <Download size={13} /> Export
        </button>
      </div>

      <div className="alert-feed" id="alert-feed">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(a => {
            const cat = categoryDetails[a.category]
            const isExpanded = !!expandedCards[a.id]
            const sevLbl = a.sev === 'critical' ? 'Urgent' : a.sev.charAt(0).toUpperCase() + a.sev.slice(1)

            return (
              <div key={a.id} className={`al-card ${a.sev} ${isExpanded ? 'expanded' : ''}`}>
                <div className="al-card-hd">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span className={`badge ${a.sev}`}>
                      <span className="bdot" />
                      {sevLbl}
                    </span>
                    {cat && (
                      <span className={`al-type-pill ${cat.cls}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {cat.icon} {cat.label}
                      </span>
                    )}
                    <span className="al-card-title">{a.name}</span>
                  </div>
                  <span className="al-card-time">{a.time}</span>
                </div>

                <div className="al-card-desc">{a.desc}</div>

                <div
                  className="al-card-host"
                  style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Laptop size={14} color="var(--accent)" /> Affected computer: <strong>{a.computer}</strong>
                  </span>
                  <span style={{ color: 'var(--text-3)', fontSize: '12px' }}>
                    Rule ID: {a.ruleId}
                  </span>
                </div>

                {isExpanded && (
                  <div className="explain-panel" style={{ display: 'block', marginTop: '12px' }}>
                    <strong>Detection details</strong>
                    <br />
                    {explanations[a.sev]}
                    {cat && (
                      <>
                        <br />
                        <br />
                        <strong>Attack type — {cat.label}:</strong> This warning was triggered by a detection rule for <em>{cat.label}</em> attacks. Inspect the rule conditions in Detection Rules to see trigger logic.
                      </>
                    )}
                  </div>
                )}

                <div className="al-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => toggleExpand(a.id)}
                  >
                    <HelpCircle size={13} /> {isExpanded ? 'Hide details' : 'View details'}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => dismissAlert(a.id)}
                  >
                    Dismiss
                  </button>
                  {a.linkedCase ? (
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => navigate(`/incidents/${a.linkedCase}`)}
                    >
                      <ClipboardList size={13} /> Case {a.linkedCase} open — View
                    </button>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleStartResponse(a)}
                    >
                      Start Response <ArrowRight size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })
        ) : (
          <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>
              <CheckCircle2 size={40} color="var(--c-low)" style={{ margin: '0 auto' }} />
            </div>
            <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-2)', marginBottom: '4px' }}>
              No warnings match your filter
            </div>
            <div style={{ fontSize: '13px' }}>Try changing or clearing the filter above.</div>
          </div>
        )}
      </div>
    </div>
  )
}
