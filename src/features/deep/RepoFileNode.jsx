import { Handle, Position } from '@xyflow/react'
import { FileCode2 } from 'lucide-react'

export default function RepoFileNode({ data, selected }) {
  return (
    <div
      className={`min-w-[160px] max-w-[200px] rounded-lg border border-line bg-white px-2.5 py-2 shadow-card ${
        selected ? 'border-primary-400 ring-2 ring-primary-100' : ''
      }`}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary-400 !h-1.5 !w-1.5" />
      <div className="flex items-start gap-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary-50 text-primary-700">
          <FileCode2 size={14} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-semibold text-ink" title={data.label}>
            {data.label}
          </p>
          <p className="truncate text-[10px] text-ink-muted" title={data.file}>
            {data.subtitle}
          </p>
          <p className="mt-1 text-[10px] text-ink-subtle">
            imports {data.importCount ?? 0} · used by {data.importedByCount ?? 0}
          </p>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary-400 !h-1.5 !w-1.5" />
    </div>
  )
}