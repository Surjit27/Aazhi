import { ArrowRight, Network, Shield } from 'lucide-react'
import Badge, { MethodBadge } from '../../components/ui/Badge.jsx'
import EmptyState from '../../components/ui/EmptyState.jsx'
import { useBackendExplorerCatalog } from '../../context/BackendExplorerContext.jsx'

const KIND_TONE = {
  controller: 'primary',
  middleware: 'warning',
  service: 'success',
  database: 'neutral',
  external: 'danger',
  utility: 'neutral',
}

export const thClass = 'px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-ink-muted'
export const tdClass = 'px-3 py-2 align-middle text-[13px] text-ink'

export function dependentsOf(name, backendFunctions) {
  return backendFunctions.filter((f) => f.deps.includes(name))
}

export function FunctionsTable({ selectedName, onSelect }) {
  const { backendFunctions, lineOf } = useBackendExplorerCatalog()
  return (
    <table className="w-full border-collapse">
      <thead className="sticky top-0 bg-surface">
        <tr className="border-b border-line">
          <th className={thClass}>Function</th>
          <th className={thClass}>Kind</th>
          <th className={thClass}>Location</th>
          <th className={`${thClass} text-right`}>Calls</th>
          <th className={`${thClass} text-right`}>Called by</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {backendFunctions.map((fn) => {
          const active = fn.name === selectedName
          return (
            <tr
              key={fn.name}
              onClick={() => onSelect(fn.name)}
              className={`cursor-pointer transition-colors ${active ? 'bg-primary-50' : 'hover:bg-surface'}`}
            >
              <td className={`${tdClass} font-mono font-medium`}>{fn.name}</td>
              <td className={tdClass}>
                <Badge tone={KIND_TONE[fn.kind]}>{fn.kind}</Badge>
              </td>
              <td className={`${tdClass} font-mono text-xs text-ink-muted`}>
                {fn.file}:{lineOf(fn.file, fn.signature)}
              </td>
              <td className={`${tdClass} text-right tabular-nums`}>{fn.deps.length}</td>
              <td className={`${tdClass} text-right tabular-nums`}>{dependentsOf(fn.name, backendFunctions).length}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export function RoutesTable({ onOpenHandler }) {
  const { backendRoutes, backendFunctions } = useBackendExplorerCatalog()
  return (
    <table className="w-full border-collapse">
      <thead className="sticky top-0 bg-surface">
        <tr className="border-b border-line">
          <th className={thClass}>Method</th>
          <th className={thClass}>Path</th>
          <th className={thClass}>Handler</th>
          <th className={thClass}>Auth</th>
          <th className={thClass}>Source</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {backendRoutes.map((r) => (
          <tr key={`${r.method}-${r.path}`} className="hover:bg-surface">
            <td className={tdClass}>
              <MethodBadge method={r.method} />
            </td>
            <td className={`${tdClass} font-mono text-xs`}>{r.path}</td>
            <td className={tdClass}>
              {backendFunctions.some((f) => f.name === r.handler) ? (
                <button
                  onClick={() => onOpenHandler(r.handler)}
                  className="cursor-pointer font-mono text-xs font-medium text-primary-700 hover:underline"
                >
                  {r.handler}
                </button>
              ) : (
                <span className="font-mono text-xs text-ink-muted">{r.handler}</span>
              )}
            </td>
            <td className={tdClass}>
              {r.auth ? (
                <Badge tone="primary"><Shield size={11} /> Bearer</Badge>
              ) : (
                <Badge>Public</Badge>
              )}
            </td>
            <td className={`${tdClass} font-mono text-xs text-ink-muted`}>{r.file}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

function FunctionChip({ name, onSelect }) {
  return (
    <button
      onClick={() => onSelect(name)}
      className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-md border border-line bg-white px-2.5 py-1.5 text-left font-mono text-xs text-ink transition-colors hover:border-primary-500 hover:bg-primary-50"
    >
      {name}
      <ArrowRight size={12} className="text-ink-subtle" />
    </button>
  )
}

export function DependenciesPanel({ fn, onSelect }) {
  const { backendFunctions, backendRoutes } = useBackendExplorerCatalog()
  if (!fn) {
    return (
      <EmptyState
        icon={Network}
        title="Select a function"
        description="Choose a function in the Functions tab to see what it calls and what calls it."
      />
    )
  }

  const calls = fn.deps.map((name) => backendFunctions.find((f) => f.name === name)).filter(Boolean)
  const calledBy = dependentsOf(fn.name, backendFunctions)
  const routes = backendRoutes.filter((r) => r.handler === fn.name)

  return (
    <div className="grid gap-4 p-4 md:grid-cols-3">
      <div className="md:col-span-3">
        <p className="text-[13px] font-semibold font-mono text-ink">{fn.name}</p>
        <p className="text-xs text-ink-muted">{fn.description}</p>
        {routes.length > 0 && (
          <p className="mt-1 text-xs text-ink-muted">
            Serves <span className="font-mono text-ink">{routes.map((r) => `${r.method} ${r.path}`).join(', ')}</span>
          </p>
        )}
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Calls ({calls.length})</p>
        <div className="flex flex-col gap-1.5">
          {calls.length === 0 && <p className="text-xs text-ink-subtle">No downstream calls.</p>}
          {calls.map((c) => (
            <FunctionChip key={c.name} name={c.name} onSelect={onSelect} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Called by ({calledBy.length})</p>
        <div className="flex flex-col gap-1.5">
          {calledBy.length === 0 && <p className="text-xs text-ink-subtle">No callers inside this project.</p>}
          {calledBy.map((c) => (
            <FunctionChip key={c.name} name={c.name} onSelect={onSelect} />
          ))}
        </div>
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Routes</p>
        <div className="flex flex-col gap-1.5">
          {routes.length === 0 && <p className="text-xs text-ink-subtle">Not directly mapped to a route.</p>}
          {routes.map((r) => (
            <div key={`${r.method}${r.path}`} className="flex items-center gap-2">
              <MethodBadge method={r.method} />
              <span className="font-mono text-xs text-ink">{r.path}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ParametersPanel({ fn }) {
  const { routeParameters } = useBackendExplorerCatalog()
  return (
    <div className="grid gap-4 p-4 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
          {fn ? `${fn.name}() parameters` : 'Function parameters'}
        </p>
        {!fn && <p className="text-xs text-ink-subtle">Select a function to see its parameters.</p>}
        {fn && (
          <table className="w-full border-collapse rounded-md border border-line">
            <thead className="bg-surface">
              <tr className="border-b border-line">
                <th className={thClass}>Name</th>
                <th className={thClass}>Type</th>
                <th className={thClass}>Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {fn.params.map((p) => (
                <tr key={p.name}>
                  <td className={`${tdClass} font-mono text-xs`}>{p.name}</td>
                  <td className={`${tdClass} font-mono text-xs text-primary-700`}>{p.type}</td>
                  <td className={`${tdClass} text-xs text-ink-muted`}>{p.description}</td>
                </tr>
              ))}
              {fn.params.length === 0 && (
                <tr>
                  <td className={`${tdClass} text-xs text-ink-subtle`} colSpan={3}>No parameters</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Route inputs</p>
        <table className="w-full border-collapse rounded-md border border-line">
          <thead className="bg-surface">
            <tr className="border-b border-line">
              <th className={thClass}>Route</th>
              <th className={thClass}>Name</th>
              <th className={thClass}>In</th>
              <th className={thClass}>Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {routeParameters.map((p) => (
              <tr key={`${p.route}-${p.name}-${p.location}`} title={p.description}>
                <td className={`${tdClass} font-mono text-xs`}>{p.route}</td>
                <td className={`${tdClass} font-mono text-xs`}>
                  {p.name}
                  {p.required && <span className="ml-1 text-danger-700">*</span>}
                </td>
                <td className={`${tdClass} text-xs text-ink-muted`}>{p.location}</td>
                <td className={`${tdClass} font-mono text-xs text-primary-700`}>{p.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
