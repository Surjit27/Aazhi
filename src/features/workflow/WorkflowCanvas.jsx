import { useMemo } from 'react'
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow, useReactFlow } from '@xyflow/react'
import { useWorkflowStore } from '../../stores/workflowStore.js'
import { TRACE_SEQUENCE } from '../../data/workflowGraph.js'
import PreflightNode from './PreflightNode.jsx'
import { DRAG_KIND_TYPE, MINIMAP_COLORS, PALETTE_ITEMS } from './nodeKinds.js'

const nodeTypes = { preflightNode: PreflightNode }
const PALETTE_BY_KIND = Object.fromEntries(PALETTE_ITEMS.map((item) => [item.kind, item]))

function traceStateFor(nodeId, view, traceIndex, traceRunning) {
  if (view !== 'trace') return undefined
  const idx = TRACE_SEQUENCE.indexOf(nodeId)
  if (idx === -1) return undefined
  if (idx < traceIndex) return 'done'
  if (idx === traceIndex && traceRunning) return 'active'
  return undefined
}

export default function WorkflowCanvas() {
  const nodes = useWorkflowStore((s) => s.nodes)
  const edges = useWorkflowStore((s) => s.edges)
  const view = useWorkflowStore((s) => s.view)
  const traceIndex = useWorkflowStore((s) => s.traceIndex)
  const traceRunning = useWorkflowStore((s) => s.traceRunning)
  const onNodesChange = useWorkflowStore((s) => s.onNodesChange)
  const onEdgesChange = useWorkflowStore((s) => s.onEdgesChange)
  const onConnect = useWorkflowStore((s) => s.onConnect)
  const onNodeDragStart = useWorkflowStore((s) => s.onNodeDragStart)
  const selectNode = useWorkflowStore((s) => s.selectNode)
  const addNode = useWorkflowStore((s) => s.addNode)
  const { screenToFlowPosition } = useReactFlow()

  const displayNodes = useMemo(
    () =>
      nodes.map((n) => ({
        ...n,
        data: { ...n.data, traceState: traceStateFor(n.id, view, traceIndex, traceRunning) },
      })),
    [nodes, view, traceIndex, traceRunning],
  )

  const displayEdges = useMemo(() => {
    if (view !== 'trace') return edges
    return edges.map((e) => {
      const from = TRACE_SEQUENCE.indexOf(e.source)
      const to = TRACE_SEQUENCE.indexOf(e.target)
      const traversed = from !== -1 && to !== -1 && to <= traceIndex && to === from + 1
      return traversed
        ? { ...e, animated: false, style: { stroke: '#17703D', strokeWidth: 2 } }
        : { ...e, animated: false }
    })
  }, [edges, view, traceIndex])

  const handleDrop = (event) => {
    event.preventDefault()
    const kind = event.dataTransfer.getData(DRAG_KIND_TYPE)
    const item = PALETTE_BY_KIND[kind]
    if (!item) return
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    addNode(kind, position, item.defaults)
  }

  return (
    <div className="h-full w-full" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
      <ReactFlow
        nodes={displayNodes}
        edges={displayEdges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onNodeClick={(_, node) => selectNode(node.id)}
        onPaneClick={() => selectNode(null)}
        isValidConnection={(c) => c.source !== c.target}
        defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#8A94A3', strokeWidth: 1.5 } }}
        deleteKeyCode={['Backspace', 'Delete']}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.25}
        maxZoom={1.8}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1.2} color="#D5DBE3" />
        <Controls showInteractive={false} position="bottom-left" />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor={(n) => MINIMAP_COLORS[n.data?.kind] ?? '#8A94A3'}
          nodeStrokeWidth={2}
          maskColor="rgba(247, 248, 250, 0.7)"
          style={{ background: '#FFFFFF', border: '1px solid #E5E9EF', borderRadius: 8 }}
        />
      </ReactFlow>
    </div>
  )
}
