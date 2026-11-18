import { create } from 'zustand'
import { apiFetch, clearStoredToken, getStoredToken, setStoredToken } from '../lib/api.js'
import { openClientSessionWithHandoff } from '../lib/clientHandoff.js'
import { getPortal, PORTAL } from '../lib/portal.js'
import { usePersonalSettingsStore } from './personalSettingsStore.js'
import { useAccountSecurityStore } from './accountSecurityStore.js'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,
  error: null,
  twoFactorPending: null,

  bootstrap: async () => {
    const token = getStoredToken()
    if (!token) {
      usePersonalSettingsStore.getState().reset()
      useAccountSecurityStore.getState().reset()
      set({ user: null, token: null, twoFactorPending: null, loading: false })
      return
    }
    set({ token, loading: true, error: null })
    try {
      const { user } = await apiFetch('/api/auth/me')
      set({ user, token, loading: false })
      usePersonalSettingsStore.getState().fetch()
      useAccountSecurityStore.getState().fetchSecurity()
    } catch {
      clearStoredToken()
      usePersonalSettingsStore.getState().reset()
      useAccountSecurityStore.getState().reset()
      set({ user: null, token: null, twoFactorPending: null, loading: false })
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
      const { token, user, handoffCode, twoFactorRequired, pendingToken } = data
      if (twoFactorRequired && pendingToken) {
        set({
          twoFactorPending: { pendingToken, user },
          loading: false,
          error: null,
        })
        return { twoFactorRequired: true, user }
      }
      if (getPortal() === PORTAL.HOME && handoffCode) {
        set({ loading: false, error: null })
        openClientSessionWithHandoff(handoffCode)
        return user
      }
      setStoredToken(token)
      set({ user, token, loading: false, twoFactorPending: null })
      usePersonalSettingsStore.getState().fetch()
      useAccountSecurityStore.getState().fetchSecurity()
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
  },

  logout: async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' })
    } catch {
      /* still clear the local session */
    }
    usePersonalSettingsStore.getState().reset()
    useAccountSecurityStore.getState().reset()
    clearStoredToken()
    set({ user: null, token: null, twoFactorPending: null, error: null })
  },

  completeTwoFactor: async (code) => {
    const pending = get().twoFactorPending
    if (!pending?.pendingToken) {
      const err = new Error('Two-factor session expired — sign in again')
      set({ error: err.message })
      throw err
    }
    set({ loading: true, error: null })
    try {
      const data = await apiFetch('/api/auth/two-factor/verify-login', {
        method: 'POST',
        body: { pendingToken: pending.pendingToken, code },
        auth: false,
      })
      const { token, user, handoffCode } = data
      if (getPortal() === PORTAL.HOME && handoffCode) {
        set({ loading: false, twoFactorPending: null, error: null })
        openClientSessionWithHandoff(handoffCode)
        return user
      }
      setStoredToken(token)
      set({ user, token, loading: false, twoFactorPending: null })
      usePersonalSettingsStore.getState().fetch()
      useAccountSecurityStore.getState().fetchSecurity()
      return user
    } catch (err) {
      set({ error: err.message, loading: false })
      throw err
    }
  },

  clearTwoFactorPending: () => set({ twoFactorPending: null, error: null }),

  isAdmin: () => get().user?.role === 'admin',
  isClient: () => get().user?.role === 'client',
}))
