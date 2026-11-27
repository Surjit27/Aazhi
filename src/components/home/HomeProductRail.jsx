import { useEffect, useState } from 'react'
import { Activity, Flag, ScanSearch, Shield, Users } from 'lucide-react'
import { useDocumentVisible } from '../../hooks/useDocumentVisible.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

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
      'Impersonation with isolated sessions',
      'History for users, email, and jobs',
    ],
  },
  {
    id: 'ops',
    icon: Flag,
    eyebrow: 'Operations',
    title: 'Email, jobs, and audit history',
    bullets: [
      'SendGrid configuration for transactional mail',
      'BullMQ-backed job triggers and run history',
      'Audit trails across users and impersonation',
    ],
  },
]

export default function HomeProductRail({ portal = 'client', className = '' }) {
  const slides = portal === 'admin' ? SLIDES_ADMIN : SLIDES_CLIENT
  const [index, setIndex] = useState(0)
  const slide = slides[index]
  const Icon = slide.icon
  const docVisible = useDocumentVisible()
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    setIndex(0)
  }, [portal])

  useEffect(() => {
    if (!docVisible || reducedMotion) return undefined
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000)
    return () => clearInterval(id)
  }, [slides.length, docVisible, reducedMotion])

  return (
    <div
      className={`home-feature-spotlight glass-card flex h-full min-h-[18rem] flex-col border border-line/90 bg-white p-8 shadow-pop md:min-h-[20rem] md:p-10 ${className}`}
    >
      <div className="home-product-slide home-product-slide--active flex flex-1 flex-col" key={slide.id}>
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl border border-primary-100 bg-primary-50 text-primary-600">
          <Icon size={22} />
        </div>
        <p className="home-section-eyebrow text-primary-600">{slide.eyebrow}</p>
        <h2 className="mt-2 text-lg font-semibold leading-snug text-ink md:text-xl">{slide.title}</h2>
        <ul className="mt-5 flex flex-1 flex-col gap-3">
          {slide.bullets.map((line) => (
            <li key={line} className="flex gap-2.5 text-sm leading-snug text-ink-muted md:text-[15px]">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
              {line}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex gap-2 border-t border-line/80 pt-5">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            aria-label={`Show ${s.eyebrow}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
              i === index ? 'w-8 bg-primary-500' : 'w-2 bg-line hover:bg-primary-200'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
