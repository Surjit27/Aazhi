import Hyperspeed from '../hyperspeed/Hyperspeed.jsx'
import { HYPERSPEED_LIGHT } from '../hyperspeed/hyperspeedPresets.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

/** Full-viewport traveling light streaks (three.js) on the marketing home hero only. */
export default function HomeHyperspeedBackdrop({ interactive = false }) {
  const reducedMotion = usePrefersReducedMotion()
  if (reducedMotion) return null

  return (
    <div
      className={`home-hyperspeed-bg ${interactive ? 'home-hyperspeed-bg--interactive' : ''}`}
      aria-hidden={!interactive}
    >
      <Hyperspeed {...HYPERSPEED_LIGHT} className="h-full w-full" />
    </div>
  )
}