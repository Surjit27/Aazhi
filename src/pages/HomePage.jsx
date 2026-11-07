import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import HomePageShell from '../components/home/HomePageShell.jsx'
import HomeProductRail from '../components/home/HomeProductRail.jsx'
import Button from '../components/ui/Button.jsx'
import { BRAND_NAME, BrandLockup } from '../components/ui/Brand.jsx'

const CHALLENGES = [
  {
    n: '01',
    title: 'The documentation gap',
    points: [
      'Architecture diagrams drift from running services',
      'Reverse engineering happens in one-off scripts',
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
  return (
    <HomePageShell>
      <header className="glass-bar sticky top-0 z-20 border-b border-line/80 px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <BrandLockup className="h-9" iconSize={36} />
          <nav className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-ink-muted hover:text-ink">
              Sign in
            </Link>
            <Link to="/signup">
              <Button variant="primary">Sign up for free</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 md:px-8">
        {/* Hero — Postman-style lead + proof panel */}
        <section className="grid items-center gap-10 border-b border-line py-14 md:py-20 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-6">
            <p className="home-section-eyebrow home-reveal text-primary-600">Reverse engineering · Automation</p>
            <h1 className="home-reveal text-3xl font-semibold tracking-tight text-ink md:text-[2.5rem] md:leading-[1.12]" style={{ animationDelay: '80ms' }}>
              Close the gap between live APIs and automated workflows — before drift widens it.
            </h1>
            <p className="home-reveal max-w-xl text-base leading-relaxed text-ink-muted" style={{ animationDelay: '140ms' }}>
              {BRAND_NAME} runs reverse engineering, visual workflow design, triggers, and execution monitoring in one
              client workspace — the same glass shell your team already uses inside the product.
            </p>
            <div className="home-reveal flex flex-wrap gap-3" style={{ animationDelay: '200ms' }}>
              <Link to="/signup">
                <Button variant="primary">
                  Sign up for free
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">Sign in</Button>
              </Link>
            </div>
          </div>
          <div className="home-reveal lg:min-h-[360px]" style={{ animationDelay: '160ms' }}>
            <HomeProductRail className="min-h-[320px] shadow-card" />
          </div>
        </section>

        {/* Challenges grid */}
        <section className="border-b border-line py-14 md:py-18">
          <p className="home-section-eyebrow text-ink-subtle">Three challenges</p>
          <h2 className="home-reveal mt-3 max-w-2xl text-2xl font-semibold text-ink">Where automation programs hit a ceiling</h2>
          <p className="home-reveal mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Teams document intent in wikis, then wire triggers by hand. {BRAND_NAME} keeps discovery, design, and
            enforcement in the same workflow surface.
          </p>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {CHALLENGES.map((c, i) => (
              <article
                key={c.n}
                className="home-challenge-card glass-card p-6"
                style={{ animationDelay: `${100 + i * 70}ms` }}
              >
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

        {/* Journey — platform stages */}
        <section className="py-14 md:py-18">
          <p className="home-section-eyebrow text-ink-subtle">The {BRAND_NAME} platform</p>
          <h2 className="home-reveal mt-3 text-2xl font-semibold text-ink">One workspace for every stage of the loop</h2>
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {JOURNEY.map((item, i) => (
              <div
                key={item.step}
                className="home-journey-step glass-inset px-4 py-5"
                style={{ animationDelay: `${80 + i * 50}ms` }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wide text-primary-600">{item.step}</p>
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="mb-16">
          <div className="glass-card flex flex-col items-start gap-4 border-t-[3px] border-t-primary-500 p-8 md:flex-row md:items-center md:justify-between md:p-10">
            <div>
              <h2 className="text-lg font-semibold text-ink">Start on home.localhost. Work on client.localhost.</h2>
              <p className="mt-1 max-w-lg text-sm text-ink-muted">
                Client accounts only. Sign up here — we hand off your session to the workspace when you are ready.
              </p>
            </div>
            <Link to="/signup" className="shrink-0">
              <Button variant="primary">Sign up for free</Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-white/50 px-4 py-6 text-center text-[11px] text-ink-subtle backdrop-blur-sm md:px-8">
        {BRAND_NAME} · home.localhost · client.localhost · admin.localhost
      </footer>
    </HomePageShell>
  )
}
