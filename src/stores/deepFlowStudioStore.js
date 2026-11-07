import { create } from 'zustand'
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import { FLOW_STUDIO_INITIAL_EDGES, FLOW_STUDIO_INITIAL_NODES } from '../data/deepBackend.js'
import { DEEP_EXECUTIONS } from '../data/deepBackend.js'
import { uid } from '../utils/format.js'

export const useDeepFlowStudioStore = create((set, get) => ({
  nodes: FLOW_STUDIO_INITIAL_NODES,
  edges: FLOW_STUDIO_INITIAL_EDGES,
  selectedNodeId: null,
  activeExecutionId: null,
  replayMode: false,

  loadExecution: (executionId) => {
    const ex = DEEP_EXECUTIONS.find((e) => e.id === executionId)
    if (!ex) return
    set({
      activeExecutionId: executionId,
      replayMode: true,
      nodes: get().nodes.map((n) => ({
        ...n,
        data: {
          ...n.data,
          traceState: ex.nodeStates?.[n.id] ?? 'pending',
        },
      })),
    })
  },

  clearReplay: () =>
    set({
      activeExecutionId: null,
      replayMode: false,
      nodes: get().nodes.map((n) => ({ ...n, data: { ...n.data, traceState: undefined } })),
    }),

  selectNode: (selectedNodeId) => set({ selectedNodeId }),
  onNodesChange: (changes) => set((s) => ({ nodes: applyNodeChanges(changes, s.nodes) })),
  onEdgesChange: (changes) => set((s) => ({ edges: applyEdgeChanges(changes, s.edges) })),
  onConnect: (connection) =>
    set((s) => ({
      edges: addEdge({ ...connection, id: uid('fe'), type: 'smoothstep' }, s.edges),
    })),

  addNode: (kind, position, data) => {
    const id = uid('n')
    set((s) => ({
      nodes: [
        ...s.nodes,
        {
          id,
          type: 'deepFlowNode',
          position,
          data: { kind, ...data },
        },
      ],
      selectedNodeId: id,
    }))
  },
}))
