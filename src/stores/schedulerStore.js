import { create } from 'zustand'
import { apiFetch } from '../lib/api.js'

export const useSchedulerStore = create((set, get) => ({
  schedules: [],
  runner: 'off',

  loadSchedules: async () => {
    const data = await apiFetch('/api/settings/job-triggers')
    set({ schedules: data.triggers, runner: data.runner })
    return data.triggers
  },

  addSchedule: async (schedule) => {
    const { trigger } = await apiFetch('/api/settings/job-triggers', { method: 'POST', body: schedule })
    set({ schedules: [trigger, ...get().schedules.filter((item) => item.id !== trigger.id)] })
    return trigger
  },

  updateSchedule: async (id, patch) => {
    const { trigger } = await apiFetch(`/api/settings/job-triggers/${id}`, { method: 'PATCH', body: patch })
    set({ schedules: get().schedules.map((item) => (item.id === id ? trigger : item)) })
    return trigger
  },

  deleteSchedule: async (id) => {
    await apiFetch(`/api/settings/job-triggers/${id}`, { method: 'DELETE' })
    await get().loadSchedules()
  },

  toggleSchedule: async (id) => {
    const current = get().schedules.find((item) => item.id === id)
    if (!current) return null
    return get().updateSchedule(id, { enabled: !current.enabled })
  },

  runSchedule: async (id) => {
    const { trigger } = await apiFetch(`/api/settings/job-triggers/${id}/run`, { method: 'POST' })
    set({ schedules: get().schedules.map((item) => (item.id === id ? trigger : item)) })
    return trigger
  },
}))
