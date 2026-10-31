import { useState } from 'react'
import { useWorkflowStore } from '../../stores/workflowStore.js'
import { TRACE_LOGS, TRACE_SEQUENCE } from '../../data/workflowGraph.js'
import Badge from '../../components/ui/Badge.jsx'
import { formatDuration } from '../../utils/format.js'

const LEVEL_TONE = { info: 'primary', warn: 'warning', error: 'danger' }

export default function ExecutionLogPanel() {
  const nodes = useWorkflowStore((s) => s.nodes)
  const traceIndex = useWorkflowStore((s) => s.traceIndex)
  const selectedNodeId = useWorkflowStore((s) => s.selectedNodeId)
  const [onlySelected, setOnlySelected] = useState(false)

  const entries = []
  let elapsed = 0
  TRACE_SEQUENCE.slice(0, traceIndex).forEach((id) => {
    const node = nodes.find((n) => n.id === id)
    if (!node) return
    elapsed += node.data.durationMs || 0
    const log = TRACE_LOGS[id]
    if (log) entries.push({ id, at: elapsed, label: node.data.label, ...log })
  })

  const visible = onlySelected ? entries.filter((e) => e.id === selectedNodeId) : entries

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <p className="text-[13px] font-semibold text-ink">Execution log</p>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-muted">
          <input
            type="checkbox"
            checked={onlySelected}
            onChange={(e) => setOnlySelected(e.target.checked)}
            className="h-3.5 w-3.5 accent-primary-600"
          />
          Selected node only
        </label>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-2 font-mono text-xs scrollbar-thin">
        {visible.length === 0 && (
          <p className="py-6 text-center font-sans text-xs text-ink-muted">
            {entries.length === 0 ? 'Run the trace to see execution logs for each step.' : 'No logs for the selected node yet.'}
          </p>
        )}
        {visible.map((e) => (
          <div key={`${e.id}-${e.at}`} className="flex items-start gap-3 py-1">
            <span className="w-16 shrink-0 text-right text-ink-subtle tabular-nums">+{formatDuration(e.at)}</span>
            <Badge tone={LEVEL_TONE[e.level]} className="mt-px w-12 justify-center uppercase">{e.level}</Badge>
            <span className="w-28 shrink-0 truncate text-ink-muted">{e.label}</span>
            <span className="min-w-0 flex-1 text-ink">{e.message}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
