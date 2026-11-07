import { Handle, Position } from '@xyflow/react'
import { KIND_META } from '../workflow/nodeKinds.js'

const TRACE_RING = {
  done: 'ring-2 ring-success-700',
  active: 'ring-2 ring-primary-500',
  failed: 'ring-2 ring-danger-700',
  pending: '',
  skipped: 'opacity-40',
}

export default function DeepArchNode({ data, selected }) {
  const meta = KIND_META[data.kind] ?? KIND_META.service
  const Icon = meta.icon
  const trace = data.traceState

  return (
    <div
      className={`min-w-[140px] rounded-lg border border-line bg-white px-3 py-2 shadow-card ${selected ? 'border-primary-300' : ''} ${trace ? TRACE_RING[trace] ?? '' : ''}`}
    >
      <Handle type="target" position={Position.Left} className="!bg-line" />
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-md" style={{ backgroundColor: `${meta.accent}18`, color: meta.accent }}>
          <Icon size={14} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-ink">{data.label}</p>
          <p className="truncate text-[10px] text-ink-muted">{data.subtitle || data.file || meta.label}</p>
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="!bg-line" />
    </div>
  )
}
