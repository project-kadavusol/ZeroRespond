import { MOCK_HEATMAP_WEEK_HOURS } from '../../mock/fixtures'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

const COLORS = [
  'transparent',
  'rgba(0,229,176,.15)',
  'rgba(0,229,176,.3)',
  'rgba(0,229,176,.5)',
  'rgba(0,229,176,.7)',
  'rgba(0,229,176,.9)',
]

const MAX = 5

const rowTemplate = '40px repeat(24, minmax(0, 1fr))'

export function DashboardHeatmap() {
  return (
    <section className="chart-box">
      <div className="card-title" style={{ marginBottom: '4px' }}>
        Incident Heatmap · last 7 days × 24 hours
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', maxWidth: '480px', lineHeight: 1.5 }}>
        Simulated density from lab data — aligns with Sprint 1 demo narrative.
      </p>
      <div className="zr-hm-wrap">
        <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: rowTemplate, gap: '2px' }}>
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div key={h} className="zr-hm-hour">
                {h % 6 === 0 ? h : ''}
              </div>
            ))}
          </div>
          {DAYS.map((d) => {
            const row = MOCK_HEATMAP_WEEK_HOURS[d] ?? Array(24).fill(0)
            return (
              <div
                key={d}
                style={{ display: 'grid', gridTemplateColumns: rowTemplate, gap: '2px' }}
              >
                <div className="zr-hm-day">{d}</div>
                {row.map((v, hi) => {
                  const bg = COLORS[Math.min(v, MAX)] ?? COLORS[0]
                  return (
                    <div
                      key={`${d}-${hi}`}
                      className="zr-hm-cell"
                      style={{ background: bg }}
                      title={`${d} ${hi}:00 — ${String(v)} alerts`}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
