import { MOCK_HEATMAP_DAYS } from '../../mock/fixtures'

const CELL_COLORS = [
  'transparent',
  'rgba(0,229,176,.15)',
  'rgba(0,229,176,.35)',
  'rgba(0,229,176,.65)',
]

/** Sprint 1: calendar-style density — swaps to aggregates when analytics is wired. */
export function IncidentDensityHeatmap() {
  return (
    <section className="chart-box">
      <h3 className="card-title" style={{ marginBottom: '8px' }}>
        Incident density (last 35 days · mock)
      </h3>
      <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5 }}>
        Hotter greens indicate heavier fixture volume on that weekday slot.
      </p>
      <div
        style={{
          marginTop: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
          gap: '6px',
        }}
      >
        {MOCK_HEATMAP_DAYS.map((d) => (
          <div
            key={d.label}
            title={`Day ${String(d.label)} · intensity ${String(d.intensity)}`}
            style={{
              aspectRatio: '1',
              borderRadius: '4px',
              border: '1px solid var(--border)',
              background:
                CELL_COLORS[d.intensity] ?? CELL_COLORS[0],
            }}
          />
        ))}
      </div>
    </section>
  )
}
