import { useMemo } from 'react'
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow } from '@xyflow/react'
import { useDeepExplorerStore } from '../../stores/deepExplorerStore.js'
import DeepArchNode from './DeepArchNode.jsx'
import { MINIMAP_COLORS } from '../workflow/nodeKinds.js'

const nodeTypes = { deepArchNode: DeepArchNode }

export default function ArchitectureGraph() {
  const graphNodes = useDeepExplorerStore((s) => s.graphNodes)
  const graphEdges = useDeepExplorerStore((s) => s.graphEdges)
  const selectedNodeId = useDeepExplorerStore((s) => s.selectedNodeId)
  const selectGraphNode = useDeepExplorerStore((s) => s.selectGraphNode)
  const nodes = useMemo(
    () => graphNodes.map((n) => ({ ...n, selected: n.id === selectedNodeId })),
    [graphNodes, selectedNodeId],
  )

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={graphEdges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => selectGraphNode(node.id)}
        onPaneClick={() => selectGraphNode(null)}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.4}
        defaultEdgeOptions={{ type: 'smoothstep', style: { stroke: '#8A94A3', strokeWidth: 1.5 } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#E5E9EF" />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(n) => MINIMAP_COLORS[n.data?.kind] ?? '#94A3B8'}
          className="!border-line !bg-white/90"
        />
      </ReactFlow>
    </div>
  )
}
