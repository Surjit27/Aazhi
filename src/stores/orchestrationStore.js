import { create } from 'zustand'
import { MOCK_ORCHESTRATION_PIPELINES, ORCHESTRATION_STEP_KINDS } from '../data/orchestration.js'
import { uid } from '../utils/format.js'

const STORAGE_KEY = 'deepe_orchestration_pipelines_v1'

function loadPipelines() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...MOCK_ORCHESTRATION_PIPELINES]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length ? parsed : [...MOCK_ORCHESTRATION_PIPELINES]
  } catch {
    return [...MOCK_ORCHESTRATION_PIPELINES]
  }
}

function persist(pipelines) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pipelines))
  } catch {
    /* */
  }
}

const kindLabel = (id) => ORCHESTRATION_STEP_KINDS.find((k) => k.id === id)?.label ?? id

export const useOrchestrationStore = create((set, get) => ({
  pipelines: loadPipelines(),
  activePipelineId: loadPipelines()[0]?.id ?? null,

  selectPipeline: (activePipelineId) => set({ activePipelineId }),

  createPipeline: ({ name, projectId, preset, cloudProviderId }) => {
    const now = new Date().toISOString()
    const pipeline = {
      id: uid('pipe'),
      projectId: projectId || null,
      name: String(name ?? 'Untitled pipeline').trim(),
      preset: preset || 'full-journey',
      cloudProviderId: cloudProviderId || 'aws',
      cloudProfileId: null,
      notepad: '',
      steps: [],
      schedule: { cron: '0 */6 * * *', timezone: 'UTC', enabled: false },
      lastRunStatus: 'never',
      updatedAt: now,
    }
    const pipelines = [pipeline, ...get().pipelines]
    persist(pipelines)
    set({ pipelines, activePipelineId: pipeline.id })
    return pipeline
  },

  updatePipeline: (id, patch) => {
    const pipelines = get().pipelines.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p,
    )
    persist(pipelines)
    set({ pipelines })
  },

  addStep: (pipelineId, kind) => {
    const step = {
      id: uid('step'),
      kind,
      label: kindLabel(kind),
      config: {},
    }
    const pipelines = get().pipelines.map((p) =>
      p.id === pipelineId ? { ...p, steps: [...p.steps, step], updatedAt: new Date().toISOString() } : p,
    )
    persist(pipelines)
    set({ pipelines })
  },

  removeStep: (pipelineId, stepId) => {
    const pipelines = get().pipelines.map((p) =>
      p.id === pipelineId
        ? { ...p, steps: p.steps.filter((s) => s.id !== stepId), updatedAt: new Date().toISOString() }
        : p,
    )
    persist(pipelines)
    set({ pipelines })
  },

  reorderStep: (pipelineId, stepId, direction) => {
    const pipelines = get().pipelines.map((p) => {
      if (p.id !== pipelineId) return p
      const idx = p.steps.findIndex((s) => s.id === stepId)
      if (idx < 0) return p
      const next = [...p.steps]
      const swap = direction === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= next.length) return p
      ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return { ...p, steps: next, updatedAt: new Date().toISOString() }
    })
    persist(pipelines)
    set({ pipelines })
  },

  mockRun: (pipelineId) => {
    const pipelines = get().pipelines.map((p) =>
      p.id === pipelineId
        ? { ...p, lastRunStatus: 'success', lastRunAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        : p,
    )
    persist(pipelines)
    set({ pipelines })
  },

  deletePipeline: (id) => {
    const pipelines = get().pipelines.filter((p) => p.id !== id)
    persist(pipelines)
    set({
      pipelines,
      activePipelineId: pipelines[0]?.id ?? null,
    })
  },
}))
