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

const DEMO_CASE_ID = 'INV-2042'

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const caseId = decodeURIComponent(id ?? '')
  const richDemo = caseId.trim().toUpperCase() === DEMO_CASE_ID

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <nav className="text-sm text-zinc-400" aria-label="Breadcrumb">
        <Link to="/dashboard" className="hover:text-teal-400">
          Incident list
        </Link>
        <span className="mx-2 text-zinc-600">/</span>
        <span className="font-mono text-zinc-200">{caseId || 'unknown'}</span>
      </nav>

      <header>
        <h1 className="text-xl font-semibold text-white md:text-2xl">
          Case workspace
        </h1>
        {!richDemo ? (
          <p className="mt-3 max-w-prose rounded-md border border-zinc-800 bg-zinc-900/50 p-4 text-sm text-zinc-400">
            The full guided playbook demo is available for{' '}
            <span className="font-mono text-teal-400">INV-2042</span>. Open that
            case from the incident queue to explore the sample workflow.
          </p>
        ) : null}
      </header>

      {!richDemo ? (
        <section className="rounded-lg border border-dashed border-zinc-700 p-10 text-center text-sm text-zinc-500">
          Select <span className="font-mono text-zinc-300">INV-2042</span> from
          the queue to preview the playbook, timeline, and evidence layout.
          <div className="mt-4">
            <Link
              to="/incidents/INV-2042"
              className="text-teal-400 underline-offset-4 hover:underline"
            >
              Open INV-2042 demo
            </Link>
          </div>
        </section>
      ) : (
        <>
          <AlertSummaryCard {...MOCK_ALERT_SUMMARY} />
          <IncidentPhaseStrip
            phases={MOCK_INCIDENT_PHASE_STRIP.phases}
            currentIndex={MOCK_INCIDENT_PHASE_STRIP.currentIndex}
          />
          <PlaybookStepList
            playbookName={MOCK_RANSOMWARE_PLAYBOOK.name}
            steps={MOCK_RANSOMWARE_PLAYBOOK.steps}
          />
          <div className="grid gap-6 lg:grid-cols-[1fr,minmax(0,18rem)]">
            <CaseTimeline entries={MOCK_TIMELINE} />
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm">
                <p className="font-medium text-zinc-200">Assignments</p>
                <p className="mt-3 text-xs text-zinc-500">
                  Owner{' '}
                  <span className="font-semibold text-zinc-300">IT SOC</span>
                </p>
                <dl className="mt-4 space-y-3 text-xs">
                  <div>
                    <dt className="text-zinc-500">Severity</dt>
                    <dd className="mt-1">
                      <SeverityBadge severity="critical" />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Status</dt>
                    <dd className="mt-1 text-zinc-300">Investigating</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <EvidenceList items={MOCK_EVIDENCE} />
            <ResponderNotes />
          </div>
        </>
      )}
    </div>
  )
}
