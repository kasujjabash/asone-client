/**
 * The Users tab's data: the staff list, and creating a new account.
 *
 * `page_size` is left at the server default rather than fixed here, unlike
 * `useOrders` — the Users list is small enough (tens, not hundreds) that
 * paging it the way the order ledger does would be premature.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/api/auth'
import type { UserAdmin, UserCreate } from '@/api/types'

export function useUsers() {
  return useQuery({
    queryKey: ['users', 'list'],
    queryFn: () => authApi.listUsers(),
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation<UserAdmin, unknown, UserCreate>({
    mutationFn: (input) => authApi.createUser(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users', 'list'] })
    },
  })
}
