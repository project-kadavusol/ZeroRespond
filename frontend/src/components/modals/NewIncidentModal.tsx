import { useState } from 'react'
import type { FormEvent } from 'react'
import { useZeroRespond } from '../../context/ZeroRespondContext'
import { DPDP_CATEGORY_OPTIONS } from '../../mock/fixtures'
import type { Severity } from '../../mock/fixtures'
import { X, ClipboardList, ShieldAlert, Tag, Clock, Globe, Users } from 'lucide-react'

export function NewIncidentModal() {
  const { activeModal, closeModal, createIncident } = useZeroRespond()
  const [type, setType] = useState('Ransomware')
  const [computer, setComputer] = useState('')
  const [attackerIp, setAttackerIp] = useState('')
  const [breachEstAt, setBreachEstAt] = useState(() => new Date().toISOString().slice(0, 16))
  const [persons, setPersons] = useState(0)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [desc, setDesc] = useState('')
  const [sev, setSev] = useState<Severity>('medium')

  if (activeModal !== 'newIncident') return null

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    )
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!computer.trim()) {
      alert('Please enter the affected computer or system name.')
      return
    }
    if (!desc.trim()) {
      alert('Please describe what you observed.')
      return
    }
    createIncident({
      type,
      computer: computer.trim(),
      desc: desc.trim(),
      sev,
      attackerIp: attackerIp.trim() || undefined,
      breachEstAt: breachEstAt ? new Date(breachEstAt).toISOString() : undefined,
      persons: Number(persons) || 0,
      dataCategoriesList: selectedCategories,
    })
    closeModal()
  }

  return (
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={closeModal}>
      <div className="modal" style={{ maxWidth: '640px', width: '90%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ClipboardList size={18} /> Report a New Incident (CERT-In / DPDP Intake)
          </span>
          <button className="modal-close" onClick={closeModal} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-lbl" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '5px' }}>
                  Incident Type
                </label>
                <select
                  className="fselect"
                  style={{ width: '100%', height: '38px', padding: '0 10px' }}
                  value={type}
                  onChange={e => setType(e.target.value)}
                >
                  <option value="Ransomware">Ransomware</option>
                  <option value="Brute Force">Brute Force</option>
                  <option value="Privilege Escalation">Privilege Escalation</option>
                  <option value="File Integrity">File Integrity</option>
                  <option value="Unknown">Other / Suspicious Activity</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-lbl" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '5px' }}>
                  Affected Host / Asset
                </label>
                <input
                  className="finput"
                  style={{ width: '100%', height: '38px', padding: '0 10px' }}
                  placeholder="e.g. KCTLAB-WIN01, srv-web-01, 10.0.0.14"
                  value={computer}
                  onChange={e => setComputer(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
              <div className="form-group">
                <label className="form-lbl" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '5px' }}>
                  <Globe size={14} /> Attacker / Source IP (Optional)
                </label>
                <input
                  className="finput"
                  style={{ width: '100%', height: '38px', padding: '0 10px', fontFamily: 'monospace' }}
                  placeholder="e.g. 185.220.101.44"
                  value={attackerIp}
                  onChange={e => setAttackerIp(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-lbl" style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '5px' }}>
                  <Clock size={14} /> Estimated Incident Start
                </label>
                <input
                  type="datetime-local"
                  className="finput"
                  style={{ width: '100%', height: '38px', padding: '0 10px' }}
                  value={breachEstAt}
                  onChange={e => setBreachEstAt(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '14px' }}>
              <label className="form-lbl" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '5px' }}>
                Urgency / Severity Level (CERT-In 6h SLA applies to Urgent/High)
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {(['critical', 'high', 'medium', 'low'] as Severity[]).map(s => (
                  <label
                    key={s}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      cursor: 'pointer',
                      fontSize: '13px',
                      padding: '7px 10px',
                      borderRadius: 'var(--r-sm)',
                      background: sev === s ? 'var(--accent-light)' : 'var(--bg-base)',
                      border: `1.5px solid ${sev === s ? 'var(--accent)' : 'var(--border)'}`,
                      fontWeight: sev === s ? 700 : 500,
                      color: sev === s ? 'var(--accent)' : 'var(--text-1)',
                    }}
                  >
                    <input
                      type="radio"
                      name="ni-sev"
                      value={s}
                      checked={sev === s}
                      onChange={() => setSev(s)}
                      style={{ accentColor: 'var(--accent)' }}
                    />
                    {s === 'critical' ? 'Urgent' : s.charAt(0).toUpperCase() + s.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* DPDP Section */}
            <div style={{ padding: '12px', background: 'var(--bg-subtle)', borderRadius: 'var(--r-md)', border: '1px solid var(--border)', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={14} color="var(--accent)" /> DPDP Act §8(6) Data Categories Potentially Exposed:
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Select all applicable</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                {DPDP_CATEGORY_OPTIONS.map(cat => {
                  const isSel = selectedCategories.includes(cat)
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        cursor: 'pointer',
                        background: isSel ? 'var(--accent)' : 'var(--bg-card)',
                        color: isSel ? '#ffffff' : 'var(--text-1)',
                        border: `1px solid ${isSel ? 'var(--accent)' : 'var(--border)'}`,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {isSel ? '✓ ' : '+ '}{cat}
                    </button>
                  )
                })}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Users size={15} color="var(--text-muted)" />
                <label style={{ fontSize: '12px', color: 'var(--text-2)', minWidth: '150px' }}>
                  Estimated Data Principals:
                </label>
                <input
                  type="number"
                  min="0"
                  className="finput"
                  style={{ width: '120px', height: '32px', padding: '0 8px', fontSize: '12px' }}
                  value={persons}
                  onChange={e => setPersons(Math.max(0, parseInt(e.target.value) || 0))}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>individual records</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-lbl" style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-1)', marginBottom: '5px' }}>
                What did you observe?
              </label>
              <textarea
                className="step-notes-input"
                style={{ width: '100%', minHeight: '75px', padding: '8px 10px', fontSize: '13px' }}
                placeholder="Describe suspicious behavior, strange files, command executions, or security sensor alerts..."
                value={desc}
                onChange={e => setDesc(e.target.value)}
              />
            </div>
          </div>
          <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '14px 22px', borderTop: '1px solid var(--border)' }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldAlert size={16} /> Create Incident Case & Start Playbook
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
