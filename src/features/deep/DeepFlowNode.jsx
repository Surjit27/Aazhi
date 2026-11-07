import { Handle, Position } from '@xyflow/react'

const KIND_COLORS = {
  api: '#4A90E2',
  function: '#5B6676',
  event: '#A16207',
  data: '#0E7490',
  scheduler: '#17703D',
  condition: '#1B2430',
  delay: '#6B7587',
  mock: '#B54708',
  assertion: '#2D65A8',
  log: '#C2410C',
}

const TRACE_RING = {
  done: 'ring-2 ring-success-700',
  active: 'ring-2 ring-primary-500 animate-pulse',
  failed: 'ring-2 ring-danger-700',
  pending: 'opacity-60',
  skipped: 'opacity-35',
}

export default function DeepFlowNode({ data, selected }) {
  const accent = KIND_COLORS[data.kind] ?? '#4A90E2'
  const trace = data.traceState

  return (
    <div
      className={`min-w-[150px] rounded-lg border border-line bg-white px-3 py-2 shadow-card ${selected ? 'border-primary-300' : ''} ${trace ? TRACE_RING[trace] ?? '' : ''}`}
    >
      <Handle type="target" position={Position.Left} />
      <p className="text-[10px] font-medium uppercase tracking-wide" style={{ color: accent }}>
        {data.kind}
      </p>
      <p className="text-xs font-semibold text-ink">{data.label}</p>
      <p className="text-[10px] text-ink-muted">{data.subtitle}</p>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}
