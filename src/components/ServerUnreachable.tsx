/**
 * The server did not answer, and we are still signed in.
 *
 * Shown instead of the sign-in screen, which is the whole point: the session
 * was never invalidated, the tokens are still held, and bouncing somebody to
 * a login form would tell them the opposite of what happened.
 *
 * Confirmed against `/api/health/` before this renders, so it is a statement
 * rather than a guess.
 */

import { CloudOff } from 'lucide-react'
import { BrandMark } from './BrandMark'
import { Button } from './Button'

export function ServerUnreachable({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="loading-screen">
      <BrandMark width={110} />

      <div className="unreachable">
        <CloudOff size={28} aria-hidden className="unreachable__icon" />
        <h1 className="unreachable__title">Cannot reach the server</h1>
        <p className="unreachable__body">
          You are still signed in — nothing has been lost. This will work again as soon as
          the connection is back.
        </p>
        <Button onClick={onRetry}>Try again</Button>
      </div>
    </main>
  )
}
