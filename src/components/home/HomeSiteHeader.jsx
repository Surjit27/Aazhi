import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BrandLockup } from '../ui/Brand.jsx'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

const SECTION_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#platform', label: 'How it works' },
  { href: '#portals', label: 'Portals' },
]

export default function HomeSiteHeader({ authSlot = null, showSectionNav = true }) {
  const reducedMotion = usePrefersReducedMotion()
  const [navPulse, setNavPulse] = useState(0)

  useEffect(() => {
    if (!showSectionNav || reducedMotion) return undefined
    const id = setInterval(() => setNavPulse((n) => (n + 1) % SECTION_LINKS.length), 4200)
    return () => clearInterval(id)
  }, [reducedMotion, showSectionNav])

  return (
    <header className="home-site-header home-site-header--transparent sticky top-0 z-40 w-full">
      <div className="home-site-header__grid home-content-shell px-4 py-3.5 md:px-8 md:py-5">
        <Link
          to="/"
          className="home-site-header__brand justify-self-start"
          aria-label="deepe home"
        >
          <BrandLockup className="h-9 md:h-10" iconSize={36} />
        </Link>

        {showSectionNav ? (
          <nav className="home-site-header__center" aria-label="Page sections">
            {SECTION_LINKS.map(({ href, label }, index) => (
              <a
                key={href}
                href={href}
                className={`home-site-header__link home-site-header__link--float relative px-4 py-2 text-sm font-medium ${
                  navPulse === index ? 'home-site-header__link--pulse' : ''
                }`}
              >
                {label}
              </a>
            ))}
            <span
              className="home-site-header__nav-glow"
              style={{
                '--nav-index': navPulse,
                '--nav-count': SECTION_LINKS.length,
              }}
              aria-hidden
            />
          </nav>
        ) : (
          <div className="hidden md:block" />
        )}

        <div className="home-site-header__actions justify-self-end">{authSlot}</div>
      </div>
    </header>
  )
}