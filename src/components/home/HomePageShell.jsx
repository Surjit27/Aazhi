import HomeAnimatedBackdrop from './HomeAnimatedBackdrop.jsx'
import HomeHyperspeedBackdrop from './HomeHyperspeedBackdrop.jsx'

/** Wraps home marketing / auth pages: Hyperspeed / mesh backdrop + stacked content. */
export default function HomePageShell({
  children,
  className = '',
  hyperspeed = false,
  hyperspeedInteractive = false,
}) {
  const immersive = hyperspeed || className.includes('home-page--immersive')

  return (
    <div
      className={`home-bg-shell flex min-h-full flex-col bg-app-canvas ${immersive ? 'home-page--immersive home-page--hyperspeed' : ''} ${className}`}
    >
      {hyperspeed ? <HomeHyperspeedBackdrop interactive={hyperspeedInteractive} /> : null}
      <HomeAnimatedBackdrop />
      {hyperspeed ? <div className="home-hyperspeed-vignette" aria-hidden /> : null}
      <div className="relative z-[1] flex min-h-full flex-1 flex-col">{children}</div>
    </div>
  )
}
