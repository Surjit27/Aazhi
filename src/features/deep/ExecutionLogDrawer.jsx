import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import Badge from '../../components/ui/Badge.jsx'
import { DEEP_LOGS } from '../../data/deepBackend.js'

const LEVEL_TONE = { info: 'neutral', debug: 'primary', error: 'danger', warn: 'warning' }

export default function ExecutionLogDrawer({ open, onClose, executionId }) {
  const [query, setQuery] = useState('')
  const [level, setLevel] = useState('all')

  const rows = useMemo(() => {
    return DEEP_LOGS.filter((l) => {
      if (executionId && l.executionId !== executionId) return false
      if (level !== 'all' && l.level !== level) return false
      const q = query.trim().toLowerCase()
      if (!q) return true
      return `${l.message} ${l.component} ${l.traceId}`.toLowerCase().includes(q)
    })
  }, [executionId, level, query])

  if (!open) return null

  return (
    <div className="border-t border-line bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-2">
        <p className="text-xs font-semibold text-ink">Execution trace log</p>
        <div className="relative min-w-[180px] flex-1 max-w-sm">
          <Search size={12} className="absolute top-1/2 left-2 -translate-y-1/2 text-ink-subtle" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search logs…"
            className="h-7 w-full rounded-md border border-line pr-2 pl-7 text-xs"
          />
        </div>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className="h-7 rounded-md border border-line px-2 text-xs">
          <option value="all">All levels</option>
          <option value="info">Info</option>
          <option value="debug">Debug</option>
          <option value="error">Error</option>
        </select>
        <button type="button" onClick={onClose} className="cursor-pointer rounded p-1 text-ink-muted hover:bg-surface" aria-label="Close logs">
          <X size={14} />
        </button>
      </div>
      <div className="max-h-40 overflow-y-auto font-mono text-[11px] scrollbar-thin">
        <table className="w-full">
          <tbody>
            {rows.map((l) => (
              <tr key={l.id} className="border-b border-line/60 hover:bg-surface/80">
                <td className="whitespace-nowrap px-3 py-1.5 text-ink-subtle">{l.ts}</td>
                <td className="px-2 py-1.5">
                  <Badge tone={LEVEL_TONE[l.level] ?? 'neutral'}>{l.level}</Badge>
                </td>
                <td className="px-2 py-1.5 text-ink-muted">{l.component}</td>
                <td className="px-2 py-1.5 text-ink-subtle">{l.executionId}</td>
                <td className="px-2 py-1.5 text-primary-700">{l.traceId}</td>
                <td className="px-3 py-1.5 text-ink">{l.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
