/**
 * How much of each list the home screen shows.
 *
 * A dashboard is a summary: it should answer "is anything wrong" at a glance,
 * not reproduce the screens behind it. Each panel shows this many rows and
 * links to the full view when there are more.
 *
 * The numbers follow the design's own panels — five timeline entries, four
 * alerts — and are gathered here so tuning them is one edit rather than a
 * hunt through components.
 */

export const PREVIEW = {
  /**
   * AsOne runs two warehouses today, so all of them fit. Five leaves room to
   * grow before the panel turns into a list, and the comparison stays
   * readable — bars scaled against the largest stop meaning much past that.
   */
  warehouses: 5,
  /** The design shows four. Beyond that a dashboard is nagging, not alerting. */
  alerts: 4,
  /** The design shows five. */
  activity: 5,
} as const
