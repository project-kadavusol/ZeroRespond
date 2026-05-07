import { Link } from 'react-router-dom'
import { MOCK_EVIDENCE_VAULT } from '../mock/fixtures'

function formatArtifactSize(kb: number) {
  if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`
  return `${kb} KB`
}

export function EvidencePage() {
  return (
    <div className="zr-page">
      <header className="zr-page-header">
        <div>
          <div className="zr-page-title">Evidence Locker</div>
          <div className="zr-page-sub">
            Artefacts attached to cases — hashes for chain-of-custody (demo catalogue)
          </div>
        </div>
        <div className="zr-page-actions">
          <span className="zr-sync-note">Retention: 365 days</span>
          <button type="button" className="btn btn-ghost btn-sm">
            Export manifest
          </button>
          <button type="button" className="btn btn-primary btn-sm">
            + Upload
          </button>
        </div>
      </header>

      <div className="zr-upload-zone" style={{ marginBottom: '20px' }}>
        Drag forensic bundles, PCAPs, or memory images here — or use <strong style={{ color: 'var(--txt)' }}>Upload</strong>{' '}
        (wired in Sprint&nbsp;2).
      </div>

      <div className="card zr-card-body-pad">
        <div className="zr-card-head">
          <div className="card-title" style={{ margin: 0 }}>
            All artefacts · {MOCK_EVIDENCE_VAULT.length} items
          </div>
        </div>
        <div className="tbl-wrap">
          <table className="zr-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>File</th>
                <th>Case</th>
                <th>Kind</th>
                <th>SHA-256</th>
                <th>Size</th>
                <th>Added</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_EVIDENCE_VAULT.map((row) => (
                <tr key={row.id}>
                  <td className="td-id">{row.id}</td>
                  <td>
                    <div className="td-title">{row.filename}</div>
                  </td>
                  <td className="td-id">
                    <Link to={`/incidents/${encodeURIComponent(row.incidentId)}`}>{row.incidentId}</Link>
                  </td>
                  <td>{row.kind}</td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted2)' }}>
                    {row.sha256short}
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: '12px' }}>
                    {formatArtifactSize(row.sizeKb)}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--muted)' }}>{row.addedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
