import { create } from 'zustand'
import { INITIAL_SCHEDULES } from '../data/schedules.js'
import { uid } from '../utils/format.js'
import { NOW_ISO } from '../data/executions.js'

export const useSchedulerStore = create((set) => ({
  schedules: INITIAL_SCHEDULES,

  addSchedule: (schedule) => set((s) => ({ schedules: [{ ...schedule, id: uid('s') }, ...s.schedules] })),

  updateSchedule: (id, patch) =>
    set((s) => ({ schedules: s.schedules.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)) })),

  deleteSchedule: (id) =>
    set((s) => ({
      schedules: s.schedules
        .filter((sc) => sc.id !== id)
        .map((sc) => (sc.dependsOn === id ? { ...sc, dependsOn: '', enabled: false } : sc)),
    })),

  toggleSchedule: (id) =>
    set((s) => ({ schedules: s.schedules.map((sc) => (sc.id === id ? { ...sc, enabled: !sc.enabled } : sc)) })),

  recordRun: (id, status) =>
    set((s) => ({
      schedules: s.schedules.map((sc) => (sc.id === id ? { ...sc, lastStatus: status, lastRunAt: NOW_ISO } : sc)),
    })),
}))
