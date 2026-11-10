import { ExternalLink, Home, Shield, Workflow } from 'lucide-react'
import { adminAppOrigin, clientAppOrigin, homeAppOrigin } from '../../lib/appHost.js'

const PORTALS = [
  {
    id: 'home',
    host: 'home.localhost',
    title: 'Marketing & auth',
    detail: 'Sign up, sign in, and read how deepe fits your automation program.',
    icon: Home,
    origin: homeAppOrigin,
    path: '/',
    accent: 'border-t-primary-500',
  },
  {
    id: 'client',
    host: 'client.localhost',
    title: 'Client workspace',
    detail: 'Reverse engineering, workflows, triggers, and the execution monitor.',
    icon: Workflow,
    origin: clientAppOrigin,
    path: '/login',
    accent: 'border-t-teal-500',
  },
  {
    id: 'admin',
    host: 'admin.localhost',
    title: 'Platform console',
    detail: 'Tenants, roles, impersonation, and operational history.',
    icon: Shield,
    origin: adminAppOrigin,
    path: '/login',
    accent: 'border-t-violet-500',
  },
]

export default function HomePortalStrip({ className = '' }) {
  return (
    <section className={className}>
      <p className="home-section-eyebrow text-ink-subtle">Three hosts · one product</p>
      <h2 className="home-reveal mt-3 text-2xl font-semibold text-ink">Purpose-built surfaces per hostname</h2>
      <p className="home-reveal mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
        Local dev mirrors production boundaries: marketing on home, day-to-day work on client, platform ops on admin.
      </p>
      <ul className="mt-10 grid gap-5 md:grid-cols-3">
        {PORTALS.map((p, i) => {
          const Icon = p.icon
          const href = `${p.origin()}${p.path}`
          return (
            <li
              key={p.id}
              className={`home-portal-card glass-card border-t-[3px] p-6 ${p.accent}`}
              style={{ animationDelay: `${90 + i * 60}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Icon size={20} />
                </div>
                <a
                  href={href}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary-600 hover:text-primary-700"
                >
                  Open
                  <ExternalLink size={12} />
                </a>
              </div>
              <p className="mt-4 font-mono text-xs text-primary-600">{p.host}</p>
              <h3 className="mt-1 text-base font-semibold text-ink">{p.title}</h3>
              <p className="mt-2 text-[13px] leading-snug text-ink-muted">{p.detail}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
