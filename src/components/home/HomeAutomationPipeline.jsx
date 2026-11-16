import { useEffect, useState } from 'react'
import { BRAND_NAME } from '../ui/Brand.jsx'
import { useDocumentVisible } from '../../hooks/useDocumentVisible.js'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

const STAGES = [
  { id: 'discover', label: 'Discover', detail: 'Index backends from Git' },
  { id: 'model', label: 'Model', detail: 'Map microarchitecture' },
  { id: 'design', label: 'Design', detail: 'Visual workflows' },
  { id: 'trigger', label: 'Trigger', detail: 'Schedules & hooks' },
  { id: 'observe', label: 'Observe', detail: 'Runs & events' },
]

const STEP_MS = 3400

export default function HomeAutomationPipeline({ className = '' }) {
  const [active, setActive] = useState(0)
  const [autoAdvance, setAutoAdvance] = useState(true)
  const docVisible = useDocumentVisible()
  const reducedMotion = usePrefersReducedMotion()
  const stage = STAGES[active]

  useEffect(() => {
    if (!autoAdvance || reducedMotion || !docVisible) return undefined
    const id = setInterval(() => setActive((i) => (i + 1) % STAGES.length), STEP_MS)
    return () => clearInterval(id)
  }, [autoAdvance, reducedMotion, docVisible])

  return (
    <div className={`home-automation-pipeline glass-card home-reveal p-8 md:p-10 ${className}`}>
      <div className="space-y-3">
        <p className="home-section-eyebrow text-ink-subtle">Continuous automation</p>
        <h2 className="text-xl font-semibold text-ink md:text-2xl">A straight-line pipeline — each stage hands off to the next</h2>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-muted" key={stage.id}>
          <span className="font-medium text-ink">{stage.label}.</span> {stage.detail}.{' '}
          <span className="font-medium lowercase text-ink">{BRAND_NAME}</span> keeps the full path in one client workspace.
        </p>
      </div>

      <div
        className="home-pipeline-track mt-10"
        aria-label="Automation stages"
        style={{ '--pipeline-active': active, '--pipeline-steps': STAGES.length }}
      >
        <div className="home-pipeline-beam" aria-hidden />
        <ol className="home-pipeline-steps">
          {STAGES.map((s, i) => {
            const state = i < active ? 'done' : i === active ? 'active' : 'upcoming'
            return (
              <li key={s.id} className={`home-pipeline-step home-pipeline-step--${state}`}>
                <button
                  type="button"
                  className="home-pipeline-step__btn"
                  onClick={() => {
                    setActive(i)
                    setAutoAdvance(false)
                  }}
                  aria-current={i === active ? 'step' : undefined}
                >
                  <span className="home-pipeline-step__node">{i + 1}</span>
                  <span className="home-pipeline-step__label">{s.label}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      {!reducedMotion && (
        <p className="mt-6 text-[11px] text-ink-subtle">
          {autoAdvance && docVisible ? (
            <>
              Beam advances every {(STEP_MS / 1000).toFixed(1)}s · select a stage to pause
            </>
          ) : (
            <>
              Pipeline paused ·{' '}
              <button
                type="button"
                className="font-medium text-primary-600 hover:text-primary-700"
                onClick={() => setAutoAdvance(true)}
              >
                Resume flow
              </button>
            </>
          )}
        </p>
      )}
    </div>
  )
}