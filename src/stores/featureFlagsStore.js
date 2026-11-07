import { create } from 'zustand'
import { apiFetch, getStoredToken } from '../lib/api.js'
import { getPortal, PORTAL } from '../lib/portal.js'

function buildByPath(flags) {
  const byPath = {}
  for (const flag of flags ?? []) {
    if (flag.navPath) byPath[flag.navPath] = flag.enabled
  }
  return byPath
}

export const useFeatureFlagsStore = create((set, get) => ({
  loaded: false,
  flags: [],
  byPath: {},

  loadClientFlags: async () => {
    if (getPortal() !== PORTAL.CLIENT) {
      set({ loaded: true, flags: [], byPath: {} })
      return
    }
    const token = getStoredToken()
    if (!token) {
      set({ loaded: false, flags: [], byPath: {} })
      return
    }
    try {
      const { flags } = await apiFetch('/api/client/feature-flags')
      const list = flags ?? []
      set({ loaded: true, flags: list, byPath: buildByPath(list) })
    } catch {
      set({ loaded: true, flags: [], byPath: {} })
    }
  },

  isNavEnabled: (path, flagKey) => {
    const { loaded, byPath, flags } = get()
    if (!loaded) return true

    if (flagKey) {
      const row = flags.find((f) => f.key === flagKey)
      if (row) {
        if (row.navPath && path && row.navPath === path && byPath[row.navPath] !== undefined) {
          return byPath[row.navPath]
        }
        return row.enabled !== false
      }
    }

    if (path && byPath[path] !== undefined) return byPath[path]

    return true
  },

  firstEnabledClientPath: (navItems) => {
    const { isNavEnabled } = get()
    const hit = navItems.find((item) => isNavEnabled(item.to, item.flagKey))
    return hit?.to ?? '/account'
  },
}))
