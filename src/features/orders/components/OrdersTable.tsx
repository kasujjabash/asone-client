/**
 * The order table — Figma order-table.
 *
 * Column proportions are measured from the design: header text starts at
 * 430, 582, 905, 1116, 1245, 1460 and 1611 across a 1315px table.
 *
 * The design pairs the total with a payment badge and shows order status
 * separately. There is no payment field on the server, but releasing an
 * order *is* the payment confirmation and records `released_at` — so the
 * badge is derived from that rather than invented.
 *
 * A cancelled order's total is struck through, as the design has it: the
 * figure is still the record of what was invoiced, but nothing is owed.
 */

import { useNavigate } from 'react-router-dom'
import { PackageOpen } from 'lucide-react'
import { Badge, EmptyState, SkeletonRows } from '@/components'
import { formatUGX } from '@/domain/money'
import { paymentLabel, paymentTone, schoolOrderTone } from '@/domain/status'
import type { SchoolOrder } from '@/api/types'

interface OrdersTableProps {
  orders: SchoolOrder[]
  loading: boolean
}

export function OrdersTable({ orders, loading }: OrdersTableProps) {
  const navigate = useNavigate()
  if (loading) return <SkeletonRows rows={8} height="44px" />

  if (orders.length === 0) {
    return (
      <EmptyState
        icon={PackageOpen}
        title="No orders here"
        body="Nothing matches this tab and filter. An empty list is often a correct answer — the server returns only the orders your role and site may see."
      />
    )
  }

  return (
    <div className="scroll-x">
      <table className="ledger ledger--orders">
        <colgroup>
          <col className="col-order" />
          <col className="col-school" />
          <col className="col-student" />
          <col className="col-items" />
          <col className="col-total" />
          <col className="col-status" />
          <col className="col-date" />
        </colgroup>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>School Name</th>
            <th>Student</th>
            <th>Items</th>
            <th>Total (UGX)</th>
            <th>Order Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const cancelled = order.status === 'CANCELLED'

            return (
              /*
                The whole row opens the order, not just the number — a table
                of orders is a list of things to open, and hunting for the
                one clickable cell is needless work. It stays a real link as
                well, so middle-click, ctrl-click and the keyboard all behave.
              */
              <tr
                key={order.id}
                className="ledger__row--clickable"
                onClick={() => navigate(`/orders/${order.id}`)}
              >
                <td>
                  <a
                    className="ledger__link"
                    href={`/orders/${order.id}`}
                    onClick={(event) => {
                      // The row handler already navigates; let modified
                      // clicks fall through to the browser.
                      if (!event.metaKey && !event.ctrlKey) event.preventDefault()
                    }}
                  >
                    {order.number}
                  </a>
                </td>
                <td className="ledger__strong">{order.school_name}</td>
                <td>{order.student_name}</td>
                <td className="t-numeric">{order.lines.length}</td>
                <td>
                  <span className="order-total">
                    <span className={cancelled ? 'order-total__void' : 'order-total__value'}>
                      {formatUGX(order.total)}
                    </span>
                    <Badge tone={paymentTone(order)}>{paymentLabel(order)}</Badge>
                  </span>
                </td>
                <td>
                  <Badge tone={schoolOrderTone(order.status)}>{order.status_display}</Badge>
                </td>
                <td>{order.order_date}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
