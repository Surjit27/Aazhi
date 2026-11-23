import HomeAutomationPipeline from '../components/home/HomeAutomationPipeline.jsx'
import HomePageShell from '../components/home/HomePageShell.jsx'
import HomePortalStrip from '../components/home/HomePortalStrip.jsx'
import HomeProductRail from '../components/home/HomeProductRail.jsx'
import { HomeHeaderAuth, HomeHeroAuth } from '../components/home/HomeMarketingAuth.jsx'
import HomeSiteFooter from '../components/home/HomeSiteFooter.jsx'
import HomeSiteHeader from '../components/home/HomeSiteHeader.jsx'
import HomeHyperspeedBackdrop from '../components/home/HomeHyperspeedBackdrop.jsx'
import { BRAND_NAME } from '../components/ui/Brand.jsx'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion.js'

const HOME_HERO_COPY = {
  eyebrow: 'Live · In motion',
  title: 'Scan what runs. Automate at the same speed.',
  lead: `${BRAND_NAME} maps live backends, sketches visual workflows, fires triggers, and tracks every run in real time — one workspace that moves with production, not a frozen diagram.`,
}

const CHALLENGES = [
  {
    n: '01',
    title: 'The documentation gap',
    points: [
      'Architecture diagrams drift from running services',
      'Reverse engineering lives in one-off scripts',
      'Automation is designed without a live system map',
    ],
  },
  {
    n: '02',
    title: 'The workflow bottleneck',
    points: [
      'Hand-built runbooks outpace the official process',
      'Triggers are wired ad hoc per team',
      'Visual workflow intent never reaches production',
    ],
  },
  {
    n: '03',
    title: 'The visibility blind spot',
    points: [
      'Runs and injected events lack a single monitor',
      'Failures surface only after downstream impact',
      'No portfolio view of backends and automation health',
    ],
  },
]

const JOURNEY = [
  { step: 'Discover', detail: 'Index a backend from Git' },
  { step: 'Model', detail: 'Map microarchitecture' },
  { step: 'Design', detail: 'Build visual workflows' },
  { step: 'Trigger', detail: 'Schedule and hook events' },
  { step: 'Observe', detail: 'Monitor runs and data' },
]

export default function HomePage() {
  const reducedMotion = usePrefersReducedMotion()

  return (
    <HomePageShell className="home-page--immersive home-page--marketing">
      <HomeSiteHeader authSlot={<HomeHeaderAuth />} />

      <section className="home-hero-band home-hero-band--immersive relative flex flex-col" aria-labelledby="home-hero-title">
        {!reducedMotion ? (
          <div className="home-hero-hyperspeed" aria-hidden>
            <HomeHyperspeedBackdrop interactive />
          </div>
        ) : null}
        <div className="home-hero-band-fade" aria-hidden />
        <div className="home-hero-overlay home-hero-overlay--on-speed relative z-[2] flex min-h-[min(68vh,760px)] w-full flex-col">
          <div className="home-hero-pitch home-content-shell relative z-[3] flex flex-1 flex-col items-center justify-center px-4 pb-16 pt-2 text-center md:px-8 md:pb-20">
            <p className="home-hero-pitch__eyebrow home-section-eyebrow text-primary-600">{HOME_HERO_COPY.eyebrow}</p>
            {!reducedMotion ? (
              <p className="mt-2 text-[11px] font-medium text-ink-subtle md:text-xs">Click the road to toggle 2× speed</p>
            ) : null}
            <h1
              id="home-hero-title"
              className="home-hero-pitch__title home-reveal mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-ink md:text-[2.5rem] md:leading-[1.12]"
            >
              {HOME_HERO_COPY.title}
            </h1>
            <p className="home-hero-pitch__lead home-reveal mt-4 max-w-lg text-base leading-relaxed text-ink-muted md:max-w-xl md:text-[17px]">
              {HOME_HERO_COPY.lead}
            </p>
            <HomeHeroAuth className="home-hero-pitch__actions home-reveal mt-9" />
          </div>
        </div>
      </section>

      <main className="home-content-shell flex-1 px-4 md:px-8">
        <section id="features" className="grid scroll-mt-28 items-center gap-10 border-b border-line py-14 md:py-20 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-6">
            <p className="home-section-eyebrow home-reveal text-primary-600">Client workspace</p>
            <h2 className="home-reveal text-2xl font-semibold tracking-tight text-ink md:text-3xl">
              Close the gap between live APIs and automated workflows.
            </h2>
            <p className="home-reveal max-w-xl text-base leading-relaxed text-ink-muted">
              Index repositories, explore routes and services, design flows on a canvas, and monitor executions without
              leaving the same UI your team uses after sign-in.
            </p>
            <a href="#platform" className="home-reveal text-sm font-medium text-primary-600 hover:text-primary-700">
              See the automation pipeline →
            </a>
          </div>
          <div className="home-reveal home-hero-rail-slot flex lg:min-h-[360px]">
            <HomeProductRail className="home-auth-rail-float w-full min-h-[320px]" portal="client" />
          </div>
        </section>

        <section className="border-b border-line py-14 md:py-18">
          <p className="home-section-eyebrow text-ink-subtle">Three challenges</p>
          <h2 className="home-reveal mt-3 max-w-2xl text-2xl font-semibold text-ink">Where automation programs hit a ceiling</h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {CHALLENGES.map((c, i) => (
              <article key={c.n} className="home-challenge-card glass-card p-6" style={{ animationDelay: `${100 + i * 70}ms` }}>
                <p className="text-xs font-semibold text-primary-600">Challenge {c.n}</p>
                <h3 className="mt-2 text-base font-semibold text-ink">{c.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {c.points.map((pt) => (
                    <li key={pt} className="flex gap-2 text-[13px] leading-snug text-ink-muted">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-line" />
                      {pt}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section id="platform" className="scroll-mt-28 border-b border-line py-14 md:py-18">
          <HomeAutomationPipeline />
        </section>

        <HomePortalStrip id="portals" className="scroll-mt-28 border-b border-line py-14 md:py-18" />

        <section className="border-b border-line py-14 md:py-18">
          <p className="home-section-eyebrow text-ink-subtle">The {BRAND_NAME} platform</p>
          <h2 className="home-reveal mt-3 text-2xl font-semibold text-ink">One workspace for every stage of the loop</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {JOURNEY.map((item, i) => (
              <div key={item.step} className="home-journey-step glass-inset px-4 py-5" style={{ animationDelay: `${80 + i * 50}ms` }}>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-600">{item.step}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 pt-4 md:mb-20">
          <div className="glass-card flex flex-col items-start gap-6 border-t-[3px] border-t-primary-500 p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <div>
              <h2 className="text-lg font-semibold text-ink">Start on home.localhost. Work on client.localhost.</h2>
              <p className="mt-1 max-w-lg text-sm text-ink-muted">
                Client accounts only. Sign up here — we hand off your session to the workspace when you are ready.
              </p>
            </div>
            <HomeHeroAuth className="shrink-0 justify-start md:justify-end" />
          </div>
        </section>
      </main>

      <HomeSiteFooter />
    </HomePageShell>
  )
}