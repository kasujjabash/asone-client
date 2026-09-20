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

/*
 * The mark at the size it was drawn: `BrandMark`'s own 158x70.
 *
 * It was 110, small enough that "MINISTRIES" under the wordmark did not
 * resolve. Going the other way to 240 only traded one wrong size for
 * another — blown past its geometry, it read as a splash screen rather than
 * a wait. The designed width is the one number here that is not a guess.
 *
 * `BrandMark` draws the green asset (`asone-logo.png`); the white one is for
 * the dark rail and would be invisible here, on `--canvas`.
 */
const MARK_WIDTH = 158

export function LoadingScreen({ message = 'Loading…' }: { message?: string }) {
  return (
    <main className="loading-screen" aria-busy="true">
      <BrandMark width={MARK_WIDTH} />
      <p className="loading-screen__message">
        <Spinner size={16} label={message} />
        {message}
      </p>
    </main>
  )
}
