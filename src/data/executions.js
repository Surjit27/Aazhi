export const NOW_ISO = '2026-10-31T10:00:00Z'
const NOW = Date.parse(NOW_ISO)
export const NOW_MS = NOW

const SPAN_TEMPLATE = [
  { name: 'authenticate', kind: 'middleware', offset: 0, duration: 4 },
  { name: 'createOrder', kind: 'controller', offset: 4, duration: 2 },
  { name: 'validateOrder', kind: 'function', offset: 6, duration: 3 },
  { name: 'reserveStock', kind: 'service', offset: 9, duration: 42 },
  { name: 'charge', kind: 'external', offset: 51, duration: 812 },
  { name: 'insertOrder', kind: 'database', offset: 863, duration: 18 },
  { name: 'sendOrderConfirmation', kind: 'service', offset: 881, duration: 9 },
]

const ROUTES = [
  { method: 'POST', path: '/api/orders', source: 'live' },
  { method: 'GET', path: '/api/orders', source: 'live' },
  { method: 'GET', path: '/api/orders/:id', source: 'live' },
  { method: 'POST', path: '/api/orders/:id/cancel', source: 'scheduler' },
  { method: 'POST', path: '/api/inventory/sync', source: 'scheduler' },
  { method: 'POST', path: '/api/orders', source: 'injection' },
]

function buildExecution(i) {
  const route = ROUTES[i % ROUTES.length]
  const failed = i % 7 === 3 || i % 11 === 5
  const serverError = failed && i % 2 === 0
  const statusCode = failed ? (serverError ? 500 : 409) : route.method === 'POST' ? 201 : 200
  const durationScale = 0.7 + ((i * 37) % 60) / 50
  const duration = Math.round(900 * durationScale)
  const minutesAgo = i * 47 + 3
  const startedAt = new Date(NOW - minutesAgo * 60000).toISOString()

  const spans = SPAN_TEMPLATE.filter((s) => route.method === 'POST' || s.kind !== 'external').map((s) => ({
    ...s,
    status: failed && s.name === 'reserveStock' ? 'error' : 'ok',
  }))

  const stack = failed
    ? serverError
      ? 'Error: Connection reset by peer\n    at PaymentClient.request (src/services/payment.service.js:14:11)\n    at charge (src/services/payment.service.js:6:10)\n    at createOrder (src/controllers/orders.controller.js:21:38)'
      : 'Error: Insufficient stock for SKU-7740\n    at reserveStock (src/services/inventory.service.js:6:11)\n    at createOrder (src/controllers/orders.controller.js:16:34)'
    : null

  return {
    id: `exe_${String(1200 + i)}`,
    startedAt,
    method: route.method,
    path: route.path,
    source: route.source,
    statusCode,
    durationMs: failed ? Math.round(duration * 0.4) : duration,
    status: failed ? 'failed' : 'success',
    environment: i % 4 === 0 ? 'staging' : 'development',
    spans: failed && serverError ? spans.slice(0, 5).map((s, idx) => (idx === 4 ? { ...s, status: 'error' } : s)) : spans,
    requestBody: route.method === 'POST' ? { items: [{ sku: 'SKU-1021', qty: 2 }], total: 84.5, currency: 'USD' } : null,
    responseBody: failed
      ? { error: serverError ? 'Internal server error' : 'Insufficient stock for SKU-7740' }
      : { id: `ord_${(51000 + i).toString(16)}`, status: 'confirmed', total: 84.5 },
    stack,
  }
}

export const EXECUTIONS = Array.from({ length: 42 }, (_, i) => buildExecution(i))

export function buildHourlySeries(executions, hours = 12) {
  const buckets = Array.from({ length: hours }, (_, idx) => {
    const hourStart = NOW - (hours - idx) * 3600000
    return { label: new Date(hourStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), success: 0, failed: 0 }
  })
  executions.forEach((e) => {
    const ts = Date.parse(e.startedAt)
    const idx = hours - Math.ceil((NOW - ts) / 3600000)
    if (idx >= 0 && idx < hours) {
      buckets[idx][e.status === 'failed' ? 'failed' : 'success'] += 1
    }
  })
  return buckets
}

export const EXECUTION_SOURCES = ['live', 'scheduler', 'injection']
