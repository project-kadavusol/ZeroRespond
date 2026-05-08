import { useState } from 'react'
import { MOCK_HEATMAP_WEEK_HOURS } from '../../mock/fixtures'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const

/** Map alert count → 0-5 level for colour scale. */
function countToLevel(v: number): number {
  if (v === 0) return 0
  if (v === 1) return 1
  if (v === 2) return 2
  if (v === 3) return 3
  if (v === 4) return 4
  return 5
}

const LEVEL_BG: Record<number, string> = {
  0: 'var(--border)',
  1: 'rgba(0,229,176,0.15)',
  2: 'rgba(0,229,176,0.30)',
  3: 'rgba(0,229,176,0.50)',
  4: 'rgba(0,229,176,0.72)',
  5: '#00e5b0',
}

type TooltipState = { x: number; y: number; text: string } | null

/** Show only key hour ticks on X axis, like LeetCode's heatmap axis. */
function hourLabel(h: number) {
  if (h === 0) return '12am'
  if (h === 6) return '6am'
  if (h === 12) return '12pm'
  if (h === 18) return '6pm'
  return ''
}

export function DashboardHeatmap() {
  const [tooltip, setTooltip] = useState<TooltipState>(null)

  return (
    <section className="chart-box">
      <div className="card-title" style={{ marginBottom: '4px' }}>
        Alert Heatmap · last 7 days × 24 hours
      </div>
      <p style={{ fontSize: '12px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '16px' }}>
        Each cell = 1 hour. Colour = alert volume. Hotspots reveal attack windows.
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

        <div style={{ display: 'inline-grid', gap: '3px', minWidth: 0 }}>
          {/* Hour axis row */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '36px repeat(24, 1fr)',
              gap: '3px',
              marginBottom: '2px',
            }}
          >
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                style={{
                  fontSize: '9px',
                  color: hourLabel(h) ? 'var(--muted2)' : 'transparent',
                  fontFamily: 'var(--mono)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  userSelect: 'none',
                  minWidth: '14px',
                }}
              >
                {hourLabel(h) || '.'}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {DAYS.map(day => {
            const row = MOCK_HEATMAP_WEEK_HOURS[day] ?? Array(24).fill(0)
            return (
              <div
                key={day}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '36px repeat(24, 1fr)',
                  gap: '3px',
                }}
              >
                {/* Day label */}
                <div
                  style={{
                    fontSize: '10px',
                    color: 'var(--muted2)',
                    fontFamily: 'var(--mono)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    paddingRight: '6px',
                    userSelect: 'none',
                  }}
                >
                  {day}
                </div>

                {/* Hour cells */}
                {row.map((count, h) => {
                  const level = countToLevel(count)
                  return (
                    <div
                      key={h}
                      style={{
                        height: '14px',
                        borderRadius: '2px',
                        background: LEVEL_BG[level],
                        border: '1px solid rgba(255,255,255,0.04)',
                        cursor: 'default',
                      }}
                      onMouseEnter={e => {
                        const r = (e.target as HTMLElement).getBoundingClientRect()
                        const period = h < 12 ? 'am' : 'pm'
                        const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h
                        setTooltip({
                          x: r.left,
                          y: r.top,
                          text: `${day} ${displayH}${period}  ·  ${count} alert${count !== 1 ? 's' : ''}`,
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

        {/* Colour scale legend */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginTop: '14px',
            paddingLeft: '36px',
          }}
        >
          <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>None</span>
          {[0, 1, 2, 3, 4, 5].map(level => (
            <div
              key={level}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '2px',
                background: LEVEL_BG[level],
                border: '1px solid rgba(255,255,255,0.04)',
              }}
            />
          ))}
          <span style={{ fontSize: '10px', color: 'var(--muted)', fontFamily: 'var(--mono)' }}>High</span>
        </div>
      </div>
    </section>
  )
}
