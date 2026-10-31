import { useEffect } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useWorkflowStore } from '../../stores/workflowStore.js'
import { TRACE_SEQUENCE } from '../../data/workflowGraph.js'
import Button from '../../components/ui/Button.jsx'
import { formatDuration } from '../../utils/format.js'

const STEP_INTERVAL_MS = 650

export default function RuntimeTrace() {
  const nodes = useWorkflowStore((s) => s.nodes)
  const traceIndex = useWorkflowStore((s) => s.traceIndex)
  const traceRunning = useWorkflowStore((s) => s.traceRunning)
  const startTrace = useWorkflowStore((s) => s.startTrace)
  const stepTrace = useWorkflowStore((s) => s.stepTrace)
  const stopTrace = useWorkflowStore((s) => s.stopTrace)
  const resetTrace = useWorkflowStore((s) => s.resetTrace)

  useEffect(() => {
    if (!traceRunning) return undefined
    const timer = setTimeout(stepTrace, STEP_INTERVAL_MS)
    return () => clearTimeout(timer)
  }, [traceRunning, traceIndex, stepTrace])

  const sequence = TRACE_SEQUENCE.map((id) => nodes.find((n) => n.id === id)).filter(Boolean)
  const totalMs = sequence.reduce((sum, n) => sum + (n.data.durationMs || 0), 0)
  const doneMs = sequence.slice(0, traceIndex).reduce((sum, n) => sum + (n.data.durationMs || 0), 0)
  const finished = traceIndex >= sequence.length
  const started = traceIndex > 0 || traceRunning

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-line bg-white px-4 py-2.5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-ink">POST /api/orders execution</p>
          <p className="text-[11px] text-ink-muted tabular-nums">
            {started ? `${formatDuration(doneMs)} elapsed` : 'Replay the success path step by step'} · typical total {formatDuration(totalMs)}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {traceRunning ? (
            <Button size="sm" onClick={stopTrace}>
              <Pause size={13} /> Pause
            </Button>
          ) : (
            <Button size="sm" variant="primary" onClick={startTrace}>
              <Play size={13} /> {started && !finished ? 'Resume' : 'Run trace'}
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={resetTrace} disabled={!started}>
            <RotateCcw size={13} /> Reset
          </Button>
        </div>
      </div>

      <div className="flex h-2 w-full gap-0.5 overflow-hidden rounded-full bg-surface" role="img" aria-label="Execution timeline">
        {sequence.map((n, idx) => {
          const state = idx < traceIndex ? 'done' : idx === traceIndex && traceRunning ? 'active' : 'pending'
          const color = state === 'done' ? 'bg-success-700' : state === 'active' ? 'bg-primary-500 animate-pulse' : 'bg-line'
          const width = Math.max(2, ((n.data.durationMs || 0) / totalMs) * 100)
          return (
            <div
              key={n.id}
              title={`${n.data.label}: ${formatDuration(n.data.durationMs)}`}
              className={`h-full rounded-full transition-colors duration-300 ${color}`}
              style={{ width: `${width}%` }}
            />
          )
        })}
      </div>
    </div>
  )
}
