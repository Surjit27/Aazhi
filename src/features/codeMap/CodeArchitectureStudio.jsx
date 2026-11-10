import { useMemo, useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { LayoutGrid, Network, Workflow, Boxes } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import { SCOPE_LEVELS } from './types.js'
import { MOCK_CODE_MAP_ROOTS } from './mockRepoIndex.js'
import CodeMapTreemap from './CodeMapTreemap.jsx'
import CodeMapFlowView from './CodeMapFlowView.jsx'
import CodeMapInspector from './CodeMapInspector.jsx'
import ArchitectureGraph from '../deep/ArchitectureGraph.jsx'
import DeepFlowStudioWorkspace from '../deep/DeepFlowStudioWorkspace.jsx'

const VIEWS = [
  { id: 'treemap', label: 'Code map', icon: LayoutGrid },
  { id: 'architecture', label: 'Architecture', icon: Network },
  { id: 'dependencies', label: 'Dependencies', icon: Boxes },
  { id: 'flows', label: 'Flow playground', icon: Workflow },
]

const THEMES = {
  light: 'bg-app-canvas',
  slate: 'bg-slate-100',
  blueprint: 'bg-[#0f172a] [&_button]:text-slate-100',
}

function findNodeById(root, id) {
  if (!root || !id) return null
  if (root.id === id) return root
  for (const child of root.children ?? []) {
    const hit = findNodeById(child, id)
    if (hit) return hit
  }
  return null
}

export default function CodeArchitectureStudio({ projectName, repos = [], discoveryComplete, defaultView = 'treemap' }) {
  const [view, setView] = useState(defaultView)
  const [scopeLevel, setScopeLevel] = useState(2)
  const [theme, setTheme] = useState('light')
  const [repoIndex, setRepoIndex] = useState(0)
  const [selected, setSelected] = useState(null)

  const roots = useMemo(() => {
    if (repos.length === 0) return MOCK_CODE_MAP_ROOTS
    return MOCK_CODE_MAP_ROOTS.map((r, i) => ({
      ...r,
      name: repos[i]?.name ?? r.name,
      path: repos[i]?.fullName ?? r.path,
    }))
  }, [repos])

  const root = roots[repoIndex] ?? roots[0]

  const selectById = (partial) => {
    if (!partial?.id) {
      setSelected(null)
      return
    }
    setSelected(findNodeById(root, partial.id) ?? partial)
  }

  return (
    <div className="flex min-h-[520px] flex-col overflow-hidden rounded-lg border border-line bg-white">
      <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface/60 px-4 py-3">
        <div className="flex flex-wrap gap-1">
          {VIEWS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              size="sm"
              variant={view === id ? 'primary' : 'ghost'}
              onClick={() => setView(id)}
              className="gap-1.5"
            >
              <Icon size={14} />
              {label}
            </Button>
          ))}
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {roots.length > 1 && (
            <select
              className="rounded-md border border-line bg-white px-2 py-1 text-xs text-ink"
              value={repoIndex}
              onChange={(e) => {
                setRepoIndex(Number(e.target.value))
                setSelected(null)
              }}
            >
              {roots.map((r, i) => (
                <option key={r.id} value={i}>
                  {r.name}
                </option>
              ))}
            </select>
          )}
          {view === 'treemap' && (
            <select
              className="rounded-md border border-line bg-white px-2 py-1 text-xs text-ink"
              value={scopeLevel}
              onChange={(e) => setScopeLevel(Number(e.target.value))}
              aria-label="Scope level"
            >
              {SCOPE_LEVELS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
          <select
            className="rounded-md border border-line bg-white px-2 py-1 text-xs text-ink"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            aria-label="Canvas theme"
          >
            {Object.keys(THEMES).map((t) => (
              <option key={t} value={t}>
                Theme: {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {projectName && (
        <p className="border-b border-line px-4 py-2 text-xs text-ink-muted">
          Project <span className="font-medium text-ink">{projectName}</span>
          {discoveryComplete ? ' · indexed' : ' · run reverse-engineer agent for live graph'}
        </p>
      )}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1fr_minmax(220px,280px)]">
        <div className={`min-h-[420px] p-4 ${THEMES[theme] ?? THEMES.light}`}>
          {view === 'treemap' && (
            <CodeMapTreemap
              root={root}
              scopeLevel={scopeLevel}
              selectedId={selected?.id}
              onSelect={setSelected}
              themeClass={THEMES[theme]}
            />
          )}
          {view === 'architecture' && (
            <div className="h-[480px] rounded-xl border border-line bg-white">
              {discoveryComplete ? (
                <ReactFlowProvider>
                  <ArchitectureGraph />
                </ReactFlowProvider>
              ) : (
                <p className="p-6 text-sm text-ink-muted">Architecture graph appears after discovery completes.</p>
              )}
            </div>
          )}
          {view === 'dependencies' && (
            <ReactFlowProvider>
              <CodeMapFlowView root={root} selectedId={selected?.id} onSelect={selectById} />
            </ReactFlowProvider>
          )}
          {view === 'flows' && (
            <MotionSafeWorkspace projectName={projectName} />
          )}
        </div>
        {view !== 'flows' && (
          <aside className="border-t border-line p-4 lg:border-t-0 lg:border-l">
            <p className="mb-2 text-[10px] font-semibold uppercase text-ink-subtle">Inspector</p>
            <CodeMapInspector node={selected} />
          </aside>
        )}
      </div>
    </div>
  )
}

function MotionSafeWorkspace({ projectName }) {
  return (
    <div className="h-[480px] overflow-hidden rounded-xl border border-line">
      <DeepFlowStudioWorkspace compact showToolbar projectName={projectName} />
    </div>
  )
}
