import { create } from 'zustand'

const STORAGE_KEY = 'aazhi_platform_settings_v1'

export const AI_MODELS = [
  { id: 'workspace-default', label: 'Workspace default' },
  { id: 'gpt-4.1', label: 'GPT-4.1' },
  { id: 'gpt-4.1-mini', label: 'GPT-4.1 mini' },
  { id: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
]

export const AI_SCAN_DEPTHS = [
  { id: 'quick', label: 'Quick scan' },
  { id: 'standard', label: 'Standard scan' },
  { id: 'deep', label: 'Deep scan' },
]

const DEFAULTS = {
  ai: {
    workerBaseUrl: import.meta.env.VITE_AI_WORKER_URL ?? '/ai-worker',
    defaultModel: 'workspace-default',
    scanDepth: 'standard',
    includeFlowGraph: true,
    includeIssues: true,
    maxTokens: 4096,
  },
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return structuredClone(DEFAULTS)
    const parsed = JSON.parse(raw)
    return {
      ai: { ...DEFAULTS.ai, ...parsed.ai },
    }
  } catch {
    return structuredClone(DEFAULTS)
  }
}

function persist(ai) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ai }))
  } catch {
    /* quota */
  }
}

const initial = load()

export const usePlatformSettingsStore = create((set, get) => ({
  ai: initial.ai,

  patchAi: (patch) => {
    const ai = { ...get().ai, ...patch }
    persist(ai)
    set({ ai })
  },
}))

export function saveAiSettings(ai, pushToast) {
  usePlatformSettingsStore.getState().patchAi(ai)
  pushToast?.({ title: 'AI settings saved' })
}