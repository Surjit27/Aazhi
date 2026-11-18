import { create } from 'zustand'
import { apiFetch } from '../lib/api.js'

export const useAccountSecurityStore = create((set, get) => ({
  security: { twoFactorEnabled: false },
  loaded: false,
  loading: false,
  setup: null,
  error: null,

  reset: () => {
    set({
      security: { twoFactorEnabled: false },
      loaded: false,
      loading: false,
      setup: null,
      error: null,
    })
  },

  fetchSecurity: async () => {
    if (get().loading) return
    set({ loading: true, error: null })
    try {
      const { security } = await apiFetch('/api/auth/security')
      set({ security, loaded: true, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  changePassword: async ({ currentPassword, newPassword }, pushToast) => {
    await apiFetch('/api/auth/password', {
      method: 'POST',
      body: { currentPassword, newPassword },
    })
    pushToast?.({ title: 'Password updated' })
  },

  beginTwoFactorSetup: async (pushToast) => {
    const { setup } = await apiFetch('/api/auth/two-factor/setup', { method: 'POST' })
    set({ setup })
    pushToast?.({ title: 'Scan the setup key in your authenticator app' })
    return setup
  },

  enableTwoFactor: async (code, pushToast) => {
    const result = await apiFetch('/api/auth/two-factor/enable', {
      method: 'POST',
      body: { code },
    })
    set({ security: { twoFactorEnabled: result.twoFactorEnabled }, setup: null })
    pushToast?.({ title: 'Two-factor authentication enabled' })
  },

  disableTwoFactor: async ({ password, code }, pushToast) => {
    const result = await apiFetch('/api/auth/two-factor/disable', {
      method: 'POST',
      body: { password, code },
    })
    set({ security: { twoFactorEnabled: result.twoFactorEnabled }, setup: null })
    pushToast?.({ title: 'Two-factor authentication disabled' })
  },
}))