import { useInView } from '../../hooks/useInView.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'
/** Light-theme motion behind home + auth (CSS mesh / orbs). */
export default function HomeAnimatedBackdrop() {
  const reducedMotion = usePrefersReducedMotion()
  const [ref, inView] = useInView({ rootMargin: '120px', threshold: 0 })

  const motionClass = inView && !reducedMotion ? 'home-bg-animated--running' : ''
  const showAccents = !reducedMotion

  return (
    <div ref={ref} className={`home-bg-animated ${motionClass}`} aria-hidden>
      {showAccents ? (
        <>
          <div className="home-bg-mesh" />
          <span className="home-bg-orb home-bg-orb--primary" />
          <span className="home-bg-orb home-bg-orb--violet" />
          <span className="home-bg-orb home-bg-orb--teal" />
          <div className="home-bg-grid-drift" />
        </>
      ) : null}
    </div>
  )
}
