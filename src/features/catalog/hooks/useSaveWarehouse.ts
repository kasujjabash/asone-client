/**
 * Create or update a Warehouse. Same shape as `useSaveSchool`.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as catalogApi from '@/api/catalog'
import type { WarehouseInput } from '@/api/catalog'
import { snackbar } from '@/components'

export function useSaveWarehouse(id?: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: WarehouseInput) =>
      id ? catalogApi.updateWarehouse(id, input) : catalogApi.createWarehouse(input),
    meta: { silent: true },
    onSuccess: (warehouse) => {
      // Broad on purpose: also invalidates the unfiltered 'warehouses'
      // options key every picker (Schools' form, this one) reads from.
      void queryClient.invalidateQueries({ queryKey: ['warehouses'] })
      snackbar.success(id ? `${warehouse.name} updated` : `${warehouse.name} added`)
    },
  })
}
