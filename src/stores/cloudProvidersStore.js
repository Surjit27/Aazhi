import { create } from 'zustand'
import { CLOUD_PROVIDERS } from '../data/cloudProviders.js'
import { uid } from '../utils/format.js'

const STORAGE_KEY = 'deepe_cloud_profiles_v1'

function loadProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(profiles) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
  } catch {
    /* */
  }
}

export const useCloudProvidersStore = create((set, get) => ({
  profiles: loadProfiles(),

  listForProvider: (providerId) => get().profiles.filter((p) => p.providerId === providerId),

  upsertProfile: (providerId, body) => {
    const provider = CLOUD_PROVIDERS.find((p) => p.id === providerId)
    if (!provider) return null
    const now = new Date().toISOString()
    const existingId = body.id
    if (existingId) {
      const profiles = get().profiles.map((p) =>
        p.id === existingId
          ? {
              ...p,
              label: String(body.label ?? p.label).trim() || p.label,
              region: String(body.region ?? '').trim(),
              accountRef: String(body.accountRef ?? '').trim(),
              schedulerTarget: String(body.schedulerTarget ?? '').trim(),
              roleArn: String(body.roleArn ?? '').trim(),
              projectOrSubscription: String(body.projectOrSubscription ?? '').trim(),
              credentialsSet: Boolean(body.credentialsSet ?? p.credentialsSet),
              defaultForOrchestration: Boolean(body.defaultForOrchestration),
              updatedAt: now,
            }
          : p,
      )
      persist(profiles)
      set({ profiles })
      return profiles.find((p) => p.id === existingId)
    }
    const profile = {
      id: uid('cloud'),
      providerId,
      label: String(body.label ?? `${provider.shortLabel} default`).trim(),
      region: String(body.region ?? '').trim(),
      accountRef: String(body.accountRef ?? '').trim(),
      schedulerTarget: String(body.schedulerTarget ?? provider.schedulerService).trim(),
      roleArn: String(body.roleArn ?? '').trim(),
      projectOrSubscription: String(body.projectOrSubscription ?? '').trim(),
      credentialsSet: Boolean(body.credentialsSet),
      defaultForOrchestration: Boolean(body.defaultForOrchestration),
      createdAt: now,
      updatedAt: now,
    }
    const profiles = [profile, ...get().profiles]
    persist(profiles)
    set({ profiles })
    return profile
  },

  removeProfile: (id) => {
    const profiles = get().profiles.filter((p) => p.id !== id)
    persist(profiles)
    set({ profiles })
  },
}))
