import { useEffect, useState } from 'react'
import { Activity, ScanSearch, Workflow } from 'lucide-react'

const SLIDES = [
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

export default function HomeProductRail({ className = '' }) {
  const [index, setIndex] = useState(0)
  const slide = SLIDES[index]
  const Icon = slide.icon

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SLIDES.length), 7000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={`home-product-rail glass-inset flex h-full flex-col border-t-[3px] border-t-primary-500 p-6 md:p-8 ${className}`}>
      <div className="home-product-slide flex flex-1 flex-col" key={slide.id}>
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Icon size={22} />
        </div>
        <p className="home-section-eyebrow text-primary-600">{slide.eyebrow}</p>
        <h2 className="mt-2 text-lg font-semibold leading-snug text-ink">{slide.title}</h2>
        <ul className="mt-4 flex flex-col gap-2.5">
          {slide.bullets.map((line) => (
            <li key={line} className="flex gap-2 text-[13px] leading-snug text-ink-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary-500" />
              {line}
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex gap-2">
        {SLIDES.map((s, i) => (
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
