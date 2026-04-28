import { IncidentToolbar } from '../components/dashboard/IncidentToolbar'
import { IncidentTable } from '../components/dashboard/IncidentTable'
import { MOCK_INCIDENTS } from '../mock/fixtures'

export function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
          Incident queue
        </h1>
        <p className="mt-1 max-w-prose text-sm text-zinc-400">
          High-signal backlog for active investigations —{' '}
          <span title="Synthetic rows for stakeholder review">{MOCK_INCIDENTS.length}</span>{' '}
          mock incidents (
          <code className="rounded bg-zinc-900 px-1 py-px text-[13px] text-zinc-300">
            GET /cases
          </code>{' '}
          Sprint&nbsp;2).
        </p>
      </header>
      <IncidentToolbar />
      <IncidentTable rows={MOCK_INCIDENTS} />
    </div>
  )
}
