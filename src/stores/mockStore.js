import { create } from 'zustand'
import { INITIAL_MOCK_SERVERS } from '../data/mockServers.js'

function mapServer(servers, serverId, fn) {
  return servers.map((server) => (server.id === serverId ? fn(server) : server))
}

export const useMockStore = create((set) => ({
  servers: INITIAL_MOCK_SERVERS,
  selectedServerId: INITIAL_MOCK_SERVERS[0].id,

  selectServer: (selectedServerId) => set({ selectedServerId }),

  toggleServerRunning: (serverId) =>
    set((s) => ({ servers: mapServer(s.servers, serverId, (sv) => ({ ...sv, running: !sv.running })) })),

  updateServer: (serverId, patch) =>
    set((s) => ({ servers: mapServer(s.servers, serverId, (sv) => ({ ...sv, ...patch })) })),

  addEndpoint: (serverId, endpoint) =>
    set((s) => ({
      servers: mapServer(s.servers, serverId, (sv) => ({ ...sv, endpoints: [...sv.endpoints, endpoint] })),
    })),

  updateEndpoint: (serverId, endpointId, patch) =>
    set((s) => ({
      servers: mapServer(s.servers, serverId, (sv) => ({
        ...sv,
        endpoints: sv.endpoints.map((ep) => (ep.id === endpointId ? { ...ep, ...patch } : ep)),
      })),
    })),

  deleteEndpoint: (serverId, endpointId) =>
    set((s) => ({
      servers: mapServer(s.servers, serverId, (sv) => ({
        ...sv,
        endpoints: sv.endpoints.filter((ep) => ep.id !== endpointId),
      })),
    })),
}))
