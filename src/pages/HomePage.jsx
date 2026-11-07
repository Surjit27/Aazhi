import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Boxes,
  Database,
  ScanSearch,
  Workflow,
  Zap,
} from 'lucide-react'
import Button from '../components/ui/Button.jsx'
import { BRAND_NAME, BrandLockup } from '../components/ui/Brand.jsx'
import { clientAppOrigin, homeAppOrigin } from '../lib/portal.js'

const PILLARS = [
  {
    icon: ScanSearch,
    title: 'Reverse engineering',
    description:
      'Ingest backends from Git, map routes and code paths, and rebuild how services really behave — not just how the diagram says they should.',
  },
  {
    icon: Boxes,
    title: 'Microarchitecture',
    description:
      'See each backend as an isolated workspace: boundaries, dependencies, and execution surfaces you can inspect before you change anything.',
  },
  {
    icon: Workflow,
    title: 'Visual automated workflows',
    description:
      'Compose flows in a graph editor, wire steps to real backends, and run repeatable automation without leaving the workspace.',
  },
  {
    icon: Zap,
    title: 'Triggers & schedules',
    description:
      'Fire workflows on cron, webhooks, or manual runs. Tie triggers to the services you reverse-engineered so automation stays grounded in reality.',
  },
  {
    icon: Activity,
    title: 'Execution monitor',
    description:
      'Watch runs live: latency, status, failures, and retries — one monitor for every triggered workflow and injected payload.',
  },
  {
    icon: Database,
    title: 'Event & data flows',
    description:
      'Inject fixtures, stream event-shaped data into flows, and validate outcomes before promoting automation to production.',
  },
]

const FLOW_STEPS = [
  { label: 'Discover', detail: 'Clone & index a backend' },
  { label: 'Model', detail: 'Map microarchitecture' },
  { label: 'Design', detail: 'Visual workflow canvas' },
  { label: 'Trigger', detail: 'Schedule or event hook' },
  { label: 'Observe', detail: 'Monitor data & runs' },
]

export default function HomePage() {
  const homeOrigin = homeAppOrigin()
  const clientOrigin = clientAppOrigin()

  return (
    <div className="flex min-h-full flex-col bg-app-canvas">
      <header className="glass-bar sticky top-0 z-20 border-b border-line/80 px-4 py-3 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <BrandLockup className="h-9" iconSize={36} />
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="text-sm text-ink-muted hover:text-ink">
              Sign in
            </Link>
            <Link to="/signup">
              <Button variant="primary" className="text-xs sm:text-sm">
                Sign up
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-16 px-4 py-12 md:px-8 md:py-16">
        <section className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <p className="text-xs font-medium uppercase tracking-wider text-primary-600">
              Reverse engineering · Microarchitecture · Automation
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-ink md:text-4xl lg:text-[2.65rem] lg:leading-[1.15]">
              {BRAND_NAME} turns live systems into{' '}
              <span className="text-primary-600">visual, trigger-driven workflows</span> — with full run and event
              visibility.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-ink-muted">
              Start from real code: reverse-engineer service microarchitecture, design automated flows on a canvas, attach
              triggers and schedules, inject event data, and monitor every execution in one client workspace.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/signup">
                <Button variant="primary">
                  Start free on client workspace
                  <ArrowRight size={16} />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary">Sign in</Button>
              </Link>
            </div>
            <p className="text-[11px] text-ink-subtle">
              Client accounts only on this site — sign up here, then continue on{' '}
              <span className="font-mono text-ink-muted">client.localhost</span>.
            </p>
          </div>

          <div className="glass-card space-y-5 p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Automated flow lifecycle</p>
            <ol className="space-y-0">
              {FLOW_STEPS.map((step, i) => (
                <li key={step.label} className="relative flex gap-3 pb-5 last:pb-0">
                  {i < FLOW_STEPS.length - 1 ? (
                    <span className="absolute left-[13px] top-7 bottom-0 w-px bg-line" aria-hidden />
                  ) : null}
                  <span className="relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-50 text-[11px] font-semibold text-primary-700">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink">{step.label}</p>
                    <p className="text-xs text-ink-muted">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="border-t border-line pt-4 text-[11px] text-ink-subtle">
              You&apos;re on <span className="font-mono text-ink-muted">{homeOrigin}</span> · workspace at{' '}
              <span className="font-mono text-ink-muted">{clientOrigin}</span>
            </p>
          </div>
        </section>

        <section className="space-y-6">
          <div className="space-y-2 text-center md:text-left">
            <h2 className="text-lg font-semibold text-ink">Built for builders who start from the metal</h2>
            <p className="max-w-2xl text-sm text-ink-muted">
              From backend explorer to workflow canvas, event injection to execution monitor — {BRAND_NAME} connects
              reverse engineering with the automation loop your team actually runs.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="glass-card flex flex-col gap-3 p-5 transition-shadow hover:shadow-card">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Icon size={20} />
                </div>
                <h3 className="text-sm font-semibold text-ink">{title}</h3>
                <p className="text-xs leading-relaxed text-ink-muted">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-inset flex flex-col items-center gap-4 rounded-2xl px-6 py-10 text-center md:px-12">
          <p className="text-sm font-medium text-ink">Ready to map a backend and automate around it?</p>
          <p className="max-w-lg text-xs leading-relaxed text-ink-muted">
            Create a client account, open the workspace, register a service, explore its microarchitecture, and publish
            your first triggered workflow — then watch runs and event data in the monitor.
          </p>
          <Link to="/signup">
            <Button variant="primary">
              Sign up — reverse engineer to automate
              <ArrowRight size={16} />
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-line/80 px-4 py-6 text-center text-[11px] text-ink-subtle md:px-8">
        {BRAND_NAME} · reverse engineering &amp; workflow automation ·{' '}
        <span className="font-mono text-ink-muted">home.localhost</span> ·{' '}
        <span className="font-mono text-ink-muted">client.localhost</span>
      </footer>
    </div>
  )
}
