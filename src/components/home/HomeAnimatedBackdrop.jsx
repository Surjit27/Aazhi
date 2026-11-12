import { useInView } from '../../hooks/useInView.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

/** Subtle theme-aligned motion behind home + auth (CSS-only). */
export default function HomeAnimatedBackdrop() {
  const reducedMotion = usePrefersReducedMotion()
  const [ref, inView] = useInView({ rootMargin: '120px', threshold: 0 })

  if (reducedMotion) return null

  const motionClass = inView ? 'home-bg-animated--running' : ''

  return (
    <div ref={ref} className={`home-bg-animated ${motionClass}`} aria-hidden>
      <div className="home-bg-mesh" />
      <span className="home-bg-orb home-bg-orb--primary" />
      <span className="home-bg-orb home-bg-orb--violet" />
      <span className="home-bg-orb home-bg-orb--teal" />
      <div className="home-bg-grid-drift" />
    </div>
  )
}
