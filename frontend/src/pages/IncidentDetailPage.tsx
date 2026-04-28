import { Link, useParams } from 'react-router-dom'
import { AlertSummaryCard } from '../components/case/AlertSummaryCard'
import { CaseTimeline } from '../components/case/CaseTimeline'
import { EvidenceList } from '../components/case/EvidenceList'
import { PlaybookStepList } from '../components/case/PlaybookStepList'
import { ResponderNotes } from '../components/case/ResponderNotes'
import { SeverityBadge } from '../components/SeverityBadge'
import {
  MOCK_ALERT_SUMMARY,
  MOCK_EVIDENCE,
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
            Detailed ransomware playbook demo is wired for{' '}
            <span className="font-mono text-teal-400">INV-2042</span>. Open it from
            the incident table to browse the Sprint&nbsp;1 static layout.
          </p>
        ) : null}
      </header>

      {!richDemo ? (
        <section className="rounded-lg border border-dashed border-zinc-700 p-10 text-center text-sm text-zinc-500">
          Select <span className="font-mono text-zinc-300">INV-2042</span> from
          the dashboard to preview playbook + timeline mockups.
          <div className="mt-4">
            <Link
              to="/incidents/INV-2042"
              className="text-teal-400 underline-offset-4 hover:underline"
            >
              Jump to INV-2042 demo
            </Link>
          </div>
        </section>
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-[1fr,minmax(0,18rem)]">
            <div className="space-y-6">
              <AlertSummaryCard {...MOCK_ALERT_SUMMARY} />
              <CaseTimeline entries={MOCK_TIMELINE} />
            </div>
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-sm">
                <p className="font-medium text-zinc-200">Assignments</p>
                <p className="mt-3 text-xs text-zinc-500">
                  Current owner{' '}
                  <span className="font-semibold text-zinc-300">IT SOC</span>
                </p>
                <dl className="mt-4 space-y-3 text-xs">
                  <div>
                    <dt className="text-zinc-500">Synthetic severity</dt>
                    <dd className="mt-1">
                      <SeverityBadge severity="critical" />
                    </dd>
                  </div>
                  <div>
                    <dt className="text-zinc-500">Status</dt>
                    <dd className="mt-1 text-zinc-300">Investigating · mock day 0</dd>
                  </div>
                </dl>
              </div>
            </aside>
          </div>
          <PlaybookStepList
            playbookName={MOCK_RANSOMWARE_PLAYBOOK.name}
            steps={MOCK_RANSOMWARE_PLAYBOOK.steps}
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <EvidenceList items={MOCK_EVIDENCE} />
            <ResponderNotes />
          </div>
        </>
      )}
    </div>
  )
}
