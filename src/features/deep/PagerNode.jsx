import { Handle, Position } from '@xyflow/react'

const KIND_STYLES = {
  trigger: { accent: '#7C3AED', bg: 'from-violet-50 to-white' },
  event: { accent: '#A16207', bg: 'from-amber-50 to-white' },
  api: { accent: '#2563EB', bg: 'from-primary-50 to-white' },
  ai: { accent: '#0D9488', bg: 'from-teal-50 to-white' },
  transform: { accent: '#0369A1', bg: 'from-sky-50 to-white' },
  condition: { accent: '#1B2430', bg: 'from-surface to-white' },
  delay: { accent: '#6B7587', bg: 'from-surface to-white' },
  host: { accent: '#DC2626', bg: 'from-danger-50 to-white' },
}

export default function PagerNode({ data, selected }) {
  const style = KIND_STYLES[data.kind] ?? KIND_STYLES.api

  return (
    <div
      className={`min-w-[168px] rounded-xl border bg-gradient-to-b px-3 py-2.5 shadow-card transition ${
        selected ? 'border-primary-400 ring-2 ring-primary-100' : 'border-line'
      } ${style.bg}`}
    >
      <Handle type="target" position={Position.Left} className="!h-2.5 !w-2.5 !border-2 !border-white !bg-ink-subtle" />
      <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: style.accent }}>
        {data.kind}
      </p>
      <p className="mt-0.5 text-xs font-semibold text-ink">{data.label}</p>
      <p className="text-[10px] text-ink-muted">{data.subtitle}</p>
      <Handle type="source" position={Position.Right} className="!h-2.5 !w-2.5 !border-2 !border-white !bg-primary-500" />
    </div>
  )
}
