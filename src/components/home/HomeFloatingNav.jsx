import { Link } from 'react-router-dom'
import { BrandLockup } from '../ui/Brand.jsx'

export default function HomeFloatingNav() {
  return (
    <>
      <Link to="/" className="home-hero-nav__brand shrink-0">
        <BrandLockup className="h-9 md:h-10" iconSize={38} />
      </Link>
      <nav className="home-hero-nav__actions ml-auto flex shrink-0 items-center gap-4 md:gap-5" aria-label="Account">
        <Link to="/login" className="home-hero-nav__signin">
          Sign in
        </Link>
        <Link to="/signup" className="home-hero-nav__signup">
          Sign up for free
        </Link>
      </nav>
    </>
  )
}
