import { useMemo } from 'react'
import { KIND_STYLES } from './types.js'
import { filterTreeByScope, layoutTreemap } from './layoutTreemap.js'

const TONE_CLASS = {
  violet: 'border-violet-200 bg-violet-50/80 hover:bg-violet-50',
  primary: 'border-primary-200 bg-primary-50/80 hover:bg-primary-50',
  success: 'border-success-700/20 bg-success-50/80 hover:bg-success-50',
  amber: 'border-amber-500/30 bg-amber-50/80 hover:bg-amber-50',
  warning: 'border-warning-700/20 bg-warning-50/70 hover:bg-warning-50',
  teal: 'border-teal-500/25 bg-teal-50/80 hover:bg-teal-50',
  cyan: 'border-cyan-500/25 bg-cyan-50/80 hover:bg-cyan-50',
  neutral: 'border-line bg-white/70 hover:bg-white',
}

export default function CodeMapTreemap({ root, scopeLevel, selectedId, onSelect, themeClass = '' }) {
  const tiles = useMemo(() => {
    const filtered = filterTreeByScope(root, scopeLevel)
    return layoutTreemap(filtered)
  }, [root, scopeLevel])

  return (
    <div
      className={`relative min-h-[420px] flex-1 overflow-hidden rounded-xl border border-line ${themeClass}`}
      role="tree"
      aria-label="Code map treemap"
    >
      {tiles.map(({ node, x, y, w, h }) => {
        const style = KIND_STYLES[node.kind] ?? KIND_STYLES.file
        const selected = node.id === selectedId
        const showLabel = w > 8 && h > 6
        return (
          <button
            key={node.id}
            type="button"
            onClick={() => onSelect(node)}
            className={`absolute flex flex-col items-start justify-start overflow-hidden border p-1.5 text-left transition-shadow ${TONE_CLASS[style.tone] ?? TONE_CLASS.neutral} ${
              selected ? 'ring-2 ring-primary-500 ring-offset-1' : ''
            }`}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              width: `${w}%`,
              height: `${h}%`,
            }}
            title={node.path ?? node.name}
          >
            {showLabel && (
              <>
                <span className="truncate text-[9px] font-semibold uppercase tracking-wide text-ink-subtle">
                  {style.label}
                </span>
                <span className="truncate text-[11px] font-medium text-ink">{node.name}</span>
                {node.scope && scopeLevel >= 4 && (
                  <span className="mt-0.5 truncate font-mono text-[9px] text-ink-muted">scope: {node.scope}</span>
                )}
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
