import { useEffect, useState } from 'react'
import { Activity, Flag, ScanSearch, Shield, Users, Workflow } from 'lucide-react'

const SLIDES_CLIENT = [
  {
    id: 'reverse',
    icon: ScanSearch,
    eyebrow: 'Client workspace',
    title: 'Reverse-engineer before you automate',
    bullets: [
      'Index backends from Git into isolated workspaces',
      'Map routes, explorers, and microarchitecture surfaces',
      'Ground every workflow in how services actually run',
    ],
  },
  {
    id: 'workflow',
    icon: Workflow,
    eyebrow: 'Visual automation',
    title: 'Design flows on a live canvas',
    bullets: [
      'Wire graph steps to registered backends',
      'Attach schedules, webhooks, and manual triggers',
      'Reuse the same workspace chrome as the rest of deepe',
    ],
  },
  {
    id: 'monitor',
    icon: Activity,
    eyebrow: 'Execution monitor',
    title: 'See every run and event injection',
    bullets: [
      'Track status, latency, and failures in one monitor',
      'Validate injected data before promoting automation',
      'Continue on client.localhost after you sign in',
    ],
  },
]

const SLIDES_ADMIN = [
  {
    id: 'platform',
    icon: Shield,
    eyebrow: 'Admin console',
    title: 'Operate the deepe platform',
    bullets: [
      'Overview health across client tenants',
      'Roles, impersonation, and access boundaries',
      'Separate sessions on admin.localhost',
    ],
  },
  {
    id: 'users',
    icon: Users,
    eyebrow: 'Tenant management',
    title: 'Onboard and support client teams',
    bullets: [
      'Client and admin user directories',
      'Feature flags per client schema',
      'History for users, email, and jobs',
    ],
  },
  {
    id: 'flags',
    icon: Flag,
    eyebrow: 'Feature flags',
    title: 'Ship capabilities with control',
    bullets: [
      'Toggle client portal surfaces safely',
      'Map nav paths to routes',
      'Email and scheduler settings in one place',
    ],
  },
]

export default function HomeProductRail({ portal = 'client', className = '' }) {
  const slides = portal === 'admin' ? SLIDES_ADMIN : SLIDES_CLIENT
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  const Icon = slide.icon

  useEffect(() => {
    setIndex(0)
  }, [portal])

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000)
    return () => clearInterval(id)
  }, [slides.length])

  return (
    <div
      className={`home-product-rail home-auth-rail-float glass-inset flex h-full flex-col rounded-[var(--radius-card)] border-t-[3px] border-t-primary-500 p-8 md:p-10 lg:p-11 ${className}`}
    >
      <div className="home-product-slide home-product-slide--active flex flex-1 flex-col" key={slide.id}>
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
          <Icon size={24} />
        </div>
        <p className="home-section-eyebrow text-primary-600">{slide.eyebrow}</p>
        <h2 className="mt-2 text-xl font-semibold leading-snug text-ink md:text-[1.35rem]">{slide.title}</h2>
        <ul className="mt-5 flex flex-col gap-3">
          {slide.bullets.map((line) => (
            <li key={line} className="flex gap-2.5 text-sm leading-snug text-ink-muted md:text-[15px]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
              {line}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex gap-2">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Show ${s.eyebrow}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-8 bg-primary-500' : 'w-2 bg-line hover:bg-primary-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
