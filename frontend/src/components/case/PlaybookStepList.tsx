import { useMemo, useState } from 'react'
import type { PlaybookStep } from '../../mock/fixtures'

type PlaybookStepListProps = {
  playbookName: string
  steps: PlaybookStep[]
}

export function PlaybookStepList({ playbookName, steps }: PlaybookStepListProps) {
  const initial = useMemo(() => steps.map(() => false), [steps])
  const [completed, setCompleted] = useState<boolean[]>(initial)
  const [platform, setPlatform] = useState<'linux' | 'windows'>('linux')

  function toggle(stepIndex: number) {
    setCompleted((prev) => {
      const next = [...prev]
      next[stepIndex] = !next[stepIndex]
      return next
    })
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Active playbook (static)
          </p>
          <h2 className="text-lg font-semibold text-white">{playbookName}</h2>
        </div>
        <div className="flex rounded-md border border-zinc-700 p-0.5">
          <button
            type="button"
            onClick={() => setPlatform('linux')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${platform === 'linux' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            Linux
          </button>
          <button
            type="button"
            onClick={() => setPlatform('windows')}
            className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${platform === 'windows' ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            Windows
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        Mark complete persists locally until refresh — Sprint 3 aligns with PATCH
        playbook APIs.
      </p>
      <ul className="mt-6 space-y-6">
        {steps.map((s, i) => (
          <li
            key={s.step}
            className="rounded-lg border border-zinc-800 bg-zinc-950/80 p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex items-baseline gap-2">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 font-mono text-sm text-teal-400">
                  {s.step}
                </span>
                <div>
                  <h3 className="font-medium text-white">{s.title}</h3>
                  {s.blocking ? (
                    <span className="mt-1 inline-block rounded bg-amber-950/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-100 ring-1 ring-amber-800">
                      Blocking
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggle(i)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${completed[i] ? 'bg-emerald-900/70 text-emerald-100 ring-1 ring-emerald-700' : 'bg-teal-600 text-white hover:bg-teal-500'}`}
              >
                {completed[i] ? 'Completed' : 'Mark complete'}
              </button>
            </div>
            <p className="mt-3 text-sm text-zinc-400">{s.goal}</p>
            <div className="mt-4 rounded-md bg-black/40 p-3 font-mono text-xs leading-relaxed text-zinc-300">
              <p className="mb-1 text-[10px] uppercase text-zinc-500">
                {platform === 'linux' ? 'Shell' : 'PowerShell / CMD'}
              </p>
              <pre className="whitespace-pre-wrap break-all">
                {platform === 'linux' ? s.linux : s.windows}
              </pre>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
