import { Link } from 'react-router-dom'
import type { ReportVaultRow } from '../mock/fixtures'
import { MOCK_REPORTS_VAULT } from '../mock/fixtures'

function reportTypeClass(t: ReportVaultRow['type']) {
  if (t === 'DPDP') return 'status st-progress'
  if (t === 'Executive') return 'status st-done'
  if (t === 'Technical') return 'status st-open'
  return 'status st-done'
}

export function ReportsPage() {
  return (
    <div className="zr-page">
      <header className="zr-page-header">
        <div>
          <div className="zr-page-title">Reports</div>
          <div className="zr-page-sub">
            Generated summaries, regulator drafts, and post-incident reviews
          </div>
        </div>
        <div className="zr-page-actions">
          <span className="zr-sync-note">Templates: DPDP · ISO · Exec 1‑pager</span>
          <button type="button" className="btn btn-primary btn-sm">
            Generate report →
          </button>
        </div>
      </header>

      <div className="card zr-card-body-pad">
        <div className="zr-card-head">
          <div className="card-title" style={{ margin: 0 }}>
            Library · {MOCK_REPORTS_VAULT.length} documents
          </div>
        </div>
        <div className="tbl-wrap">
          <table className="zr-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Case</th>
                <th>Pages</th>
                <th>Created</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {MOCK_REPORTS_VAULT.map((row) => (
                <tr key={row.id}>
                  <td className="td-id">{row.id}</td>
                  <td>
                    <div className="td-title">{row.title}</div>
                  </td>
                  <td>
                    <span className={reportTypeClass(row.type)} style={{ textTransform: 'none' }}>
                      {row.type}
                    </span>
                  </td>
                  <td className="td-id">
                    {row.incidentId ? (
                      <Link to={`/incidents/${encodeURIComponent(row.incidentId)}`}>{row.incidentId}</Link>
                    ) : (
                      <span style={{ color: 'var(--muted)' }}>—</span>
                    )}
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>{row.pages}</td>
                  <td style={{ fontSize: '12px', color: 'var(--muted)' }}>{row.createdAt}</td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm">
                      PDF ↓
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
