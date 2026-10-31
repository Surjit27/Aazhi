import { ASSISTANT_INTENTS, ASSISTANT_REPLIES } from '../data/assistant.js'
import { uid } from '../utils/format.js'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Integration seam: replace these bodies with real calls to the backend when it is available.

export async function sendTestRequest(endpoint) {
  await delay(endpoint.latencyMs)
  const injected = endpoint.errorInjection.enabled && Math.random() < endpoint.errorInjection.probability
  const status = injected ? endpoint.errorInjection.status : endpoint.status
  return {
    status,
    latencyMs: endpoint.latencyMs,
    body: injected ? { error: 'Injected error for resilience testing' } : safeParse(endpoint.response),
  }
}

function safeParse(text) {
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text }
  }
}

export async function pushInjectionRecords({ records, batchSize, concurrency, onProgress }) {
  const batches = []
  for (let i = 0; i < records.length; i += batchSize) batches.push(records.slice(i, i + batchSize))

  let done = 0
  let succeeded = 0
  let failed = 0
  const report = () => onProgress({ done, total: records.length, succeeded, failed })

  for (let i = 0; i < batches.length; i += concurrency) {
    const wave = batches.slice(i, i + concurrency)
    await Promise.all(
      wave.map(async (batch) => {
        await delay(400 + Math.random() * 400)
        for (let k = 0; k < batch.length; k++) {
          if (Math.random() < 0.02) failed += 1
          else succeeded += 1
          done += 1
        }
        report()
      }),
    )
  }
  return { done, total: records.length, succeeded, failed }
}

export async function runSchedule() {
  await delay(900)
  return Math.random() < 0.85 ? 'success' : 'failed'
}

export async function askAssistant(prompt, contextId) {
  await delay(700)
  const intent = ASSISTANT_INTENTS.find((i) => i.match.test(prompt))
  const reply = ASSISTANT_REPLIES[intent?.reply ?? 'fallback']
  return { id: uid('reply'), contextId, ...reply }
}
