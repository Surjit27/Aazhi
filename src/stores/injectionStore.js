import { create } from 'zustand'
import { DATA_DESTINATIONS, INITIAL_INJECTION_HISTORY, SAMPLE_CSV, SAMPLE_JSON } from '../data/injection.js'
import { parseImport } from '../utils/csv.js'
import { uid } from '../utils/format.js'
import { pushInjectionRecords } from '../services/mockBackend.js'

const SAMPLES = { json: SAMPLE_JSON, csv: SAMPLE_CSV }

export const useInjectionStore = create((set, get) => ({
  format: 'json',
  sourceText: SAMPLE_JSON,
  parsed: parseImport(SAMPLE_JSON, 'json'),
  destination: DATA_DESTINATIONS[0].id,
  batchSize: 50,
  concurrency: 2,
  history: INITIAL_INJECTION_HISTORY,
  job: null,

  setFormat: (format) => {
    const sourceText = SAMPLES[format]
    set({ format, sourceText, parsed: parseImport(sourceText, format) })
  },

  setSourceText: (sourceText) => set((s) => ({ sourceText, parsed: parseImport(sourceText, s.format) })),

  setConfig: (patch) => set(patch),

  startJob: () => {
    const { parsed, destination, batchSize, concurrency, job } = get()
    if (job?.status === 'running' || !parsed.ok) return

    const dest = DATA_DESTINATIONS.find((d) => d.id === destination)
    const id = uid('job')
    const total = parsed.records.length
    const startedAt = new Date().toISOString()
    set({
      job: { id, status: 'running', done: 0, total, succeeded: 0, failed: 0, error: null },
      history: [
        { id, startedAt, destination: dest.label, environment: dest.environment, records: total, succeeded: 0, failed: 0, status: 'running' },
        ...get().history,
      ],
    })

    pushInjectionRecords({
      records: parsed.records,
      destination,
      batchSize,
      concurrency,
      onProgress: (progress) =>
        set((s) => ({
          job: s.job?.id === id ? { ...s.job, ...progress } : s.job,
          history: s.history.map((h) => (h.id === id ? { ...h, succeeded: progress.succeeded, failed: progress.failed } : h)),
        })),
    }).then(
      (result) =>
        set((s) => ({
          job: s.job?.id === id ? { ...s.job, ...result, status: 'completed' } : s.job,
          history: s.history.map((h) => (h.id === id ? { ...h, ...result, status: result.failed > 0 && result.succeeded === 0 ? 'failed' : 'completed' } : h)),
        })),
      (err) =>
        set((s) => ({
          job: s.job?.id === id ? { ...s.job, status: 'failed', error: err.message } : s.job,
          history: s.history.map((h) => (h.id === id ? { ...h, status: 'failed' } : h)),
        })),
    )
  },

  clearJob: () => set({ job: null }),
}))
