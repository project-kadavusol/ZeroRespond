import { useState } from 'react'
import { MOCK_HEATMAP_DAYS } from '../../mock/fixtures'

/** Map incident count → colour level 0-4 (like GitHub contribution graph). */
function countToLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 4) return 2
  if (count <= 6) return 3
  return 4
}

const LEVEL_COLORS: Record<number, string> = {
  0: 'var(--border)',
  1: 'rgba(0,229,176,0.25)',
  2: 'rgba(0,229,176,0.48)',
  3: 'rgba(0,229,176,0.72)',
  4: '#00e5b0',
}

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const SHOW_DAY_LABELS = new Set([1, 3, 5]) // Mon, Wed, Fri indices (GitHub style)

// Week start offsets — Apr 4 2026 is a Saturday (index 6)
const START_DOW = 6

/** Build a 5-week × 7-day grid with ISO date labels. */
function buildGrid() {
  const baseDate = new Date('2026-04-04')
  return MOCK_HEATMAP_DAYS.map((d, i) => {
    const date = new Date(baseDate)
    date.setDate(baseDate.getDate() + i)
    const dow = (START_DOW + i) % 7
    const weekIdx = Math.floor((START_DOW + i) / 7)
    return { ...d, dow, weekIdx, isoDate: date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) }
  })
}

const WEEK_LABELS = ['Apr 4', 'Apr 11', 'Apr 18', 'Apr 25', 'May 2']

type TooltipState = { x: number; y: number; text: string } | null

export function IncidentDensityHeatmap() {
  const [tooltip, setTooltip] = useState<TooltipState>(null)
  const grid = buildGrid()

  return (
    <section className="chart-box">
      <h3 className="card-title" style={{ marginBottom: '4px' }}>
        Incident Activity · last 35 days
      </h3>
      <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '20px' }}>
        Each cell = 1 day. Colour intensity = number of alerts triggered.
      </p>

      <div style={{ position: 'relative', overflowX: 'auto' }}>
        {tooltip && (
          <div
            style={{
              position: 'fixed',
              left: tooltip.x + 12,
              top: tooltip.y - 36,
              background: 'var(--card2)',
              border: '1px solid var(--border2)',
              borderRadius: '6px',
              padding: '5px 10px',
              fontSize: '11px',
              color: 'var(--txt)',
              fontFamily: 'var(--mono)',
              pointerEvents: 'none',
              zIndex: 100,
              whiteSpace: 'nowrap',
            }}
          >
            {tooltip.text}
          </div>
        )}

        {/* Grid wrapper */}
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: '4px', minWidth: 0 }}>

          {/* Week column headers */}
          <div style={{ display: 'flex', paddingLeft: '36px', gap: '4px' }}>
            {WEEK_LABELS.map((wl, wi) => (
              <div
                key={wi}
                style={{
                  width: '14px',
                  fontSize: '9px',
                  color: 'var(--muted)',
                  fontFamily: 'var(--mono)',
                  whiteSpace: 'nowrap',
                  marginRight: '56px',
                }}
              >
                {wl}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAY_LABELS.map((dayLabel, dow) => {
            const cells = grid.filter(d => d.dow === dow)
            return (
              <div key={dow} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {/* Day label */}
                <div
                  style={{
                    width: '28px',
                    fontSize: '10px',
                    color: SHOW_DAY_LABELS.has(dow) ? 'var(--muted2)' : 'transparent',
                    fontFamily: 'var(--mono)',
                    textAlign: 'right',
                    flexShrink: 0,
                    userSelect: 'none',
                  }}
                >
                  {dayLabel}
                </div>
                {/* Cells for this day across all 5 weeks */}
                {cells.map(cell => {
                  const level = countToLevel(cell.count)
                  return (
                    <div
                      key={cell.label}
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '3px',
                        background: LEVEL_COLORS[level],
                        border: '1px solid rgba(255,255,255,0.04)',
                        cursor: 'default',
                        transition: 'transform 0.1s',
                      }}
                      onMouseEnter={e => {
                        const r = (e.target as HTMLElement).getBoundingClientRect()
                        setTooltip({
                          x: r.left,
                          y: r.top,
                          text: `${cell.isoDate}  ·  ${cell.count} alert${cell.count !== 1 ? 's' : ''}`,
                        })
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '14px',
            paddingLeft: '36px',
          }}
        >
          <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>Less</span>
          {[0, 1, 2, 3, 4].map(level => (
            <div
              key={level}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '3px',
                background: LEVEL_COLORS[level],
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            />
          ))}
          <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>More</span>
        </div>
      </div>
    </section>
  )
}
