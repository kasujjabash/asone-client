/**
 * Create or update a Tailoring Center.
 *
 * Same shape as `useSaveSchool` — one hook for both verbs, and the form
 * shows its own error inline, so the global failure snackbar is silenced.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as catalogApi from '@/api/catalog'
import type { TailoringCenterInput } from '@/api/catalog'
import { snackbar } from '@/components'

export function useSaveTailoringCenter(id?: number) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: TailoringCenterInput) =>
      id ? catalogApi.updateTailoringCenter(id, input) : catalogApi.createTailoringCenter(input),
    meta: { silent: true },
    onSuccess: (center) => {
      void queryClient.invalidateQueries({ queryKey: ['tailoring-centers'] })
      snackbar.success(id ? `${center.name} updated` : `${center.name} added`)
    },
  })
}
