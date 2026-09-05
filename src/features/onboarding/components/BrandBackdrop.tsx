/**
 * A photograph read through the brand wash.
 *
 * The design layers three things: a solid brand fill, the photograph over
 * it, then the same brand colour again at 0.9 alpha. The bottom fill matters
 * — it is what shows while the photograph is still loading, and it keeps the
 * white type legible in that moment instead of flashing it onto bare page.
 *
 * Decorative: the image carries no information the text does not, so it is
 * hidden from assistive technology rather than given a description.
 */

import type { ReactNode } from 'react'

interface BrandBackdropProps {
  /** Imported image URL, so the bundler fingerprints it. */
  image: string
  children: ReactNode
}

export function BrandBackdrop({ image, children }: BrandBackdropProps) {
  return (
    <div className="backdrop">
      <div className="backdrop__layers" aria-hidden>
        <img className="backdrop__image" src={image} alt="" />
        <div className="backdrop__wash" />
      </div>
      <div className="backdrop__content">{children}</div>
    </div>
  )
}
