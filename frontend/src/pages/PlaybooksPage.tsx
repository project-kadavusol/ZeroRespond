const PLAYBOOKS = [
  {
    icon: '🦠',
    title: 'Ransomware Response',
    meta: '6 steps · ~25 min avg response',
    sev: 'Critical',
    sevClass: 'sev sev-crit' as const,
    border: 'rgba(255,69,85,.2)',
    desc: 'Isolate host → Identify variant → Preserve evidence → Block C2 → Recover from backup → DPDP report',
  },
  {
    icon: '🐟',
    title: 'Phishing Investigation',
    meta: '6 steps · ~15 min avg response',
    sev: 'High',
    sevClass: 'sev sev-high' as const,
    border: 'rgba(255,112,67,.2)',
    desc: 'Quarantine inbox → Analyze headers → Block URL → Password reset sweep → Awareness note → Track repeat',
  },
  {
    icon: '🔐',
    title: 'Unauthorized Access',
    meta: '6 steps · ~18 min avg response',
    sev: 'High',
    sevClass: 'sev sev-high' as const,
    border: 'rgba(59,124,255,.2)',
    desc: 'Lock account → Audit sessions → Firewall review → Credential reset → IOC hunt → Incident report',
  },
  {
    icon: '📤',
    title: 'Data Exfiltration',
    meta: '6 steps · ~20 min avg response',
    sev: 'Medium',
    sevClass: 'sev sev-med' as const,
    border: 'rgba(0,212,232,.2)',
    desc: 'Identify exfil path → Block outbound → Collect netflow → Identify data scope → Notify → DPDP report',
  },
  {
    icon: '🕵️',
    title: 'Insider Threat',
    meta: '6 steps · ~30 min avg response',
    sev: 'Medium',
    sevClass: 'sev sev-med' as const,
    border: 'rgba(155,109,255,.2)',
    desc: 'Preserve audit trail → Suspend account → Interview manager → Forensic review → HR escalation → Report',
  },
]

export function PlaybooksPage() {
  return (
    <div className="zr-page">
      <header className="zr-page-header">
        <div>
          <div className="zr-page-title">Playbook Library</div>
          <div className="zr-page-sub">
            5 attack-type playbooks · Each with actionable command-level steps (demo preview)
          </div>
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '16px',
        }}
      >
        {PLAYBOOKS.map((pb) => (
          <div
            key={pb.title}
            className="card"
            style={{
              cursor: 'default',
              borderColor: pb.border,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ fontSize: '20px' }} aria-hidden>
                {pb.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--txt)' }}>{pb.title}</div>
                <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>
                  {pb.meta}
                </div>
              </div>
              <span className={pb.sevClass} style={{ marginLeft: 'auto' }}>
                {pb.sev}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--muted2)', lineHeight: 1.5 }}>
              {pb.desc}
            </div>
            <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-primary btn-sm">
                Use Playbook →
              </button>
              <button type="button" className="btn btn-ghost btn-sm">
                Preview
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
