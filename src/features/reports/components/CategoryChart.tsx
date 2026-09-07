/**
 * Garment Category Allocation — Figma 58:3595 `chart-card`.
 *
 * Grouped bars: one group per garment, one bar per warehouse, so the two
 * hubs can be compared category by category.
 *
 * Drawn with divs rather than SVG because that is what it is — a bar per
 * value, sized by percentage. Reaching for SVG here would add a coordinate
 * system to solve a problem flexbox already solves, and the labels would
 * need manual placement.
 *
 * Heights are proportional to the tallest bar across every group, not within
 * each group, or a category holding ten units would look like one holding
 * ten thousand.
 *
 * Bars come from the warehouses present in the data, so a third or fourth
 * site appears without a change here. Five series colours are defined and
 * cycled; past that they repeat, which is where a legend stops being
 * readable and the comparison belongs in the table below instead.
 */

/** Distinct series colours available in CSS. */
const SERIES_COLOURS = 5

import { Panel } from '@/components'
import { formatQuantity } from '@/domain/money'
import type { CategoryRow, WarehouseColumn } from '../pivot'

const BAR_AREA_HEIGHT = 200
/** Enough to be visible as "some" rather than nothing. */
const MIN_VISIBLE_PERCENT = 2

interface CategoryChartProps {
  categories: CategoryRow[]
  columns: WarehouseColumn[]
  loading: boolean
}

export function CategoryChart({ categories, columns, loading }: CategoryChartProps) {
  const peak = categories.reduce(
    (max, row) => Math.max(max, ...[...row.byWarehouse.values()]),
    0,
  )

  return (
    <Panel
      title="Garment Category Allocation"
      tone="sunken"
      busy={loading}
      meta={
        columns.length > 1 ? (
          <span className="panel__meta">
            Comparison across {columns.map((column) => column.name).join(' and ')}
          </span>
        ) : undefined
      }
    >
      {loading ? (
        <div className="chart-bars" aria-hidden>
          <span className="skeleton" style={{ height: BAR_AREA_HEIGHT }} />
        </div>
      ) : categories.length === 0 ? (
        <p className="panel__clear">No stock to compare.</p>
      ) : (
        <>
          <ul className="legend">
            {columns.map((column, index) => (
              <li className="legend__item" key={column.id}>
                <span
                  className={`legend__swatch legend__swatch--${index % SERIES_COLOURS}`}
                  aria-hidden
                />
                {column.name}
              </li>
            ))}
          </ul>

          <div className="chart-bars" style={{ height: BAR_AREA_HEIGHT }}>
            {categories.map((row) => (
              <div className="chart-bars__group" key={row.category}>
                <div className="chart-bars__bars">
                  {columns.map((column, index) => {
                    const units = row.byWarehouse.get(column.id) ?? 0
                    const percent = peak > 0 ? (units / peak) * 100 : 0
                    return (
                      <span
                        key={column.id}
                        className={`chart-bars__bar chart-bars__bar--${index % SERIES_COLOURS}`}
                        style={{
                          height: `${units > 0 ? Math.max(percent, MIN_VISIBLE_PERCENT) : 0}%`,
                        }}
                        title={`${column.name}: ${formatQuantity(units)} units`}
                      />
                    )
                  })}
                </div>
                <p className="chart-bars__label">{row.category}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </Panel>
  )
}
