import { create } from 'zustand'
import { apiFetch } from '../lib/api.js'
import { getPortal, PORTAL } from '../lib/portal.js'

export const useFeatureFlagsStore = create((set, get) => ({
  loaded: false,
  flags: [],
  byPath: {},

  reset: () => set({ loaded: false, flags: [], byPath: {} }),

  loadClientFlags: async () => {
    if (getPortal() !== PORTAL.CLIENT) {
      set({ loaded: true, flags: [], byPath: {} })
      return
    }
    try {
      const { flags } = await apiFetch('/api/client/feature-flags')
      const byPath = {}
      for (const flag of flags ?? []) {
        if (flag.navPath) byPath[flag.navPath] = flag.enabled
      }
      set({ loaded: true, flags, byPath })
    } catch {
      set({ loaded: true, flags: [], byPath: {} })
    }
  },

  isNavEnabled: (path, flagKey) => {
    const { loaded, byPath, flags } = get()
    if (!loaded) return true
    if (path && byPath[path] !== undefined) return byPath[path]
    if (flagKey) {
      const row = flags.find((f) => f.key === flagKey)
      if (row) return row.enabled
    }
    return true
  },

  firstEnabledClientPath: (navItems) => {
    const { isNavEnabled } = get()
    const hit = navItems.find((item) => isNavEnabled(item.to, item.flagKey))
    return hit?.to ?? '/account'
  },
}))