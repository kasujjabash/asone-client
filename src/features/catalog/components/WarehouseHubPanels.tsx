/**
 * The four queue panels on a warehouse's hub console.
 *
 * Each is a preview over a real, already-existing endpoint — nothing here
 * invents a status the server does not have. Two honest gaps, stated rather
 * than filled:
 *
 *   Active Picking Queue has no assignee. `PartProcessedOrderSerializer`
 *   does not name who is picking an order — nobody is assigned one in this
 *   system — so the row shows the order and the school, not a person. Every
 *   row here also shares one real status: the report's own query is
 *   `status=PICKED`, so the badge shows that fact rather than inventing a
 *   second "in progress" state the server cannot tell apart from it.
 *
 *   Recent Dispatch Logs has no full list screen yet (`/shipments` is a
 *   placeholder), so unlike the other panels it states "+N more" rather
 *   than linking somewhere unfinished.
 */

import { AlertTriangle, FileText, Package } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge, Panel, SkeletonRows } from '@/components'
import { formatQuantity } from '@/domain/money'
import { fulfilmentTone } from '@/domain/production'
import { paths } from '@/routes/paths'
import type { PartProcessedOrder, ProductionOrder, ReorderAlert, Shipment } from '@/api/types'

const ROWS_SHOWN = 6

/**
 * What an order contains, in one line.
 *
 * Every description joined together ran to four wrapped lines on a
 * six-SKU order, which made one row taller than the three below it and the
 * column ragged. The first SKU and a count of the rest says the same thing
 * in a line that always fits — the full manifest is one click away on the
 * order itself, which is where somebody reading it in detail is going.
 */
