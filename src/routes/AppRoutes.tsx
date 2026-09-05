/**
 * Routes.
 *
 * Sign-in is one route covering both steps: password, then the emailed code.
 * A separate URL for the code step could be landed on with no challenge to
 * answer.
 *
 * The rest of the app arrives behind RequireAuth with the app shell.
 */

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { SessionScreen } from '@/features/auth/screens/SessionScreen'
import { SignInScreen } from '@/features/auth/screens/SignInScreen'
import { WelcomeScreen } from '@/features/auth/screens/WelcomeScreen'
import { RequireAuth } from './RequireAuth'
import { paths } from './paths'

export function AppRoutes() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path={paths.welcome} element={<WelcomeScreen />} />
          <Route path={paths.signIn} element={<SignInScreen />} />
          <Route
            path={paths.session}
            element={
              <RequireAuth>
                <SessionScreen />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to={paths.welcome} replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
