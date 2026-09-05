/**
 * Read the session.
 *
 * Throws rather than returning null when used outside the provider — that is
 * a wiring mistake, and failing loudly at the first render beats every screen
 * quietly behaving as though nobody is signed in.
 */

import { useContext } from 'react'
import { AuthContext, type AuthState } from '../AuthContext'

export function useAuth(): AuthState {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside <AuthProvider>')
  return value
}
