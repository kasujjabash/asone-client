/**
 * The numbered step rail across the top of the receiving flow.
 *
 * A completed step shows a tick rather than its number, which is what tells
 * a clerk at a glance how far through they are — the design leans on it, and
 * it is the only thing distinguishing step 2 done from step 2 pending.
 *
 * Not clickable. Going back would mean re-deriving counts already keyed in,
 * and the flow is short enough that starting again is honest.
 */

import { CheckCircle2 } from 'lucide-react'
import { RECEIVING_STEPS, stepIndex, type ReceivingStep } from '../steps'

export function StepRail({ current }: { current: ReceivingStep }) {
  const position = stepIndex(current)

  return (
    <ol className="step-rail">
      {RECEIVING_STEPS.map((step, index) => {
        const done = index < position
        const active = index === position

        return (
          <li
            key={step.key}
            className={`step-rail__step${active ? ' step-rail__step--active' : ''}${
              done ? ' step-rail__step--done' : ''
            }`}
            aria-current={active ? 'step' : undefined}
          >
            <span className="step-rail__marker">
              {done ? <CheckCircle2 size={20} aria-hidden /> : index + 1}
            </span>
            <span className="step-rail__label">{step.label}</span>
          </li>
        )
      })}
    </ol>
  )
}
