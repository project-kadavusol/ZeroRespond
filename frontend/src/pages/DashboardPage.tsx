import { useState } from 'react'
import { IncidentQueueCards } from '../components/dashboard/IncidentQueueCards'
import { IncidentToolbar } from '../components/dashboard/IncidentToolbar'
import { IncidentTable } from '../components/dashboard/IncidentTable'
import { NewCaseModal } from '../components/dashboard/NewCaseModal'
import { MOCK_INCIDENTS } from '../mock/fixtures'

export function DashboardPage() {
  const [newCaseOpen, setNewCaseOpen] = useState(false)

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight text-white md:text-2xl">
          Incident queue
        </h1>
        <p className="mt-1 max-w-prose text-sm text-zinc-400">
          Active cases and their status —{' '}
          <span className="text-zinc-300">{MOCK_INCIDENTS.length}</span> sample
          rows for review.
        </p>
      </header>
      <IncidentToolbar onNewCase={() => setNewCaseOpen(true)} />
      <NewCaseModal
        open={newCaseOpen}
        onClose={() => setNewCaseOpen(false)}
      />
      <div className="md:hidden">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          Recent
        </p>
        <IncidentQueueCards rows={MOCK_INCIDENTS} limit={3} />
      </div>
      <div className="hidden md:block">
        <IncidentTable rows={MOCK_INCIDENTS} />
      </div>
    </div>
  )
}
