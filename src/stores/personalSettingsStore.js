import { create } from 'zustand'
import { apiFetch } from '../lib/api.js'
import { mergePersonalSettingsDefaults, PERSONAL_SETTINGS_DEFAULTS } from '../lib/personalSettings.js'

export const usePersonalSettingsStore = create((set, get) => ({
  settings: structuredClone(PERSONAL_SETTINGS_DEFAULTS),
  loaded: false,
  loading: false,
  saving: false,
  error: null,

  reset: () => {
    set({
      settings: structuredClone(PERSONAL_SETTINGS_DEFAULTS),
      loaded: false,
      loading: false,
      saving: false,
      error: null,
    })
  },

  fetch: async () => {
    if (get().loading) return
    set({ loading: true, error: null })
    try {
      const { personalSettings } = await apiFetch('/api/auth/personal-settings')
      set({
        settings: mergePersonalSettingsDefaults(personalSettings),
        loaded: true,
        loading: false,
      })
    } catch (err) {
      set({ error: err.message, loading: false })
    }
  },

  save: async (patch, pushToast) => {
    set({ saving: true, error: null })
    try {
      const { personalSettings } = await apiFetch('/api/auth/personal-settings', {
        method: 'PATCH',
        body: patch,
      })
      const settings = mergePersonalSettingsDefaults(personalSettings)
      set({ settings, saving: false, loaded: true })
      pushToast?.({ title: 'Personal settings saved' })
      return settings
    } catch (err) {
      set({ error: err.message, saving: false })
      pushToast?.({ tone: 'danger', title: 'Could not save settings', body: err.message })
      throw err
    }
  },
}))