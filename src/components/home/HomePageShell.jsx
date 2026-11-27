import HomeAnimatedBackdrop from './HomeAnimatedBackdrop.jsx'
import HomeHyperspeedBackdrop from './HomeHyperspeedBackdrop.jsx'

/** Wraps home marketing / auth pages: Hyperspeed / mesh backdrop + stacked content. */
export default function HomePageShell({
  children,
  className = '',
  hyperspeed = false,
  hyperspeedInteractive = false,
  /** Auth on home.localhost — no road animation or marketing backdrops. */
  authOnly = false,
}) {
  const immersive = !authOnly && (hyperspeed || className.includes('home-page--immersive'))
  /** Full-viewport hyperspeed; marketing home uses hero-scoped backdrop in `HomePage` instead. */
  const showHyperspeed = !authOnly && hyperspeed

  return (
    <div
      className={`home-bg-shell flex min-h-full flex-col bg-app-canvas ${immersive ? 'home-page--immersive home-page--hyperspeed' : ''} ${authOnly ? 'home-page--auth-plain' : ''} ${className}`}
    >
      {showHyperspeed ? <HomeHyperspeedBackdrop interactive={hyperspeedInteractive} /> : null}
      {!authOnly ? <HomeAnimatedBackdrop /> : null}
      {showHyperspeed ? <div className="home-hyperspeed-vignette" aria-hidden /> : null}
      <div className="relative z-[1] flex min-h-full flex-1 flex-col">{children}</div>
    </div>
  )
}
