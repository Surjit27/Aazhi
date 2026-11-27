import { useState } from 'react'
import { Link } from 'react-router-dom'
import '@xyflow/react/dist/style.css'
import {
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  useReactFlow,
} from '@xyflow/react'
import { Bot, CloudUpload, Copy, Link2, Play, Save, Sparkles, Square, Workflow } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { PageHeader } from '../../components/ui/Panel.jsx'
import { Field, Input } from '../../components/ui/FormControls.jsx'
import PagerNode from '../../features/deep/PagerNode.jsx'
import { PAGER_NODE_PALETTE, PAGER_TEMPLATES } from '../../data/pager.js'
import { usePagerStore } from '../../stores/pagerStore.js'
import { DRAG_KIND_TYPE } from '../../features/workflow/nodeKinds.js'
import { formatDateTime } from '../../utils/format.js'
import { brandBreadcrumbs } from '../../lib/breadcrumbs.js'

const nodeTypes = { pagerNode: PagerNode }
const PALETTE_MAP = Object.fromEntries(PAGER_NODE_PALETTE.map((p) => [p.kind, p]))

function PagerCanvas({ projectId, project }) {
  const selectedNodeId = usePagerStore((s) => s.selectedNodeId)
  const onNodesChange = usePagerStore((s) => s.onNodesChange)
  const onEdgesChange = usePagerStore((s) => s.onEdgesChange)
  const onConnect = usePagerStore((s) => s.onConnect)
  const selectNode = usePagerStore((s) => s.selectNode)
  const addNode = usePagerStore((s) => s.addNode)
  const { screenToFlowPosition } = useReactFlow()

  const handleDrop = (e) => {
    e.preventDefault()
    const kind = e.dataTransfer.getData(DRAG_KIND_TYPE) || e.dataTransfer.getData('application/pager-node')
    const item = PALETTE_MAP[kind]
    if (!item) return
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    addNode(projectId, kind, position, item.defaults)
  }

  return (
    <div className="h-full w-full" onDragOver={(ev) => ev.preventDefault()} onDrop={handleDrop}>
      <ReactFlow
        nodes={project.nodes.map((n) => ({ ...n, selected: n.id === selectedNodeId }))}
        edges={project.edges}
        nodeTypes={nodeTypes}
        onNodesChange={(ch) => onNodesChange(projectId, ch)}
        onEdgesChange={(ch) => onEdgesChange(projectId, ch)}
        onConnect={(c) => onConnect(projectId, c)}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        fitView
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} color="#D7DCE5" />
        <Controls showInteractive={false} />
        <MiniMap className="!rounded-lg !border-line !bg-white/95" nodeColor="#94A3B8" />
      </ReactFlow>
    </div>
  )
}

