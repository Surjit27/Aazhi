import { create } from 'zustand'
import { apiFetch, setStoredToken } from '../lib/api.js'

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: true,
  error: null,

  bootstrap: async () => {
    const token = localStorage.getItem('aazhi_token')
    if (!token) {
      set({ user: null, token: null, loading: false })
      return
    }
    set({ token, loading: true, error: null })
    try {
      const { user } = await apiFetch('/api/auth/me')
      set({ user, token, loading: false })
    } catch {
      setStoredToken(null)
      set({ user: null, token: null, loading: false })
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null })
    try {
      const { token, user } = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: { email, password },
        auth: false,
      })
      setStoredToken(token)
      set({ user, token, loading: false })
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
    setStoredToken(null)
    set({ user: null, token: null, error: null })
  },

  isAdmin: () => get().user?.role === 'admin',
  isClient: () => get().user?.role === 'client',
}))
