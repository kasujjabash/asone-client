/**
 * One order, and the three things that can be done to it from this screen.
 *
 * Release, cancel and confirm-receipt all invalidate the order and the lists
 * it appears in — the status changed, so anything showing it is now wrong.
 *
 * None of them move stock. Releasing queues an order for picking, picking is
 * what moves the ledger, and confirming receipt deliberately does not: the
 * goods left at ship and stay gone, or a parcel already on a lorry would
 * still count as the warehouse's for days.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as ordersApi from '@/api/orders'
import { snackbar } from '@/components'

export function useOrder(id: number) {
  return useQuery({
    queryKey: ['orders', 'detail', id],
    queryFn: () => ordersApi.schoolOrder(id),
  })
}

export function useOrderInvoice(id: number) {
  return useQuery({
    queryKey: ['orders', 'invoice', id],
    queryFn: () => ordersApi.invoice(id),
  })
}

/** Everything an order change makes stale. */
function useInvalidateOrder() {
  const queryClient = useQueryClient()

  return () => {
    void queryClient.invalidateQueries({ queryKey: ['orders'] })
    // The dashboard counts orders by status, so it is stale too.
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

export function useReleaseOrder(id: number) {
  const invalidate = useInvalidateOrder()

  return useMutation({
    mutationFn: (paymentReference?: string) =>
      ordersApi.releaseOrder(id, paymentReference ? { payment_reference: paymentReference } : {}),
    onSuccess: (order) => {
      invalidate()
      snackbar.success(`${order.number} released for picking`, 'Payment confirmed.')
    },
    // Failure is reported by the shared mutation handler.
  })
}

/**
 * The school confirms a parcel arrived — the second half of F41.
 *
 * The order only becomes Completed once *every* shipment on it is confirmed,
 * so the success wording reads off the order the server returns rather than
 * announcing a completion that may not have happened yet.
 */
export function useConfirmReceipt(id: number) {
  const invalidate = useInvalidateOrder()

  return useMutation({
    mutationFn: (body?: { shipment?: number; notes?: string }) =>
      ordersApi.confirmReceipt(id, body),
    onSuccess: (shipment) => {
      invalidate()
      snackbar.success(
        `${shipment.number} confirmed as delivered`,
        'Thank you — the order closes once every parcel on it is confirmed.',
      )
    },
  })
}

export function useOrderShipments(id: number, enabled = true) {
  return useQuery({
    queryKey: ['orders', 'shipments', id],
    queryFn: () => ordersApi.orderShipments(id),
    enabled,
  })
}

export function useCancelOrder(id: number) {
  const invalidate = useInvalidateOrder()

  return useMutation({
    mutationFn: (reason: string) => ordersApi.cancelOrder(id, reason),
    onSuccess: (order) => {
      invalidate()
      snackbar.success(`${order.number} cancelled`, 'The invoice is void; nothing was deleted.')
    },
  })
}
