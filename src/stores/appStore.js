import { create } from 'zustand'
import { INITIAL_BACKENDS } from '../data/backends.js'
import { ENVIRONMENTS, INITIAL_NOTIFICATIONS } from '../data/projectData.js'
import { uid } from '../utils/format.js'

export const useAppStore = create((set, get) => ({
  backends: INITIAL_BACKENDS,
  /** @deprecated use backends — kept for components not yet migrated */
  projects: INITIAL_BACKENDS.map(({ id, name, description }) => ({ id, name, description })),
  backendId: INITIAL_BACKENDS[0].id,
  projectId: INITIAL_BACKENDS[0].id,
  environments: ENVIRONMENTS,
  environmentId: 'local',
  notifications: INITIAL_NOTIFICATIONS,
  toasts: [],

  setBackend: (backendId) => set({ backendId, projectId: backendId }),
  setProject: (projectId) => set({ projectId, backendId: projectId }),

  addBackend: (payload) => {
    const id = uid('backend')
    const backend = {
      id,
      name: payload.name.trim(),
      description: payload.description.trim() || 'New backend service',
      architecture: payload.architecture,
      status: payload.status ?? 'pending',
      git: {
        provider: payload.gitProvider,
        repository: payload.repository.trim(),
        branch: payload.branch.trim() || 'main',
        defaultBranch: payload.branch.trim() || 'main',
        lastSyncAt: null,
        cloneUrl: payload.cloneUrl?.trim() || '',
      },
      stats: { routes: 0, functions: 0, modules: 0 },
      explorerBranch: payload.branch.trim() || 'main',
      localBaseUrl: payload.localBaseUrl?.trim() || 'http://localhost:4000',
    }
    set((s) => ({
      backends: [backend, ...s.backends],
      projects: [{ id, name: backend.name, description: backend.description }, ...s.projects],
    }))
    return backend
  },

  setEnvironment: (environmentId) => set({ environmentId }),

  markNotificationRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllNotificationsRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  clearNotifications: () => set({ notifications: [] }),

  pushToast: ({ tone = 'success', title, body = '' }) => {
    const id = uid('toast')
    set((s) => ({ toasts: [...s.toasts, { id, tone, title, body }] }))
    setTimeout(() => get().dismissToast(id), 3500)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

export function useActiveBackend() {
  const backends = useAppStore((s) => s.backends)
  const backendId = useAppStore((s) => s.backendId)
  return backends.find((b) => b.id === backendId) ?? backends[0]
}
