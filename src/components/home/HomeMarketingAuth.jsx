import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'

export function HomeHeaderAuth() {
  return (
    <nav className="home-marketing-auth home-marketing-auth--compact flex items-center gap-2 md:gap-3" aria-label="Account">
      <Link to="/login" className="home-marketing-auth__signin">
        Sign in
      </Link>
      <Link to="/signup" className="home-marketing-auth__signup">
        <span>Sign up for free</span>
        <ArrowRight className="home-marketing-auth__arrow" size={15} aria-hidden />
      </Link>
    </nav>
  )
}

export function HomeHeroAuth({ className = '' }) {
  return (
    <div className={`home-marketing-auth home-marketing-auth--hero flex flex-wrap items-center justify-center gap-3 ${className}`}>
      <Link to="/signup" className="home-marketing-auth__signup home-marketing-auth__signup--lg">
        <span>Sign up for free</span>
        <ArrowRight className="home-marketing-auth__arrow" size={17} aria-hidden />
      </Link>
      <Link to="/login" className="home-marketing-auth__signin home-marketing-auth__signin--lg">
        Sign in
      </Link>
    </div>
  )
}