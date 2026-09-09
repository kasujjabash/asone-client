/**
 * Where an order has got to — Figma order-details.
 *
 * Pills joined by short rules. Colours are the brand tokens: the step in
 * progress takes the accent (#5E8E8E) with white text, completed steps the
 * pale mint (#CCFBF1), and steps not yet reached the sunken grey.
 *
 * Four steps, not the design's seven. Invoiced, Paid, Picking and Completed
 * are not statuses the server has — see ORDER_TRAIL. `PICKED` is labelled
 * "Picking" because that is the design's word for the same point.
 *
 * A cancelled order leaves the trail entirely rather than being drawn as a
 * step: cancellation is an exit, not somewhere an order is heading.
 */

import { X } from 'lucide-react'
import { ORDER_STEP_LABELS, ORDER_TRAIL, orderTrailPosition } from '@/domain/status'
import type { SchoolOrder } from '@/api/types'

export function OrderStatusTrail({ order }: { order: SchoolOrder }) {
  if (order.status === 'CANCELLED') {
    return (
      <div className="trail trail--cancelled">
        <span className="trail__cancelled">
          <X size={16} aria-hidden />
          Cancelled
          {order.cancellation_reason && <em> — {order.cancellation_reason}</em>}
        </span>
      </div>
    )
  }

  const position = orderTrailPosition(order.status)

  return (
    <ol className="trail" aria-label="Order progress">
      {ORDER_TRAIL.map((step, index) => {
        const state = index < position ? 'done' : index === position ? 'current' : 'todo'

        return (
          <li key={step} className="trail__item">
            <span className={`trail__pill trail__pill--${state}`}>
              {ORDER_STEP_LABELS[step]}
            </span>
            {index < ORDER_TRAIL.length - 1 && <span className="trail__rule" aria-hidden />}
          </li>
        )
      })}
    </ol>
  )
}
