/**
 * Create Account — both steps, one route, same shape as `SignInScreen`.
 *
 * Step one collects the account request; step two confirms the emailed
 * code. A code screen reachable on its own URL could be landed on with
 * nothing to verify, so which step shows is local state here rather than
 * two routes.
 *
 * Fully mocked: see `requestAccount`/`confirmAccount` in `api/auth.ts` for
 * why. Once a real registration endpoint exists, this screen's shape does
 * not need to change — only what it calls.
 */

import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import * as authApi from '@/api/auth'
import { toApiError, type ApiError } from '@/api/errors'
import type { LoginChallenge } from '@/api/types'
import { BrandMark, LoadingScreen, ServerUnreachable, snackbar } from '@/components'
import { paths } from '@/routes/paths'
import { CreateAccountForm } from '../components/CreateAccountForm'
import { SplitAuthLayout } from '../components/SplitAuthLayout'
import { VerifyEmailCard } from '../components/VerifyEmailCard'
import { useAuth } from '../hooks/useAuth'

export function CreateAccountScreen() {
  const { status, retry } = useAuth()
  const [challenge, setChallenge] = useState<LoginChallenge | null>(null)
  const [error, setError] = useState<ApiError | null>(null)
  const [pending, setPending] = useState(false)

  if (status === 'loading') return <LoadingScreen message="Checking your session…" />
  if (status === 'unreachable') return <ServerUnreachable onRetry={retry} />
  if (status === 'signedIn' || status === 'gated') {
    return <Navigate to={paths.dashboard} replace />
  }

  async function handleRequest(input: Parameters<typeof authApi.requestAccount>[0]) {
    setPending(true)
    setError(null)
    try {
      const issued = await authApi.requestAccount(input)
      setChallenge(issued)
      snackbar.info('Check your email', `We sent a verification code to ${issued.email_hint}.`)
    } catch (cause) {
      setError(toApiError(cause))
    } finally {
      setPending(false)
    }
  }

  async function handleVerify(code: string) {
    if (!challenge) return
    setPending(true)
    setError(null)
    try {
      await authApi.confirmAccount({ email: challenge.email_hint, code })
      snackbar.success('Account created', 'You can now sign in.')
    } catch (cause) {
      setError(toApiError(cause))
    } finally {
      setPending(false)
    }
  }

  if (challenge) {
    return (
      <SplitAuthLayout>
        <VerifyEmailCard
          emailHint={challenge.email_hint}
          onSubmit={handleVerify}
          onResend={() => snackbar.info('Code resent', `Check ${challenge.email_hint} again.`)}
          pending={pending}
          error={error}
        />
      </SplitAuthLayout>
    )
  }

  return (
    <SplitAuthLayout>
      <header className="signin__head">
        <BrandMark width={80} label="AsOne" />
        <h1 className="signin__title">Create Your Account</h1>
        <p className="signin__subtitle">Join the unified uniform management network</p>
      </header>

      <CreateAccountForm onSubmit={handleRequest} pending={pending} error={error} />
    </SplitAuthLayout>
  )
}
