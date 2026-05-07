import { Link, useParams } from 'react-router-dom'
import { AlertSummaryCard } from '../components/case/AlertSummaryCard'
import { CaseTimeline } from '../components/case/CaseTimeline'
import { EvidenceList } from '../components/case/EvidenceList'
import { IncidentPhaseStrip } from '../components/case/IncidentPhaseStrip'
import { PlaybookStepList } from '../components/case/PlaybookStepList'
import { ResponderNotes } from '../components/case/ResponderNotes'
import { SeverityBadge } from '../components/SeverityBadge'
import {
  MOCK_ALERT_SUMMARY,
  MOCK_EVIDENCE,
  MOCK_INCIDENT_PHASE_STRIP,
  MOCK_RANSOMWARE_PLAYBOOK,
  MOCK_TIMELINE,
} from '../mock/fixtures'
import { incidentStatusBadgeClass } from '../lib/incidentDisplay'

const DEMO_CASE_ID = 'INV-2042'

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const caseId = decodeURIComponent(id ?? '')
  const richDemo = caseId.trim().toUpperCase() === DEMO_CASE_ID

  return (
    <div className="zr-page">
      <nav style={{ marginBottom: '20px', fontSize: '13px', color: 'var(--muted2)' }} aria-label="Breadcrumb">
        <Link to="/incidents" style={{ color: 'var(--accent2)', textDecoration: 'none' }}>
          Incidents
        </Link>
        <span style={{ margin: '0 8px', color: 'var(--muted)' }}>/</span>
        <span style={{ fontFamily: 'var(--mono)', color: 'var(--txt)' }}>{caseId || 'unknown'}</span>
      </nav>

      {!richDemo ? (
        <>
          <header style={{ marginBottom: '24px' }}>
            <div className="zr-page-title">Case workspace</div>
            <p style={{ marginTop: '12px', color: 'var(--muted2)', fontSize: '14px', maxWidth: '40rem', lineHeight: 1.6 }}>
              The full guided playbook demo is available for{' '}
              <span style={{ fontFamily: 'var(--mono)', color: 'var(--accent)' }}>{DEMO_CASE_ID}</span>.
            </p>
          </header>

          <div className="zr-muted-panel">
            Select{' '}
            <span style={{ fontFamily: 'var(--mono)', color: 'var(--txt)' }}>{DEMO_CASE_ID}</span> from the
            queue to preview the playbook, timeline, and evidence layout.
            <div style={{ marginTop: '16px' }}>
              <Link
                to={`/incidents/${encodeURIComponent(DEMO_CASE_ID)}`}
                className="btn btn-primary btn-sm"
                style={{ textDecoration: 'none' }}
              >
                Open {DEMO_CASE_ID} demo →
              </Link>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="zr-alert-panel" style={{ marginBottom: '16px' }}>
            <div style={{ marginBottom: '12px', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent2)' }}>
              {caseId}
            </div>
            <AlertSummaryCard {...MOCK_ALERT_SUMMARY} />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <IncidentPhaseStrip
              phases={MOCK_INCIDENT_PHASE_STRIP.phases}
              currentIndex={MOCK_INCIDENT_PHASE_STRIP.currentIndex}
            />
          </div>

          <div className="zr-detail-grid">
            <div>
              <PlaybookStepList
                playbookName={MOCK_RANSOMWARE_PLAYBOOK.name}
                steps={MOCK_RANSOMWARE_PLAYBOOK.steps}
              />
              <div style={{ marginTop: '20px' }}>
                <CaseTimeline entries={MOCK_TIMELINE} />
              </div>
              <div className="zr-detail-split" style={{ marginTop: '20px' }}>
                <EvidenceList items={MOCK_EVIDENCE} />
                <ResponderNotes />
              </div>
            </div>
            <aside>
              <div className="card">
                <div className="card-title" style={{ marginBottom: '12px' }}>
                  Assignments
                </div>
                <p style={{ fontSize: '13px', color: 'var(--muted2)', marginBottom: '16px' }}>
                  Owner <strong style={{ color: 'var(--txt)' }}>IT SOC</strong>
                </p>
                <div className="zr-ap-row" style={{ borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
                  <span className="zr-ap-key">Severity</span>
                  <span className="zr-ap-val" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <SeverityBadge severity="critical" />
                  </span>
                </div>
                <div className="zr-ap-row" style={{ padding: '10px 0 0', borderBottom: 'none' }}>
                  <span className="zr-ap-key">Status</span>
                  <span className={incidentStatusBadgeClass('Investigating')} style={{ marginLeft: 'auto' }}>
                    Investigating
                  </span>
                </div>
              </div>
            </aside>
          </div>
        </>
      )}
    </div>
  )
}
