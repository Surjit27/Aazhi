import { Link } from 'react-router-dom'
import HomePageShell from '../components/home/HomePageShell.jsx'
import Hyperspeed from '../components/hyperspeed/Hyperspeed.jsx'
import { HYPERSPEED_LIGHT } from '../components/hyperspeed/hyperspeedPresets.js'
import HomeFloatingNav from '../components/home/HomeFloatingNav.jsx'
import Button from '../components/ui/Button.jsx'
import { BRAND_NAME } from '../components/ui/Brand.jsx'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'

const HOME_HERO_COPY = {
  eyebrow: 'Live · In motion',
  title: 'Scan what runs. Automate at the same speed.',
  lead: `${BRAND_NAME} maps live backends, sketches visual workflows, fires triggers, and tracks every run in real time — one workspace that moves with production, not a frozen diagram.`,
}

export default function HomePage() {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <HomePageShell className="home-page--immersive">
      <main className="flex min-h-[calc(100vh-4rem)] flex-1 flex-col">
        <section className="home-hero-band home-hero-band--immersive relative flex flex-1 flex-col">
          {!reducedMotion ? (
            <div className="home-hero-hyperspeed" aria-hidden>
              <Hyperspeed {...HYPERSPEED_LIGHT} className="h-full w-full" />
            </div>
          ) : null}
          <div className="home-hero-band-fade" aria-hidden />
          <div className="home-hero-overlay home-hero-overlay--on-speed relative z-[2] flex min-h-[min(78vh,880px)] w-full flex-1 flex-col">
            <header className="home-hero-nav home-reveal flex w-full items-center justify-between gap-4 px-4 py-6 md:px-10 md:py-8">
              <HomeFloatingNav />
            </header>
            <div
              className="home-hero-pitch relative z-[3] flex flex-1 flex-col items-center justify-center px-4 pb-14 text-center md:px-10 md:pb-20"
              style={{ animationDelay: '80ms' }}
            >
              <p className="home-hero-pitch__eyebrow home-section-eyebrow text-primary-600">{HOME_HERO_COPY.eyebrow}</p>
              {!reducedMotion ? (
                <p className="mt-2 text-[11px] font-medium text-ink-subtle md:text-xs">
                  Click the road to toggle 2× speed
                </p>
              ) : null}
              <h1 className="home-hero-pitch__title home-reveal mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-ink md:text-[2.35rem] md:leading-[1.15]">
                {HOME_HERO_COPY.title}
              </h1>
              <p className="home-hero-pitch__lead home-reveal mt-4 max-w-md text-base leading-relaxed text-ink-muted md:max-w-lg md:text-[17px]">
                {HOME_HERO_COPY.lead}
              </p>
              <div className="home-hero-pitch__actions mt-9 flex flex-wrap items-center justify-center gap-3">
                <Link to="/login">
                  <Button variant="secondary" className="home-hero-cta h-10 px-5 text-[14px]">
                    Sign in
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" className="home-hero-cta h-10 px-5 text-[14px]">
                    Sign up for free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white/50 px-4 py-6 text-center text-[11px] text-ink-subtle backdrop-blur-sm md:px-8">
        {BRAND_NAME} · home.localhost · client.localhost · admin.localhost
      </footer>
    </HomePageShell>
  )
}
