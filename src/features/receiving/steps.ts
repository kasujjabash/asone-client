/**
 * The four steps of a receipt, as the design draws them.
 *
 * A plain model rather than state inside the screen, so the rail, the guard
 * on "can I go forward" and the heading all read the same list. Adding a
 * step is one entry here.
 */

export const RECEIVING_STEPS = [
  { key: 'order', label: 'Select PO' },
  { key: 'packing-list', label: 'Packing List' },
  { key: 'compare', label: 'Compare' },
  { key: 'confirm', label: 'Confirm' },
] as const

export type ReceivingStep = (typeof RECEIVING_STEPS)[number]['key']

export function stepIndex(step: ReceivingStep): number {
  return RECEIVING_STEPS.findIndex((entry) => entry.key === step)
}
