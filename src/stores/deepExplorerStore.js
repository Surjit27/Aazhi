import { create } from 'zustand'
import {
  ARCH_GRAPH_EDGES,
  ARCH_GRAPH_NODES,
  DISCOVERY_STAGES,
  MOCK_CONNECTED_BACKENDS,
} from '../data/deepBackend.js'

export const useDeepExplorerStore = create((set, get) => ({
  backends: [...MOCK_CONNECTED_BACKENDS],
  activeBackendId: MOCK_CONNECTED_BACKENDS[0]?.id ?? null,
  phase: 'home',
  discoveryStep: 0,
  discovering: false,
  selectedNodeId: null,
  logsOpen: true,
  graphNodes: ARCH_GRAPH_NODES,
  graphEdges: ARCH_GRAPH_EDGES,

  setPhase: (phase) => set({ phase }),
  selectBackend: (activeBackendId) => set({ activeBackendId, phase: 'home' }),
  selectGraphNode: (selectedNodeId) => set({ selectedNodeId }),
  toggleLogs: () => set((s) => ({ logsOpen: !s.logsOpen })),

  startDiscovery: () => {
    set({ phase: 'discovery', discoveryStep: 0, discovering: true })
    const interval = setInterval(() => {
      const { discoveryStep, discovering } = get()
      if (!discovering) {
        clearInterval(interval)
        return
      }
      const next = discoveryStep + 1
      if (next >= DISCOVERY_STAGES.length) {
        clearInterval(interval)
        set((s) => ({
          discovering: false,
          phase: 'workspace',
          discoveryStep: DISCOVERY_STAGES.length - 1,
          backends: s.backends.map((b) =>
            b.id === s.activeBackendId
              ? {
                  ...b,
                  status: 'discovered',
                  discoveredAt: new Date().toISOString(),
                  stats: {
                    services: 3,
                    apis: 12,
                    functions: 47,
                    executionFlows: 6,
                    databases: 2,
                    events: 4,
                    externals: 5,
                  },
                }
              : b,
          ),
        }))
        return
      }
      set({ discoveryStep: next })
    }, 650)
  },

  openConnect: () => set({ phase: 'connect' }),
  cancelConnect: () => set({ phase: 'home' }),

  addBackend: (payload) => {
    const id = payload.name.toLowerCase().replace(/\s+/g, '-')
    const backend = {
      id,
      name: payload.name,
      repo: payload.repo,
      branch: payload.branch || 'main',
      framework: payload.framework,
      status: 'idle',
      stats: null,
      discoveredAt: null,
    }
    set((s) => ({ backends: [backend, ...s.backends], activeBackendId: id, phase: 'home' }))
  },
}))
