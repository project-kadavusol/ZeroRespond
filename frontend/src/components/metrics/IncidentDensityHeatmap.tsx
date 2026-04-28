import { MOCK_HEATMAP_DAYS } from '../../mock/fixtures'

const heatClasses = ['bg-zinc-900', 'bg-amber-900/50', 'bg-orange-900/70', 'bg-red-900/70']

/** Sprint 1: faux calendar intensity — swaps to real aggregates in Sprint 4 polish. */

export function IncidentDensityHeatmap() {
  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-4">
      <h3 className="text-sm font-medium text-zinc-200">
        Incident density (last 35 days · mock)
      </h3>
      <p className="mt-1 text-xs text-zinc-500">
        Each cell hints at noisy days — finer calendar grid arrives with live data.
      </p>
      <div className="mt-4 grid grid-cols-7 gap-1.5 sm:gap-2">
        {MOCK_HEATMAP_DAYS.map((d) => (
          <div
            key={d.label}
            title={`Day ${String(d.label)} · intensity ${String(d.intensity)}`}
            className={`aspect-square rounded-sm ring-1 ring-zinc-800 ${heatClasses[d.intensity] ?? heatClasses[0]}`}
          />
        ))}
      </div>
    </section>
  )
}
