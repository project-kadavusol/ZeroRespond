import { useState } from 'react'
import { IncidentToolbar } from '../components/dashboard/IncidentToolbar'
import { IncidentTable } from '../components/dashboard/IncidentTable'
import { NewCaseModal } from '../components/dashboard/NewCaseModal'
import { MOCK_INCIDENTS } from '../mock/fixtures'

export function IncidentsPage() {
  const [newCaseOpen, setNewCaseOpen] = useState(false)

  return (
    <div className="zr-page">
      <header className="zr-page-header">
        <div>
          <div className="zr-page-title">Incident Cases</div>
          <div className="zr-page-sub">
            All incident cases · Open a row to view case detail and playbook
          </div>
        </div>
        <div className="zr-page-actions">
          <span className="zr-sync-note">Demo data</span>
          <button type="button" className="btn btn-ghost btn-sm">
            Export CSV
          </button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setNewCaseOpen(true)}>
            + New Incident
          </button>
        </div>
      </header>

      <IncidentToolbar onNewCase={() => setNewCaseOpen(true)} />
      <NewCaseModal open={newCaseOpen} onClose={() => setNewCaseOpen(false)} />

      <div className="card zr-card-body-pad">
        <div className="zr-card-head">
          <div className="card-title" style={{ margin: 0 }}>
            All Cases · {MOCK_INCIDENTS.length} rows
          </div>
        </div>
        <IncidentTable rows={MOCK_INCIDENTS} />
      </div>
    </div>
  )
}
