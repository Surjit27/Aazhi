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

    if (path) {
      if (byPath[path] !== undefined) return byPath[path]
      const match = Object.keys(byPath).find((base) => path === base || path.startsWith(`${base}/`))
      if (match) return byPath[match]
    }

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
