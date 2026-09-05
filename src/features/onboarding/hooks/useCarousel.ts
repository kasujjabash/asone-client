/**
 * Carousel position.
 *
 * Holds an index and the moves you can make on it — nothing about slides,
 * nothing about the DOM. A test can drive it without rendering, and the same
 * hook serves any stepped sequence.
 *
 * Advancing past the last item wraps to the first, which is what a looping
 * intro deck does. Autoplay is opt-in and pauses the moment someone takes
 * manual control, so the deck never moves under a reader's eyes.
 */

import { useCallback, useEffect, useState } from 'react'

interface CarouselOptions {
  count: number
  /** Milliseconds between automatic advances. Omit to disable autoplay. */
  intervalMs?: number
}

interface Carousel {
  index: number
  next: () => void
  previous: () => void
  goTo: (index: number) => void
}

export function useCarousel({ count, intervalMs }: CarouselOptions): Carousel {
  const [rawIndex, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  // Derived, not corrected after the fact: if slides are removed, an index
  // left pointing past the end resolves to the first during this render
  // rather than causing a second one.
  const index = count > 0 && rawIndex >= count ? 0 : rawIndex

  const next = useCallback(() => {
    setIndex((current) => (count > 0 ? (current + 1) % count : 0))
  }, [count])

  const previous = useCallback(() => {
    setIndex((current) => (count > 0 ? (current - 1 + count) % count : 0))
  }, [count])

  const goTo = useCallback((target: number) => {
    setPaused(true)
    setIndex(target)
  }, [])

  useEffect(() => {
    // A single-slide deck has nowhere to go; don't run a timer for it.
    if (!intervalMs || paused || count <= 1) return

    const timer = window.setInterval(next, intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs, paused, count, next])

  return { index, next, previous, goTo }
}
