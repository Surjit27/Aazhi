import { memo } from 'react'
import { Handle, Position } from '@xyflow/react'
import { Check, Loader } from 'lucide-react'
import { KIND_META } from './nodeKinds.js'
import { formatDuration } from '../../utils/format.js'

const HANDLE_STYLE = { width: 10, height: 10, background: '#FFFFFF', border: '2px solid #3A7BCB' }

function PreflightNode({ data, selected }) {
  const meta = KIND_META[data.kind]
  const Icon = meta.icon
  const { traceState } = data

  const ring =
    traceState === 'active'
      ? 'ring-2 ring-primary-500 shadow-pop'
      : selected
        ? 'ring-2 ring-primary-500 shadow-pop'
        : 'shadow-card hover:shadow-pop'
  const tint = traceState === 'done' ? 'bg-success-50/60' : 'bg-white'

  return (
    <div
      className={`group w-[212px] overflow-visible rounded-lg border border-line transition-shadow duration-150 ${tint} ${ring}`}
      style={{ borderLeftWidth: 4, borderLeftColor: meta.accent }}
    >
      {data.kind !== 'endpoint' && (
        <Handle type="target" position={Position.Left} style={HANDLE_STYLE} />
      )}

      <div className="flex items-center gap-2 px-3 pt-2.5">
        <Icon size={13} style={{ color: meta.accent }} className="shrink-0" />
        <span className="truncate text-[10px] font-semibold tracking-wide text-ink-muted uppercase">{meta.label}</span>
        {traceState === 'done' && <Check size={13} className="ml-auto shrink-0 text-success-700" />}
        {traceState === 'active' && <Loader size={13} className="ml-auto shrink-0 animate-spin text-primary-700" />}
      </div>
      <p className="truncate px-3 pt-0.5 text-[13px] font-semibold text-ink" title={data.label}>
        {data.label}
      </p>
      <p className="truncate px-3 pt-0.5 pb-2.5 font-mono text-[11px] text-ink-muted" title={data.subtitle}>
        {data.subtitle || '\u00a0'}
      </p>

      {data.traceState !== undefined && data.durationMs > 0 && (
        <div className="flex justify-end border-t border-line px-3 py-1 text-[11px] text-ink-muted tabular-nums">
          {formatDuration(data.durationMs)}
        </div>
      )}

      {data.kind === 'condition' ? (
        <>
          <Handle id="true" type="source" position={Position.Right} style={{ ...HANDLE_STYLE, top: '35%' }} />
          <Handle id="false" type="source" position={Position.Right} style={{ ...HANDLE_STYLE, top: '75%' }} />
          <span className="absolute -right-9 top-[25%] text-[10px] font-medium text-success-700">true</span>
          <span className="absolute -right-10 top-[65%] text-[10px] font-medium text-danger-700">false</span>
        </>
      ) : (
        data.kind !== 'mock' && <Handle type="source" position={Position.Right} style={HANDLE_STYLE} />
      )}
    </div>
  )
}

export default memo(PreflightNode)
