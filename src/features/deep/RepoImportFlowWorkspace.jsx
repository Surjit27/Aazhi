import { useMemo, useState } from 'react'
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, ReactFlowProvider } from '@xyflow/react'
import { FileSearch, RefreshCw } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { Input } from '../../components/ui/FormControls.jsx'
import { useRepoCodeGraph } from '../../hooks/useRepoCodeGraph.js'
import RepoFileNode from './RepoFileNode.jsx'
import { buildImportFlowGraph, buildRepoTreeEntries, graphStats } from './repoGraphUtils.js'
import { MINIMAP_COLORS } from '../workflow/nodeKinds.js'

const nodeTypes = { repoFile: RepoFileNode }

function RepoImportFlowCanvas({ graphRoot, query, onlyWithImports, selectedFileId, onSelectFile }) {
  const { nodes, edges, capped, shown } = useMemo(
    () =>
      buildImportFlowGraph(graphRoot, {
        query,
        onlyWithImports,
      }),
    [graphRoot, query, onlyWithImports],
  )

  const flowNodes = useMemo(
    () => nodes.map((n) => ({ ...n, selected: n.id === selectedFileId })),
    [nodes, selectedFileId],
  )

  if (!shown) {
    return <p className="p-6 text-sm text-ink-muted">No source files match your filters.</p>
  }

  return (
    <div className="relative h-full min-h-[400px] w-full">
      {capped ? (
        <p className="absolute top-2 right-2 z-10 rounded-md bg-warning-50 px-2 py-1 text-[10px] text-warning-800">
          Showing first 240 files — narrow search or enable “imports only”.
        </p>
      ) : null}
      <ReactFlow
        nodes={flowNodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => onSelectFile(node.id)}
        onPaneClick={() => onSelectFile(null)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.15}
        maxZoom={1.4}
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#E5E9EF" />
        <Controls showInteractive={false} />
        <MiniMap nodeColor={(n) => MINIMAP_COLORS[n.data?.kind] ?? '#94A3B8'} className="!border-line !bg-white/90" />
      </ReactFlow>
    </div>
  )
}

function RepoFileTreeSidebar({ graphRoot, selectedFileId, onSelectFile, query }) {
  const entries = useMemo(() => buildRepoTreeEntries(graphRoot), [graphRoot])
  const q = query.trim().toLowerCase()
  const filtered = q ? entries.filter((e) => `${e.name} ${e.path}`.toLowerCase().includes(q)) : entries

  return (
    <ul className="max-h-[520px] space-y-0.5 overflow-y-auto pr-1 text-xs scrollbar-thin">
      {filtered.map((entry) => {
        const isDir = entry.kind === 'dir'
        const active = !isDir && entry.id === selectedFileId
        return (
          <li key={entry.id}>
            <button
              type="button"
              disabled={isDir}
              onClick={() => !isDir && onSelectFile(entry.id)}
              className={`flex w-full items-center gap-1 truncate rounded px-2 py-1 text-left ${
                isDir
                  ? 'cursor-default font-semibold text-ink-subtle'
                  : `cursor-pointer hover:bg-white ${active ? 'bg-primary-50 font-medium text-primary-800' : 'text-ink-muted'}`
              }`}
              style={{ paddingLeft: `${8 + entry.depth * 10}px` }}
              title={entry.path}
            >
              <span className="truncate">{entry.name}</span>
              {!isDir && entry.importCount > 0 ? (
                <span className="ml-auto shrink-0 tabular-nums text-[10px] text-ink-subtle">{entry.importCount}</span>
              ) : null}
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default function RepoImportFlowWorkspace({ connectedRepo, repoLabel }) {
  const connectedRepoId = connectedRepo?.id
  const { graphRoot, meta, loading, indexing, error, needsIndex, reload, indexRepo } = useRepoCodeGraph(connectedRepoId)
  const [query, setQuery] = useState('')
  const [onlyWithImports, setOnlyWithImports] = useState(false)
  const [selectedFileId, setSelectedFileId] = useState(null)

  const stats = graphRoot ? graphStats(graphRoot) : null

  if (!connectedRepoId) {
    return <p className="p-6 text-sm text-ink-muted">Link a GitHub repository to this project to extract files and imports.</p>
  }

  return (
    <div className="flex min-h-[520px] flex-col gap-0 overflow-hidden rounded-lg border border-line bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{repoLabel ?? connectedRepo?.repo ?? 'Repository'}</p>
          <p className="text-xs text-ink-muted">
            {meta
              ? `${meta.fileCount} files indexed · ${meta.branch} @ ${String(meta.commitSha).slice(0, 7)}`
              : 'File tree and relative import graph from GitHub'}
          </p>
        </div>
        <Button size="sm" variant="secondary" disabled={loading || indexing} onClick={() => (needsIndex ? indexRepo() : reload())}>
          <RefreshCw size={14} className={indexing || loading ? 'animate-spin' : ''} />
          {needsIndex ? 'Extract repo' : 'Refresh index'}
        </Button>
      </div>

      {error ? <p className="border-b border-line bg-danger-50 px-4 py-2 text-xs text-danger-800">{error}</p> : null}
      {loading && !graphRoot ? <p className="p-6 text-sm text-ink-muted">Loading indexed graph…</p> : null}

      {!loading && needsIndex ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-10">
          <FileSearch size={28} className="text-ink-subtle" />
          <p className="max-w-md text-center text-sm text-ink-muted">
            Extract the repository file tree and map <code className="text-xs">import</code> / <code className="text-xs">require</code>{' '}
            links between source files (via GitHub).
          </p>
          <Button variant="primary" disabled={indexing} onClick={indexRepo}>
            {indexing ? 'Indexing…' : 'Run file extraction'}
          </Button>
        </div>
      ) : null}

      {graphRoot ? (
        <>
          <div className="flex flex-wrap items-center gap-3 border-b border-line bg-surface/40 px-4 py-2">
            {stats ? (
              <span className="flex flex-wrap gap-2 text-[11px] text-ink-muted">
                <Badge tone="neutral">{stats.totalFiles} files</Badge>
                <Badge tone="neutral">{stats.sourceFiles} source</Badge>
                <Badge tone="primary">{stats.importEdges} import edges</Badge>
                {stats.truncated ? <Badge tone="warning">Git tree truncated</Badge> : null}
              </span>
            ) : null}
            <label className="flex items-center gap-2 text-xs text-ink-muted">
              <input
                type="checkbox"
                checked={onlyWithImports}
                onChange={(e) => setOnlyWithImports(e.target.checked)}
                className="rounded border-line"
              />
              Only files with imports
            </label>
            <Input
              className="ml-auto h-8 max-w-xs text-xs"
              placeholder="Filter by path or filename"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="grid min-h-[480px] flex-1 grid-cols-1 lg:grid-cols-[220px_1fr]">
            <aside className="hidden border-r border-line p-3 lg:block">
              <p className="mb-2 text-[10px] font-semibold uppercase text-ink-subtle">File tree</p>
              <RepoFileTreeSidebar
                graphRoot={graphRoot}
                selectedFileId={selectedFileId}
                onSelectFile={setSelectedFileId}
                query={query}
              />
            </aside>
            <div className="min-h-[400px] min-w-0 flex-1">
              <ReactFlowProvider>
                <RepoImportFlowCanvas
                  graphRoot={graphRoot}
                  query={query}
                  onlyWithImports={onlyWithImports}
                  selectedFileId={selectedFileId}
                  onSelectFile={setSelectedFileId}
                />
              </ReactFlowProvider>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}