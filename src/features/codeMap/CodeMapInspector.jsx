import Badge from '../../components/ui/Badge.jsx'
import { KIND_STYLES } from './types.js'

export default function CodeMapInspector({ node }) {
  if (!node) {
    return (
      <div className="glass-inset flex h-full min-h-[200px] items-center justify-center p-6 text-sm text-ink-muted">
        Select a box in the treemap or a node in the flow view.
      </div>
    )
  }

  const meta = KIND_STYLES[node.kind] ?? KIND_STYLES.file

  return (
    <div className="glass-inset flex h-full flex-col gap-3 p-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone="primary">{meta.label}</Badge>
        {node.scope ? <Badge tone="neutral">{node.scope} scope</Badge> : null}
        {node.loc ? <span className="text-xs text-ink-muted">{node.loc} LOC</span> : null}
      </div>
      <h3 className="text-base font-semibold text-ink">{node.name}</h3>
      {node.path ? <p className="font-mono text-xs text-ink-muted">{node.path}</p> : null}
      {node.signature ? (
        <pre className="glass-card overflow-x-auto rounded-lg p-3 font-mono text-xs text-ink">{node.signature}</pre>
      ) : null}
      {node.uses?.length ? (
        <div>
          <p className="text-[10px] font-semibold uppercase text-ink-subtle">Calls / reads</p>
          <ul className="mt-1 space-y-0.5 font-mono text-xs text-ink-muted">
            {node.uses.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {node.usedBy?.length ? (
        <div>
          <p className="text-[10px] font-semibold uppercase text-ink-subtle">Used by</p>
          <ul className="mt-1 space-y-0.5 font-mono text-xs text-ink-muted">
            {node.usedBy.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
