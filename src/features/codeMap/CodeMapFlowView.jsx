import { useMemo } from 'react'
import { Background, BackgroundVariant, Controls, MiniMap, ReactFlow } from '@xyflow/react'
import { collectSymbolNodes } from './collectSymbols.js'

const kindColor = {
  function: '#157A42',
  const: '#9A6700',
  let: '#C62828',
  file: '#3B74E7',
  class: '#0D6E85',
}

function SymbolNode({ data }) {
  return (
    <div className="rounded-lg border border-line bg-white px-3 py-2 shadow-card">
      <p className="text-[9px] font-semibold uppercase text-ink-subtle">{data.kind}</p>
      <p className="text-xs font-medium text-ink">{data.label}</p>
    </div>
  )
}

const nodeTypes = { codeMapSymbol: SymbolNode }

export default function CodeMapFlowView({ root, selectedId, onSelect }) {
  const { nodes, edges } = useMemo(() => buildFlowFromRoot(root, selectedId), [root, selectedId])

  return (
    <div className="h-full min-h-[420px] w-full rounded-xl border border-line">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, n) => onSelect({ id: n.id, name: n.data.label, kind: n.data.kind })}
        fitView
        minZoom={0.35}
        defaultEdgeOptions={{ type: 'smoothstep', animated: true, style: { stroke: '#8A94A6' } }}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#E2E6EE" />
        <Controls showInteractive={false} />
        <MiniMap nodeColor={(n) => kindColor[n.data?.kind] ?? '#94A3B8'} className="!border-line !bg-white/90" />
      </ReactFlow>
    </div>
  )
}

function buildFlowFromRoot(root, selectedId) {
  const symbols = collectSymbolNodes(root)
  const idSet = new Set(symbols.map((s) => s.id))
  const col = 220
  const nodes = symbols.map((s, i) => ({
    id: s.id,
    type: 'codeMapSymbol',
    position: { x: (i % 4) * col, y: Math.floor(i / 4) * 100 },
    data: { label: s.name, kind: s.kind },
    selected: s.id === selectedId,
  }))
  const edges = []
  for (const s of symbols) {
    for (const target of s.uses ?? []) {
      if (idSet.has(target)) {
        edges.push({ id: `${s.id}->${target}`, source: s.id, target, type: 'smoothstep' })
      }
    }
  }
  return { nodes, edges }
}
