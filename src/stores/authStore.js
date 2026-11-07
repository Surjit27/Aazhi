import { create } from 'zustand'
import { apiFetch, clearStoredToken, getStoredToken, setStoredToken } from '../lib/api.js'
import { openClientSessionWithHandoff } from '../lib/clientHandoff.js'
import { getPortal, PORTAL } from '../lib/portal.js'
import { useFeatureFlagsStore } from './featureFlagsStore.js'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,
  error: null,

  bootstrap: async () => {
    const token = getStoredToken()
    if (!token) {
      set({ user: null, token: null, loading: false })
      return
    }
    set({ token, loading: true, error: null })
    try {
      const { user } = await apiFetch('/api/auth/me')
      set({ user, token, loading: false })
      await useFeatureFlagsStore.getState().loadClientFlags()
    } catch {
      clearStoredToken()
      set({ user: null, token: null, loading: false })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      })
      const { token, user, handoffCode } = data
      if (getPortal() === PORTAL.HOME && handoffCode) {
        set({ loading: false, error: null })
        openClientSessionWithHandoff(handoffCode)
        return user
      }
      setStoredToken(token)
      set({ user, token, loading: false })
      await useFeatureFlagsStore.getState().loadClientFlags()
      return user
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  signUp: async ({ email, password, displayName }) => {
    set({ loading: true, error: null })
    try {
      const { user, handoffCode } = await apiFetch('/api/auth/signup', {
        method: 'POST',
        body: { email, password, displayName },
        auth: false,
      })
      set({ loading: false, error: null })
      if (handoffCode) {
        openClientSessionWithHandoff(handoffCode)
      }
      return user
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  applySession: (token, user) => {
    set({ user, token, loading: false, error: null })
    void useFeatureFlagsStore.getState().loadClientFlags()
  },

  logout: async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch {
      /* still clear the local session */
    }
    clearStoredToken()
    set({ user: null, token: null, error: null })
  },

  isAdmin: () => get().user?.role === 'admin',
  isClient: () => get().user?.role === 'client',
}))