function lineSummary(order: ProductionOrder): string {
  const [first, ...rest] = order.lines.map((line) => line.sku_description)
  const items = `${formatQuantity(order.total_quantity)} items`

  if (!first) return items
  if (rest.length === 0) return `${first} · ${items}`
  return `${first} +${rest.length} more · ${items}`
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

interface IncomingProductionPanelProps {
  orders: ProductionOrder[]
  total: number
  loading: boolean
}

export function IncomingProductionPanel({ orders, total, loading }: IncomingProductionPanelProps) {
  return (
    <Panel
      title="Incoming Production from TCs"
      busy={loading}
      meta={
        /* `.panel__count`, the same plain count the dashboard's panels use.
           This was a `<Badge>`, which is the component for a *status* on a
           row — using it for a panel's tally made the heading of every hub
           panel louder than the same heading at home. */
        !loading && total > 0 ? (
          <span className="panel__count">
            {total} ACTIVE PO{total === 1 ? '' : 'S'}
          </span>
        ) : undefined
      }
      viewAll={
        !loading && total > ROWS_SHOWN
          ? { to: paths.productionOrders, total, noun: 'production orders' }
          : undefined
      }
    >
      {loading ? (
        <SkeletonRows rows={3} />
      ) : orders.length === 0 ? (
        <p className="panel__clear">No production orders are open on this warehouse.</p>
      ) : (
        <ul className="attention">
          {orders.slice(0, ROWS_SHOWN).map((order) => (
            <li className="attention__item attention__item--clickable" key={order.id}>
              <Link className="attention__hit" to={`${paths.productionOrders}/${order.id}`}>
                <span className="attention__label">
                  <FileText size={18} aria-hidden />
                  {order.number} · {order.tailoring_center_name}
                  <span className="attention__detail">{lineSummary(order)}</span>
                </span>
                <Badge tone={fulfilmentTone(order.fulfilment_status)}>
                  {order.fulfilment_status_display}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}

    </Panel>
  )
}

interface LowStockAlertsPanelProps {
  alerts: ReorderAlert[]
  loading: boolean
}

export function LowStockAlertsPanel({ alerts, loading }: LowStockAlertsPanelProps) {
  const shown = alerts.slice(0, ROWS_SHOWN)

  return (
    <Panel
      title="Low Stock Alerts"
      busy={loading}
      meta={
        !loading && alerts.length > 0 ? (
          <span className="panel__count">
            {alerts.length} CRITICAL
          </span>
        ) : undefined
      }
      /* Inventory, where Low stock only narrows to exactly these rows. The
         warehouse is already selected — the console set it on the way in. */
      viewAll={
        !loading && alerts.length > ROWS_SHOWN
          ? { to: paths.inventory, total: alerts.length, noun: 'low stock SKUs' }
          : undefined
      }
    >
      {loading ? (
        <SkeletonRows rows={3} />
      ) : alerts.length === 0 ? (
        <p className="panel__clear">Nothing is below its reorder floor at this warehouse.</p>
      ) : (
        /*
          `.attention`, the dashboard's own Needs Attention list — not a
          second row shape saying the same thing. This was `.hub-card-item`,
          which set its title at body size and bold where the dashboard's
          equivalent is caption weight normal, so the same alert read heavier
          here than at home.
        */
        <ul className="attention">
          {shown.map((alert) => (
            <li className="attention__item attention__item--clickable" key={alert.sku_number}>
              {/*
                Inventory, the same place this panel's "view all" goes.
                Stock History for that one SKU would answer "why is this at
                zero" better, but `ReorderAlert` carries the SKU *number* and
                not its id, and the history filters by id — so linking there
                would mean guessing, and a link to the wrong SKU's ledger is
                worse than a link to the right screen.
              */}
              <Link className="attention__hit" to={paths.inventory}>
              <span className="attention__label">
                <AlertTriangle size={18} aria-hidden />
                {alert.sku_number} · {alert.sku_description}
                {/* Spelled out. The tag used to carry "0 / 120", which is two
                    numbers and no way to tell which is which. */}
                <span className="attention__detail">
                  {formatQuantity(alert.level)} in stock · floor is{' '}
                  {formatQuantity(alert.minimum)}
                </span>
              </span>
              {/* A word, like the dashboard's tags — "out" reads at a glance
                  where a figure has to be compared with another figure. */}
              <span className="attention__tag attention__tag--error">
                {alert.level === 0 ? 'OUT' : 'LOW'}
              </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

    </Panel>
  )
}

interface PickingQueuePanelProps {
  orders: PartProcessedOrder[]
  total: number
  loading: boolean
}

export function PickingQueuePanel({ orders, total, loading }: PickingQueuePanelProps) {
  return (
    <Panel
      title="Active Picking Queue"
      busy={loading}
      viewAll={
        !loading && total > ROWS_SHOWN
          ? { to: paths.orders, total, noun: 'orders' }
          : undefined
      }
    >
      {loading ? (
        <SkeletonRows rows={3} />
      ) : orders.length === 0 ? (
        <p className="panel__clear">Nothing picked is waiting on a shipment.</p>
      ) : (
        <ul className="attention">
          {orders.slice(0, ROWS_SHOWN).map((order) => (
            <li className="attention__item attention__item--clickable" key={order.id}>
              <Link className="attention__hit" to={`${paths.orders}/${order.id}`}>
                <span className="attention__label">
                  <Package size={18} aria-hidden />
                  {order.number} · {order.school_name}
                  <span className="attention__detail">{order.student_name}</span>
                </span>
                <Badge tone="success">{order.status_display}</Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

interface DispatchLogPanelProps {
  shipments: Shipment[]
  total: number
  loading: boolean
}

export function DispatchLogPanel({ shipments, total, loading }: DispatchLogPanelProps) {
  const shown = shipments.slice(0, ROWS_SHOWN)

  return (
    <Panel
      title="Recent Dispatch Logs"
      busy={loading}
      /* Despatched shipments are their own screen — `/shipments` lands on the
         picking backlog, and the history behind it is where these rows live
         in full. */
      viewAll={
        !loading && total > ROWS_SHOWN
          ? { to: '/shipments/history', total, noun: 'dispatches' }
          : undefined
      }
    >
      {loading ? (
        <SkeletonRows rows={3} />
      ) : shipments.length === 0 ? (
        <p className="panel__clear">Nothing has shipped from this warehouse yet.</p>
      ) : (
        /*
          `.timeline`, the dashboard's Recent Activity markup. A despatch log
          *is* an activity feed — things that happened, newest first — and it
          was drawn as a third row shape with its own dot, its own title
          weight and its own meta line.

          The dot colour carries the state, the way it does on the dashboard:
          confirmed deliveries are settled, everything else is still moving.
        */
        <ol className="timeline">
          {shown.map((shipment) => (
            <li className="timeline__entry timeline__entry--clickable" key={shipment.id}>
              <span
                className={`timeline__dot timeline__dot--${shipment.received_at ? 'success' : 'info'}`}
                aria-hidden
              />
              <Link className="timeline__hit" to={`/shipments/${shipment.id}`}>
              <span className="timeline__body">
                {/*
                  A van is addressed to a school and carries several orders
                  (F42), so it is named by its own number and its consignee.
                */}
                <b>
                  {shipment.number} — {shipment.school_name}
                </b>
                <small>
                  {formatDate(shipment.shipped_on)} · {shipment.order_count} order
                  {shipment.order_count === 1 ? '' : 's'} ·{' '}
                  {shipment.received_at ? 'delivered' : 'in transit'}
                </small>
              </span>
              </Link>
            </li>
          ))}
        </ol>
      )}

    </Panel>
  )
}
