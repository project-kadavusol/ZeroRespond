import { Link, useParams } from 'react-router-dom'

export function IncidentDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div className="space-y-6">
      <nav className="text-sm text-zinc-400">
        <Link to="/dashboard" className="hover:text-teal-400">
          Incidents
        </Link>
        <span className="mx-2">/</span>
        <span className="text-zinc-200">{id ?? '…'}</span>
      </nav>

      <header>
        <h1 className="text-xl font-semibold text-white">
          Case workspace — <span className="font-mono">{id ?? 'unknown'}</span>
        </h1>
        <p className="mt-2 max-w-prose text-sm text-zinc-400">
          Placeholder for alert details, timeline, playbook checklist, evidence
          list, and notes. Integrate{' '}
          <code className="rounded bg-zinc-900 px-1 py-0.5 text-zinc-300">
            GET /cases/:id
          </code>{' '}
          when Ragul ships the API (project Modules 2 and 3).
        </p>
      </header>

      <section className="rounded-lg border border-dashed border-zinc-700 bg-zinc-900/40 p-6">
        <p className="text-sm text-zinc-400">
          Playbook step-through component will live here (Sprint 3).
        </p>
      </section>
    </div>
  )
}
