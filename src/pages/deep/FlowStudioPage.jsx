import { useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ReactFlowProvider, Background, BackgroundVariant, Controls, MiniMap, ReactFlow, useReactFlow } from '@xyflow/react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { PageHeader } from '../../components/ui/Panel.jsx'
import { useDeepFlowStudioStore } from '../../stores/deepFlowStudioStore.js'
import { FLOW_PALETTE, DEEP_EXECUTIONS } from '../../data/deepBackend.js'
import DeepFlowNode from '../../features/deep/DeepFlowNode.jsx'
import ExecutionLogDrawer from '../../features/deep/ExecutionLogDrawer.jsx'
import { DRAG_KIND_TYPE } from '../../features/workflow/nodeKinds.js'

const nodeTypes = { deepFlowNode: DeepFlowNode }
const PALETTE = Object.fromEntries(FLOW_PALETTE.map((p) => [p.kind, p]))

function FlowCanvas() {
  const nodes = useDeepFlowStudioStore((s) => s.nodes)
  const edges = useDeepFlowStudioStore((s) => s.edges)
  const selectedNodeId = useDeepFlowStudioStore((s) => s.selectedNodeId)
  const onNodesChange = useDeepFlowStudioStore((s) => s.onNodesChange)
  const onEdgesChange = useDeepFlowStudioStore((s) => s.onEdgesChange)
  const onConnect = useDeepFlowStudioStore((s) => s.onConnect)
  const selectNode = useDeepFlowStudioStore((s) => s.selectNode)
  const addNode = useDeepFlowStudioStore((s) => s.addNode)
  const { screenToFlowPosition } = useReactFlow()

  const handleDrop = (e) => {
    e.preventDefault()
    const kind = e.dataTransfer.getData(DRAG_KIND_TYPE)
    const item = PALETTE[kind]
    if (!item) return
    const position = screenToFlowPosition({ x: e.clientX, y: e.clientY })
    addNode(kind, position, item.defaults)
  }

  return (
    <div className="h-full w-full" onDragOver={(ev) => ev.preventDefault()} onDrop={handleDrop}>
      <ReactFlow
        nodes={nodes.map((n) => ({ ...n, selected: n.id === selectedNodeId }))}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        fitView
        defaultEdgeOptions={{ type: 'smoothstep' }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} color="#E5E9EF" />
        <Controls showInteractive={false} />
        <MiniMap className="!border-line !bg-white/90" />
      </ReactFlow>
    </div>
  )
}

export default function FlowStudioPage() {
  const [params] = useSearchParams()
  const executionId = params.get('execution')
  const activeExecutionId = useDeepFlowStudioStore((s) => s.activeExecutionId)
  const replayMode = useDeepFlowStudioStore((s) => s.replayMode)
  const loadExecution = useDeepFlowStudioStore((s) => s.loadExecution)
  const clearReplay = useDeepFlowStudioStore((s) => s.clearReplay)
  const ex = DEEP_EXECUTIONS.find((e) => e.id === (executionId || activeExecutionId))

  useEffect(() => {
    if (executionId) loadExecution(executionId)
  }, [executionId, loadExecution])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <PageHeader
        title="Flow Studio"
        description="Visual editor for Execution Flows — drag discovered components and connect them."
        breadcrumbs={['deepe', 'Deep Backend', 'Flow Studio']}
        actions={
          replayMode ? (
            <div className="flex items-center gap-2">
              <Badge tone={ex?.status === 'failed' ? 'danger' : ex?.status === 'running' ? 'warning' : 'success'}>
                Replay {ex?.id}
              </Badge>
              <Button size="sm" onClick={clearReplay}>
                Exit replay
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="primary" onClick={() => useDeepFlowStudioStore.getState().loadExecution('RUN-1024')}>
              Mock run
            </Button>
          )
        }
      />
      <div className="mx-4 mb-4 flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-line bg-white shadow-card md:mx-6">
        <div className="flex min-h-[420px] min-w-0 flex-1">
          <aside className="hidden w-44 shrink-0 border-r border-line bg-surface/40 p-2 md:block">
            <p className="px-2 py-1 text-[10px] font-semibold uppercase text-ink-subtle">Palette</p>
            {FLOW_PALETTE.map((item) => (
              <div
                key={item.kind}
                draggable
                onDragStart={(e) => e.dataTransfer.setData(DRAG_KIND_TYPE, item.kind)}
                className="mb-1 cursor-grab rounded-md border border-line bg-white px-2 py-1.5 text-xs font-medium text-ink hover:border-primary-200"
              >
                {item.label}
              </div>
            ))}
          </aside>
          <div className="min-h-0 min-w-0 flex-1">
            <ReactFlowProvider>
              <FlowCanvas />
            </ReactFlowProvider>
          </div>
        </div>
        <ExecutionLogDrawer open executionId={ex?.id} onClose={() => {}} />
      </div>
    </div>
  )
}
