/**
 * What the onboarding carousel says.
 *
 * Content lives apart from the components that render it so that adding,
 * reordering or rewording a slide never touches a component — and so that
 * the copy can be handed to someone who does not read TSX.
 *
 * The design shows a three-slide deck. Only the first frame has been shared
 * (Figma node 54:1483), so slide one is verbatim from it; slides two and
 * three are drafted here and need ERA 92's sign-off before AsOne sees them.
 *
 * They follow slide one's shape deliberately — three clipped words, then one
 * sentence — and each covers a different part of what the system actually
 * does: procurement, the point of sale, and the ledger. Nothing in them
 * promises a feature the server does not have; there is no mention of
 * shipping, releasing an order or backorders, all of which are unbuilt.
 */

export interface OnboardingSlide {
  id: string
  title: string
  body: string
}

export const ONBOARDING_SLIDES: readonly OnboardingSlide[] = [
  {
    id: 'uniforms-stock-delivered',
    title: 'Uniforms. Stock. Delivered.',
    body: 'Streamline your warehouse operations, track uniforms across regions, and manage inventory allocations all in one unified logistics dashboard.',
  },
  {
    id: 'ordered-picked-invoiced',
    title: 'Ordered. Picked. Invoiced.',
    body: 'A school orders for a named student, and the warehouse gets a pick list while the parent gets an invoice at the price agreed that day.',
  },
  {
    id: 'counted-traced-explained',
    title: 'Counted. Traced. Explained.',
    body: 'Every receipt, adjustment and transfer leaves a permanent entry with a name against it, so any stock figure can be traced back to the movements behind it.',
  },
]
