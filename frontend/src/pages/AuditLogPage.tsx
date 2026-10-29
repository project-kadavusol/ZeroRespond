import { useState } from 'react'
import { useZeroRespond } from '../context/ZeroRespondContext'
import { Download, ScrollText } from 'lucide-react'

export function AuditLogPage() {
  const { auditLog, reportHistory, showNotif } = useZeroRespond()
  const [search, setSearch] = useState('')
  const [userFilter, setUserFilter] = useState('')

  const filteredLogs = auditLog.filter(a => {
    if (userFilter && a.user !== userFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        a.action.toLowerCase().includes(q) ||
        a.detail.toLowerCase().includes(q) ||
        a.ref.toLowerCase().includes(q)
      )
    }
    return true
  })

  const exportAuditCsv = () => {
    if (!auditLog.length) return
    const lines = ['Time,Action,Reference,Detail,User']
    auditLog.forEach(a => {
      lines.push([a.t, `"${a.action}"`, a.ref, `"${a.detail}"`, a.user].join(','))
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `ZeroRespond-audit-${Date.now()}.csv`
    link.click()
    URL.revokeObjectURL(url)
    showNotif('Exported', `${auditLog.length} audit entries exported as CSV.`, 'low')
  }

  return (
    <div id="view-audit" className="view" style={{ display: 'block' }}>
      <div className="page-hd">
        <h1>Audit Log</h1>
        <p>Recorded actions across incident cases, evidence, response steps, and reporting.</p>
      </div>

      <div className="card">
        <div className="card-hd">
          <span className="card-title">Recent Activity</span>
          <span className="status-chip" style={{ background: 'var(--c-low-bg)', color: 'var(--c-low)' }}>Immutable Audit Trail</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <input
            className="finput"
            type="text"
            id="audit-search"
            placeholder="Search actions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '200px' }}
          />

          <select
            className="fselect"
            id="audit-filter-user"
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
          >
            <option value="">All users</option>
            <option value="System">System</option>
            <option value="Wazuh">Wazuh</option>
            <option value="Naveen Kumar">Naveen Kumar</option>
            <option value="Ragul">Ragul</option>
            <option value="Manikandan">Manikandan</option>
            <option value="Prithiv Raj">Prithiv Raj</option>
          </select>

          <button className="btn btn-secondary btn-sm" onClick={exportAuditCsv}>
            <Download size={13} /> Export CSV
          </button>
        </div>

        <div id="audit-log-list">
          {filteredLogs.length > 0 ? (
            filteredLogs.map((a, idx) => (
              <div key={idx} className="audit-row">
                <span className="audit-time">{a.t} IST</span>
                <span className="audit-action">{a.action}</span>
                <span className="audit-user">
                  <strong>{a.ref}</strong> — {a.detail}
                </span>
                <span className="audit-type">{a.user}</span>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-3)' }}>
              <ScrollText size={32} style={{ margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 600 }}>No matching entries</div>
              <div style={{ fontSize: '12px' }}>Try clearing your filter.</div>
            </div>
          )}
        </div>
      </div>

      <div className="p1-section" style={{ marginTop: '28px' }}>
        <div className="p1-section-hd">
          <div>
            <div className="p1-title">Report History</div>
            <div className="p1-sub">Previously generated incident reports from case records.</div>
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
                  <span className="status-chip" style={{ background: 'var(--c-low-bg)', color: 'var(--c-low)' }}>{r.status}</span>
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
