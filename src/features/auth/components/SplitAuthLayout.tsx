/**
 * The two-panel auth layout.
 *
 * Brand deck on the left, form on the right, split 48/52 as designed.
 *
 * Below the breakpoint there is no room for both, so the brand panel is
 * dropped rather than stacked above the form — pushing a sign-in field below
 * the fold on a phone to make room for marketing is the wrong trade. The
 * form panel carries the mark itself, so branding survives the collapse.
 *
 * Shared by every auth screen: sign in, the forced password change, and
 * whatever recovery flow follows.
 */

import type { ReactNode } from 'react'
import { OnboardingPanel } from '@/features/onboarding/components/OnboardingPanel'

export function SplitAuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="split-auth">
      <div className="split-auth__brand">
        <OnboardingPanel />
      </div>

      <main className="split-auth__form">
        <div className="split-auth__column">{children}</div>
      </main>
    </div>
  )
}
