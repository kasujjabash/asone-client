/**
 * Where the JWT pair lives.
 *
 * Isolated in one module so that "how tokens are stored" is a single
 * decision. Nothing outside `api/` should read these keys directly.
 *
 * Refresh tokens rotate and the spent one is blacklisted server-side, so
 * `set` must always be given the new refresh token when the server returns
 * one. Storing a spent refresh token logs the user out at the next 401.
 */

const ACCESS_KEY = 'asone.access'
const REFRESH_KEY = 'asone.refresh'

export interface TokenPair {
  access: string
  refresh: string
}

export const tokens = {
  get access(): string | null {
    return localStorage.getItem(ACCESS_KEY)
  },

  get refresh(): string | null {
    return localStorage.getItem(REFRESH_KEY)
  },

  set({ access, refresh }: TokenPair): void {
    localStorage.setItem(ACCESS_KEY, access)
    localStorage.setItem(REFRESH_KEY, refresh)
  },

  clear(): void {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}
