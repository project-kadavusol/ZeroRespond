import { useNavigate } from 'react-router-dom'
import { useZeroRespond } from '../../context/ZeroRespondContext'
import type { AlertItem, Severity } from '../../mock/fixtures'
import { X, ShieldAlert, ArrowRight } from 'lucide-react'

export function DetectionDetailModal() {
  const { activeModal, modalData, closeModal, createIncident } = useZeroRespond()
  const navigate = useNavigate()

  if (activeModal !== 'detectionDetail') return null

  const alert = modalData?.alert as AlertItem
  if (!alert) return null

  const catNames: Record<string, string> = {
    bf: 'Brute Force',
    pe: 'Privilege Escalation',
    fim: 'File Integrity',
    ra: 'Ransomware',
  }

  const handleStartResponse = () => {
    closeModal()
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
    <div className="modal-overlay" style={{ display: 'flex' }} onClick={closeModal}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hd">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldAlert size={18} /> Detection Details
          </span>
          <button className="modal-close" onClick={closeModal} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">
          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-1)', marginBottom: '6px' }}>
              {alert.name}
            </div>
            <span className={`badge ${alert.sev}`}>
              <span className="bdot" />
              {alert.sev.charAt(0).toUpperCase() + alert.sev.slice(1)}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              background: 'var(--bg-base)',
              padding: '14px',
              borderRadius: 'var(--r-md)',
              marginBottom: '16px',
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>
                Detection ID
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-1)', fontFamily: 'var(--font-brand)', marginTop: '2px' }}>
                {alert.id}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>
                Wazuh Rule ID
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-1)', fontFamily: 'var(--font-code)', marginTop: '2px' }}>
                {alert.ruleId || '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>
                Attack Type
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--text-1)', marginTop: '2px' }}>
                {catNames[alert.category] || alert.category}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>
                Affected System
              </div>
              <div style={{ fontSize: '13.5px', fontWeight: 600, color: 'var(--accent)', marginTop: '2px' }}>
                {alert.computer}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase' }}>
                Event Description
              </div>
              <div style={{ fontSize: '13.5px', color: 'var(--text-2)', lineHeight: 1.55, marginTop: '4px' }}>
                {alert.desc}
              </div>
            </div>
          </div>
        </div>
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', padding: '16px 22px', borderTop: '1px solid var(--border)' }}>
          <button type="button" className="btn btn-secondary" onClick={closeModal}>
            Dismiss
          </button>
          <button type="button" className="btn btn-primary" onClick={handleStartResponse} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            Start Response <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
