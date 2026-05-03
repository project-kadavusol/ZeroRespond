export type PhaseStripItem = { id: string; label: string }

type IncidentPhaseStripProps = {
  phases: readonly PhaseStripItem[]
  /** Index of the phase currently in progress (0-based). */
  currentIndex: number
}

export function IncidentPhaseStrip({
  phases,
  currentIndex,
}: IncidentPhaseStripProps) {
  return (
    <section
      className="rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-4 sm:px-4"
      aria-label="Incident progress"
    >
      <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Where this case is
      </h2>
      <ol className="mt-3 flex flex-wrap items-center gap-y-2">
        {phases.map((phase, i) => {
          const done = i < currentIndex
          const active = i === currentIndex
          const pending = i > currentIndex
          return (
            <li key={phase.id} className="flex items-center">
              {i > 0 ? (
                <span
                  className={`mx-1.5 hidden h-px w-4 sm:inline sm:w-6 ${
                    done ? 'bg-teal-600' : 'bg-zinc-700'
                  }`}
                  aria-hidden
                />
              ) : null}
              <span
                className={[
                  'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium sm:text-xs',
                  done
                    ? 'border-teal-800/80 bg-teal-950/50 text-teal-200'
                    : active
                      ? 'border-teal-500/70 bg-teal-950/70 text-white ring-1 ring-teal-500/40'
                      : pending
                        ? 'border-zinc-700 bg-zinc-950/80 text-zinc-500'
                        : 'border-zinc-700 text-zinc-500',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold',
                    done
                      ? 'bg-teal-600 text-white'
                      : active
                        ? 'bg-teal-500 text-zinc-950'
                        : 'bg-zinc-800 text-zinc-500',
                  ].join(' ')}
                  aria-hidden
                >
                  {done ? '✓' : i + 1}
                </span>
                {phase.label}
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
