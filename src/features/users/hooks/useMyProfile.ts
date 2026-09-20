/**
 * The signed-in user editing their own record.
 *
 * ---------------------------------------------------------------------------
 * What a person may change about themselves, and what they may not
 * ---------------------------------------------------------------------------
 * Name, email and phone. **Not role, and not their site.**
 *
 * That is not this hook's choice — `PATCH /auth/me/` is an allow-list on the
 * server (`MeUpdateSerializer`), and its docstring is explicit that the list
 * is a security boundary rather than a convenience: `role`, `warehouse`,
 * `school`, `is_active` and `password` are all absent, so a school clerk
 * cannot patch themselves into Finance or reassign themselves to another
 * site. Sending one of those fields changes nothing.
 *
 * The screen mirrors that by showing role and site as facts with a line
 * saying who can change them, rather than as disabled inputs — a greyed-out
 * dropdown invites somebody to go looking for the permission to use it.
 *
 * `/auth/me/` also cannot address another user: there is no id in the URL and
 * no queryset to filter, so the object is always `request.user`. A lead
 * editing somebody else uses the Users & Roles screen, which is a different
 * endpoint with a different permission.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as authApi from '@/api/auth'
import { snackbar } from '@/components'
import { toApiError } from '@/api/errors'
import { useAuth } from '@/features/auth/hooks/useAuth'

export interface ProfileEdit {
  first_name?: string
  last_name?: string
  email?: string
  phone_number?: string
}

export function useUpdateMyProfile() {
  const queryClient = useQueryClient()
  const { refresh } = useAuth()

  return useMutation({
    mutationFn: (body: ProfileEdit) => authApi.updateMe(body),
    onSuccess: async (user) => {
      /*
       * `refresh()`, not a query invalidation. The signed-in user is React
       * state in `AuthProvider` rather than a react-query entry — the
       * sidebar's own name and every access check read it — so invalidating
       * a key would do nothing and the person would go on seeing their old
       * name until they signed out. This re-reads `/auth/me/` and adopts it.
       */
      await refresh()
      // Users & Roles lists the same person, and that one *is* a query.
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      snackbar.success('Profile saved', `You are shown as ${user.first_name} ${user.last_name}.`)
    },
    onError: (error) => {
      snackbar.error('Could not save your profile', toApiError(error).message)
    },
  })
}
