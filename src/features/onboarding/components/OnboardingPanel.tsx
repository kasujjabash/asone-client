/**
 * The brand panel: the rotating introduction that fills the left half of
 * every auth screen.
 *
 * Not a screen of its own. The design puts this beside the sign-in form
 * rather than in front of it, so there is no "get past the intro" step — the
 * form is reachable the moment the page loads, and the deck rotates next to
 * someone already typing.
 *
 * It stays in its own feature because a phone has no room for a split, and
 * the mobile designs will likely want this same deck standalone.
 */

import workshopImage from '@/assets/onboarding/workshop.png'
import { BrandMark, PageDots } from '@/components'
import { BrandBackdrop } from './BrandBackdrop'
import { useCarousel } from '../hooks/useCarousel'
import { ONBOARDING_SLIDES } from '../slides'

const AUTOPLAY_MS = 6000

export function OnboardingPanel() {
  const { index, goTo } = useCarousel({
    count: ONBOARDING_SLIDES.length,
    intervalMs: AUTOPLAY_MS,
  })

  const slide = ONBOARDING_SLIDES[index]

  return (
    <BrandBackdrop image={workshopImage}>
      <div className="onboarding">
        <div className="onboarding__stage">
          <div className="onboarding__slide">
            <BrandMark width={158} />
            <p className="onboarding__title">{slide.title}</p>
            <p className="onboarding__body">{slide.body}</p>
          </div>

          <PageDots
            count={ONBOARDING_SLIDES.length}
            activeIndex={index}
            onSelect={goTo}
            label="Introduction"
          />
        </div>

        <footer className="onboarding__footer">
          © 2026 As One Logistics • Managed Uniform Operations
        </footer>
      </div>
    </BrandBackdrop>
  )
}
