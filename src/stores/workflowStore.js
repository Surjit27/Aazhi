import { create } from 'zustand'
import { addEdge, applyEdgeChanges, applyNodeChanges } from '@xyflow/react'
import { INITIAL_WORKFLOW_EDGES, INITIAL_WORKFLOW_NODES, TRACE_SEQUENCE } from '../data/workflowGraph.js'
import { uid } from '../utils/format.js'

const HISTORY_LIMIT = 80

function withHistory(state, next) {
  return {
    ...next,
    past: [...state.past, { nodes: state.nodes, edges: state.edges }].slice(-HISTORY_LIMIT),
    future: [],
  }
}

export const useWorkflowStore = create((set) => ({
  nodes: INITIAL_WORKFLOW_NODES,
  edges: INITIAL_WORKFLOW_EDGES,
  past: [],
  future: [],
  view: 'architecture',
  selectedNodeId: null,
  traceIndex: 0,
  traceRunning: false,

  setView: (view) => set({ view }),
  selectNode: (selectedNodeId) => set({ selectedNodeId }),

  startTrace: () => set({ traceIndex: 0, traceRunning: true }),
  stepTrace: () =>
    set((s) => {
      const next = s.traceIndex + 1
      return { traceIndex: next, traceRunning: next < TRACE_SEQUENCE.length }
    }),
  stopTrace: () => set({ traceRunning: false }),
  resetTrace: () => set({ traceIndex: 0, traceRunning: false }),

  onNodesChange: (changes) =>
    set((s) => {
      const hasRemoval = changes.some((c) => c.type === 'remove')
      const selectedGone = changes.some((c) => c.type === 'remove' && c.id === s.selectedNodeId)
      const nextNodes = applyNodeChanges(changes, s.nodes)
      const base = hasRemoval ? withHistory(s, { nodes: nextNodes }) : { nodes: nextNodes }
      return selectedGone ? { ...base, selectedNodeId: null } : base
    }),

  onEdgesChange: (changes) =>
    set((s) => {
      const hasRemoval = changes.some((c) => c.type === 'remove')
      const nextEdges = applyEdgeChanges(changes, s.edges)
      return hasRemoval ? withHistory(s, { edges: nextEdges }) : { edges: nextEdges }
    }),

  onConnect: (connection) =>
    set((s) => withHistory(s, { edges: addEdge({ ...connection, id: uid('e'), type: 'smoothstep' }, s.edges) })),

  onNodeDragStart: () =>
    set((s) => withHistory(s, {})),

  addNode: (kind, position, data) =>
    set((s) => {
      const id = uid('n')
      const node = {
        id,
        type: 'preflightNode',
        position,
        data: {
          kind,
          label: data.label,
          subtitle: data.subtitle ?? '',
          file: null,
          line: null,
          description: '',
          durationMs: 0,
          timeoutMs: 3000,
          retries: 0,
          ...data,
        },
      }
      return { ...withHistory(s, { nodes: [...s.nodes, node] }), selectedNodeId: id }
    }),

  updateNodeData: (id, patch) =>
    set((s) =>
      withHistory(s, {
        nodes: s.nodes.map((n) => (n.id === id ? { ...n, data: { ...n.data, ...patch } } : n)),
      }),
    ),

  deleteNodes: (ids) =>
    set((s) =>
      withHistory(s, {
        nodes: s.nodes.filter((n) => !ids.includes(n.id)),
        edges: s.edges.filter((e) => !ids.includes(e.source) && !ids.includes(e.target)),
        selectedNodeId: ids.includes(s.selectedNodeId) ? null : s.selectedNodeId,
      }),
    ),

  applyProposal: (proposal) =>
    set((s) =>
      withHistory(s, {
        nodes: [...s.nodes, ...proposal.addNodes],
        edges: [...s.edges.filter((e) => !proposal.removeEdgeIds.includes(e.id)), ...proposal.addEdges],
      }),
    ),

  undo: () =>
    set((s) => {
      if (!s.past.length) return s
      const prev = s.past[s.past.length - 1]
      return {
        nodes: prev.nodes,
        edges: prev.edges,
        past: s.past.slice(0, -1),
        future: [{ nodes: s.nodes, edges: s.edges }, ...s.future],
      }
    }),

  redo: () =>
    set((s) => {
      if (!s.future.length) return s
      const [next, ...rest] = s.future
      return {
        nodes: next.nodes,
        edges: next.edges,
        past: [...s.past, { nodes: s.nodes, edges: s.edges }],
        future: rest,
      }
    }),

  resetWorkflow: () =>
    set({ nodes: INITIAL_WORKFLOW_NODES, edges: INITIAL_WORKFLOW_EDGES, past: [], future: [], selectedNodeId: null }),
}))
