/**
 * The receiving flow's data.
 *
 * Three separate concerns, kept apart because they fail apart: the list of
 * orders is a read a clerk can retry, entering a receipt is a write that
 * must not be repeated, and posting is the irreversible one.
 *
 * `useFinalizeReceipt` chains create -> post inside a single mutation on
 * purpose. Two mutations would let the screen succeed at the first and fail
 * at the second with nothing on screen saying a receipt now exists unposted
 * — which is the one state a clerk must never be left guessing about. As one
 * mutation, a failure after create still returns the receipt, so the error
 * can name it.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as procurement from '@/api/procurement'
import { snackbar } from '@/components'

export function useOpenProductionOrders() {
  return useQuery({
    queryKey: ['production-orders', 'open'],
    queryFn: () => procurement.openProductionOrders(),
  })
}

/** The Expected column. Skipped until an order is chosen. */
export function useOutstanding(productionOrderId: number | null) {
  return useQuery({
    queryKey: ['production-orders', 'outstanding', productionOrderId],
    queryFn: () => procurement.outstandingOnOrder(productionOrderId as number),
    enabled: productionOrderId !== null,
  })
}

export interface FinalizeResult {
  receipt: Awaited<ReturnType<typeof procurement.createReceipt>>
  /** False when the receipt was recorded but posting failed. */
  posted: boolean
}

export function useFinalizeReceipt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: procurement.ReceiptInput): Promise<FinalizeResult> => {
      const receipt = await procurement.createReceipt(input)

      // Posting is F21 and writes the ledger. If it fails, the receipt still
      // exists and must not be created again — so the failure is reported
      // with the receipt rather than thrown away.
      try {
        const posted = await procurement.postReceipt(receipt.id)
        return { receipt: posted, posted: true }
      } catch {
        return { receipt, posted: false }
      }
    },
    onSuccess: ({ receipt, posted }) => {
      // Stock moved, so everything counting it is stale.
      void queryClient.invalidateQueries({ queryKey: ['inventory'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      void queryClient.invalidateQueries({ queryKey: ['production-orders'] })
      void queryClient.invalidateQueries({ queryKey: ['receipts'] })

      if (posted) {
        snackbar.success(
          `${receipt.number} posted to inventory`,
          'Stock has been raised at the receiving warehouse.',
        )
      } else {
        snackbar.warning(
          `${receipt.number} was recorded but not posted`,
          'The delivery is saved. Post it to inventory from the receipt to raise stock.',
        )
      }
    },
  })
}