export default function PagerProjectPage({ projectId }) {
  const project = usePagerStore((s) => s.projects.find((p) => p.id === projectId))
  const selectedNodeId = usePagerStore((s) => s.selectedNodeId)
  const applyTemplate = usePagerStore((s) => s.applyTemplate)
  const saveProject = usePagerStore((s) => s.saveProject)
  const startTempHost = usePagerStore((s) => s.startTempHost)
  const stopTempHost = usePagerStore((s) => s.stopTempHost)
  const aiSuggestWorkflow = usePagerStore((s) => s.aiSuggestWorkflow)
  const testRun = usePagerStore((s) => s.testRun)

  const [aiInput, setAiInput] = useState('')

  if (!project) return null

  const selectedNode = project.nodes.find((n) => n.id === selectedNodeId)

  const copyHost = () => {
    if (project.tempHost?.url) navigator.clipboard?.writeText(project.tempHost.url)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title={project.name}
        description={project.description || 'Build hostable event workflows on the canvas.'}
        breadcrumbs={brandBreadcrumbs('Deep Backend', 'Pager')}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/deep/pager">
              <Button variant="ghost" size="sm">
                All projects
              </Button>
            </Link>
            <Badge tone={project.status === 'live' ? 'success' : project.status === 'saved' ? 'primary' : 'neutral'}>
              {project.status}
            </Badge>
            <Button size="sm" variant="secondary" onClick={() => saveProject(projectId)}>
              <Save size={13} /> Save
            </Button>
            {project.tempHost ? (
              <Button size="sm" variant="ghost" onClick={() => stopTempHost(projectId)}>
                <Square size={13} /> Stop host
              </Button>
            ) : (
              <Button size="sm" variant="primary" onClick={() => startTempHost(projectId)}>
                <CloudUpload size={13} /> Host temp (24h)
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={() => testRun(projectId)}>
              <Play size={13} /> Test run
            </Button>
          </div>
        }
      />

      {project.tempHost ? (
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-success-700/20 bg-success-50/80 px-4 py-2 md:px-6">
          <div className="flex min-w-0 items-center gap-2 text-sm text-ink">
            <Link2 size={16} className="shrink-0 text-success-700" />
            <span className="font-medium">Temporary host</span>
            <code className="truncate rounded bg-white/80 px-2 py-0.5 font-mono text-xs">{project.tempHost.url}</code>
            <span className="hidden text-xs text-ink-muted sm:inline">until {formatDateTime(project.tempHost.expiresAt)}</span>
          </div>
          <Button size="sm" variant="ghost" onClick={copyHost}>
            <Copy size={12} /> Copy URL
          </Button>
        </div>
      ) : null}

      <div className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)_280px]">
        <aside className="flex flex-col gap-4 border-b border-line bg-surface/50 p-4 lg:border-b-0 lg:border-r">
          <div>
            <p className="text-[10px] font-semibold uppercase text-ink-subtle">Templates</p>
            <ul className="mt-2 space-y-1">
              {PAGER_TEMPLATES.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => applyTemplate(projectId, t.id)}
                    className="w-full cursor-pointer rounded-lg border border-transparent px-2 py-2 text-left text-xs hover:border-line hover:bg-white"
                  >
                    <p className="font-medium text-ink">{t.label}</p>
                    <p className="text-[10px] text-ink-muted">{t.description}</p>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase text-ink-subtle">Nodes</p>
            <div className="grid grid-cols-2 gap-1">
              {PAGER_NODE_PALETTE.map((item) => (
                <div
                  key={item.kind}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData(DRAG_KIND_TYPE, item.kind)
                    e.dataTransfer.setData('application/pager-node', item.kind)
                  }}
                  className="cursor-grab rounded-lg border border-line bg-white px-2 py-1.5 text-[10px] font-medium text-ink shadow-sm hover:border-primary-200 active:cursor-grabbing"
                >
                  {item.label}
                </div>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-ink-muted">
            {project.nodes.length} nodes · {project.edges.length} edges
          </p>
        </aside>

        <div className="relative min-h-[440px] min-w-0">
          <ReactFlowProvider>
            <PagerCanvas projectId={projectId} project={project} />
          </ReactFlowProvider>
          {selectedNode ? (
            <div className="absolute bottom-3 right-3 max-w-xs rounded-lg border border-line bg-white/95 p-3 shadow-card backdrop-blur">
              <p className="text-[10px] font-semibold uppercase text-ink-subtle">Selected node</p>
              <p className="text-sm font-semibold text-ink">{selectedNode.data.label}</p>
              <p className="text-xs text-ink-muted">{selectedNode.data.subtitle}</p>
            </div>
          ) : null}
        </div>

        <aside className="flex min-h-[320px] flex-col border-line bg-gradient-to-b from-teal-50/40 to-white lg:min-h-0 lg:border-l">
          <div className="border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-teal-600 text-white">
                <Bot size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Pager AI</p>
                <p className="text-[10px] text-ink-muted">Build this project&apos;s workflow</p>
              </div>
            </div>
          </div>
          <ul className="min-h-0 flex-1 space-y-3 overflow-y-auto p-4">
            {project.aiMessages.map((m) => (
              <li
                key={m.id}
                className={`rounded-xl px-3 py-2 text-xs leading-relaxed ${
                  m.role === 'user' ? 'ml-4 bg-primary-50 text-ink' : 'mr-2 border border-line bg-white text-ink-muted'
                }`}
              >
                {m.text}
              </li>
            ))}
          </ul>
          <form
            className="border-t border-line p-3"
            onSubmit={(e) => {
              e.preventDefault()
              if (!aiInput.trim()) return
              aiSuggestWorkflow(projectId, aiInput.trim())
              setAiInput('')
            }}
          >
            <Field label="Ask the bot">
              <div className="flex gap-1">
                <Input
                  placeholder="Simulate signup then emit event…"
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                />
                <Button type="submit" variant="primary" size="sm" aria-label="Send">
                  <Sparkles size={14} />
                </Button>
              </div>
            </Field>
            <p className="mt-2 text-[10px] text-ink-muted">
              <Workflow size={10} className="mr-0.5 inline" />
              Tied to this Pager project only.
            </p>
          </form>
        </aside>
      </div>
    </div>
  )
}
