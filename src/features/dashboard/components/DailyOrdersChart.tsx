/**
 * Daily Orders This Month — Figma 2001:971.
 *
 * From `/dashboard/order-volume/`, which returns the series with its total
 * and daily average already computed — and, unlike the order list, is
 * readable by the reporting roles.
 *
 * Hand-drawn SVG rather than a charting library: one series with a dashed
 * grid did not justify 40kB plus a theming layer.
 *
 * Drawn to the scale, which is the rule that matters. The y-axis ticks come
 * from the data's own maximum rounded up to a round step, so every label
 * names a value the line can reach — the design's fixed 10–50 axis would be
 * wrong the first day thirty orders came in. Chart text takes its colour
 * from tokens so it reads in either theme.
 */

import { Panel, Skeleton } from '@/components'
import { formatQuantity } from '@/domain/money'
import type { DailyOrders } from '../hooks/useDailyOrders'

const WIDTH = 460
const HEIGHT = 168
const PADDING = { top: 12, right: 12, bottom: 26, left: 34 }

const PLOT_WIDTH = WIDTH - PADDING.left - PADDING.right
const PLOT_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom

/** A round step that clears the peak — 5, 10, 20, 50, 100… */
function axisMax(peak: number): number {
  if (peak <= 5) return 5
  const magnitude = 10 ** Math.floor(Math.log10(peak))
  for (const multiple of [1, 2, 5, 10]) {
    const candidate = magnitude * multiple
    if (candidate >= peak) return candidate
  }
  return magnitude * 10
}

export function DailyOrdersChart({ data }: { data: DailyOrders }) {
  const { days, average, total, isLoading } = data

  const peak = days.reduce((max, day) => Math.max(max, day.orders), 0)
  const max = axisMax(peak)
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((fraction) => Math.round(max * fraction))

  const x = (index: number) =>
    PADDING.left + (index / Math.max(days.length - 1, 1)) * PLOT_WIDTH
  const y = (orders: number) => PADDING.top + PLOT_HEIGHT - (orders / max) * PLOT_HEIGHT

  const line = days.map((day, index) => `${x(index)},${y(day.orders)}`).join(' ')
  const baseline = PADDING.top + PLOT_HEIGHT
  const area = `${PADDING.left},${baseline} ${line} ${PADDING.left + PLOT_WIDTH},${baseline}`

  // Weeks start every seventh day of the series, placed where they fall.
  const weeks = days.map((_, index) => index).filter((index) => index % 7 === 0)

  return (
    <Panel
      title="Daily Orders This Month"
      minHeight="var(--panel-h-chart)"
      busy={isLoading}
      meta={<span className="panel__meta">Avg: {formatQuantity(average)} orders/day</span>}
    >
      {isLoading ? (
        <Skeleton height="120px" />
      ) : days.length === 0 || total === 0 ? (
        <p className="panel__clear">No orders placed this month.</p>
      ) : (
        <svg
          className="chart__svg"
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          role="img"
          aria-label={`${formatQuantity(total)} orders this month, averaging ${average} a day`}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={PADDING.left + PLOT_WIDTH}
                y1={y(tick)}
                y2={y(tick)}
                className="chart__grid"
              />
              <text x={PADDING.left - 8} y={y(tick) + 4} className="chart__tick">
                {tick}
              </text>
            </g>
          ))}

          <polygon points={area} className="chart__area" />
          <polyline points={line} className="chart__line" />

          {weeks.map((index, week) => (
            <text key={index} x={x(index)} y={HEIGHT - 6} className="chart__week">
              Week {week + 1}
            </text>
          ))}
        </svg>
      )}
    </Panel>
  )
}
