import { useEffect, useState } from 'react'
import { BRAND_NAME } from '../ui/Brand.jsx'

const STAGES = [
  { id: 'discover', label: 'Discover', detail: 'Index backends from Git' },
  { id: 'model', label: 'Model', detail: 'Map microarchitecture' },
  { id: 'design', label: 'Design', detail: 'Visual workflows' },
  { id: 'trigger', label: 'Trigger', detail: 'Schedules & hooks' },
  { id: 'observe', label: 'Observe', detail: 'Runs & events' },
]

const STEP_MS = 3200

export default function HomeLiveLoop({ className = '' }) {
  const [active, setActive] = useState(0)
  const stage = STAGES[active]

  useEffect(() => {
    const id = setInterval(() => setActive((i) => (i + 1) % STAGES.length), STEP_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className={`home-live-loop glass-card home-reveal flex flex-col gap-8 p-8 md:flex-row md:items-center md:gap-12 md:p-10 ${className}`}>
      <div className="home-loop-ring-wrap relative mx-auto shrink-0 md:mx-0" aria-hidden>
        <div className="home-loop-ring">
          <div className="home-loop-orbit" style={{ transform: `rotate(${active * 72}deg)` }}>
            <span className="home-loop-satellite" />
          </div>
          <div className="home-loop-core glass-inset flex h-full w-full flex-col items-center justify-center rounded-full border border-line/80 text-center">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-600">Live loop</p>
            <p className="mt-1 text-lg font-semibold text-ink">{stage.label}</p>
          </div>
        </div>
        <ul className="home-loop-labels">
          {STAGES.map((s, i) => (
            <li
              key={s.id}
              className={`home-loop-label ${i === active ? 'home-loop-label--active' : ''}`}
              style={{ '--i': i }}
            >
              <span className="home-loop-label-dot" />
              <span className="text-[10px] font-medium text-ink-muted">{s.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="min-w-0 flex-1 space-y-4">
        <p className="home-section-eyebrow text-ink-subtle">Continuous automation</p>
        <h2 className="text-xl font-semibold text-ink md:text-2xl">The loop never sleeps — only the stage changes</h2>
        <p className="text-sm leading-relaxed text-ink-muted" key={stage.id}>
          <span className="font-medium text-ink">{stage.label}.</span> {stage.detail}. {BRAND_NAME} keeps each stage
          wired to the same glass workspace your team signs into on client.localhost.
        </p>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {STAGES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition-colors ${
                i === active
                  ? 'border-primary-200 bg-primary-50 text-primary-700'
                  : 'border-line bg-white/60 text-ink-muted hover:border-primary-100 hover:text-ink'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-ink-subtle">
          <span className="relative flex h-2 w-2">
            <span className="home-live-pulse absolute inline-flex h-full w-full rounded-full bg-primary-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
          </span>
          Rotating every {(STEP_MS / 1000).toFixed(1)}s · click a stage to pin
        </p>
      </div>
    </div>
  )
}
