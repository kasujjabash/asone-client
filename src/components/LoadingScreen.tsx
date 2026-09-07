/**
 * A whole screen that has not resolved yet.
 *
 * Used where there is genuinely nothing to hold the layout with — while the
 * session is being rebuilt from `/auth/me/` on boot, before the app knows
 * who is signed in or which shell to draw.
 *
 * The guards used to render `null` here, which is a blank white page for as
 * long as the request takes. This is the same wait, said out loud.
 */

import { BrandMark } from './BrandMark'
import { Spinner } from './Spinner'

export function LoadingScreen({ message = 'Loading…' }: { message?: string }) {
  return (
    <main className="loading-screen" aria-busy="true">
      <BrandMark width={110} />
      <p className="loading-screen__message">
        <Spinner size={16} label={message} />
        {message}
      </p>
    </main>
  )
}
