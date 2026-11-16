import HomePageShell from '../components/home/HomePageShell.jsx'
import HomeSiteHeader from '../components/home/HomeSiteHeader.jsx'
import Hyperspeed from '../components/hyperspeed/Hyperspeed.jsx'
import { HYPERSPEED_LIGHT } from '../components/hyperspeed/hyperspeedPresets.js'
import { HomeHeaderAuth, HomeHeroAuth } from '../components/home/HomeMarketingAuth.jsx'
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
    <HomePageShell className="home-page--immersive home-page--marketing">
      <HomeSiteHeader authSlot={<HomeHeaderAuth />} />
      <section className="home-hero-band home-hero-band--immersive relative flex flex-1 flex-col">
        {!reducedMotion ? (
          <div className="home-hero-hyperspeed" aria-hidden>
            <Hyperspeed {...HYPERSPEED_LIGHT} className="h-full w-full" />
          </div>
        ) : null}
        <div className="home-hero-band-fade" aria-hidden />
        <div className="home-hero-overlay home-hero-overlay--on-speed relative z-[2] flex min-h-[min(78vh,880px)] w-full flex-1 flex-col">
          <div className="home-hero-pitch relative z-[3] flex flex-1 flex-col items-center justify-center px-4 pb-14 text-center md:px-10 md:pb-20">
            <p className="home-hero-pitch__eyebrow home-section-eyebrow text-primary-600">{HOME_HERO_COPY.eyebrow}</p>
            <h1 className="home-hero-pitch__title home-reveal mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-ink md:text-[2.35rem] md:leading-[1.15]">
              {HOME_HERO_COPY.title}
            </h1>
            <p className="home-hero-pitch__lead home-reveal mt-4 max-w-md text-base leading-relaxed text-ink-muted md:max-w-lg md:text-[17px]">
              {HOME_HERO_COPY.lead}
            </p>
            <HomeHeroAuth className="home-hero-pitch__actions mt-9" />
          </div>
        </div>
      </section>
      <footer className="border-t border-line bg-white/50 px-4 py-6 text-center text-[11px] text-ink-subtle backdrop-blur-sm md:px-8">
        {BRAND_NAME} · home.localhost · client.localhost · admin.localhost
      </footer>
    </HomePageShell>
  )
}