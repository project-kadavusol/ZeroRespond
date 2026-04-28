import type { TimelineEntry } from '../../mock/fixtures'

export function CaseTimeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="text-sm font-semibold text-zinc-200">Case timeline</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Immutable chronological log (
        <span title="POST /cases/:id events in Sprint 2">API-backed later</span>
        ).
      </p>
      <ol className="relative mt-4 border-l border-zinc-700 pl-6">
        {entries.map((e, idx) => (
          <li key={`${e.at}-${idx}`} className="mb-6 last:mb-0">
            <span className="absolute -left-1.5 top-1.5 h-3 w-3 rounded-full border border-zinc-600 bg-teal-500" />
            <time className="font-mono text-xs text-teal-400/90">{e.at}</time>
            <p className="font-medium text-zinc-100">{e.title}</p>
            {e.detail ? (
              <p className="mt-1 max-w-prose text-sm text-zinc-400">{e.detail}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}
