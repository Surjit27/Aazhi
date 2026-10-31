export const PROJECTS = [
  { id: 'orders', name: 'orders-service', description: 'Checkout, inventory and payments' },
  { id: 'payments', name: 'payments-api', description: 'Card vault and payouts' },
  { id: 'auth', name: 'auth-gateway', description: 'Sessions and SSO' },
]

export const ENVIRONMENTS = [
  { id: 'local', label: 'Local', baseUrl: 'http://localhost:4000', healthy: true, latencyMs: 12 },
  { id: 'development', label: 'Development', baseUrl: 'https://dev.orders.internal', healthy: true, latencyMs: 96 },
  { id: 'staging', label: 'Staging', baseUrl: 'https://staging.orders.internal', healthy: false, latencyMs: 412 },
]

export const INITIAL_NOTIFICATIONS = [
  { id: 'nt1', tone: 'danger', title: 'Scheduled job failed', body: 'nightly-reconciliation returned 500 on staging', time: '2026-10-31T08:42:00Z', read: false },
  { id: 'nt2', tone: 'success', title: 'Mock server started', body: 'orders-mock on :4010 is accepting requests', time: '2026-10-31T07:15:00Z', read: false },
  { id: 'nt3', tone: 'warning', title: 'Regression risk detected', body: 'createOrder changed since main; 2 tests suggested', time: '2026-10-30T18:03:00Z', read: true },
]

export const RECENT_ACTIVITY = [
  { id: 'a1', actor: 'You', action: 'modified the workflow', target: 'Create Order flow', time: '2026-10-31T09:10:00Z' },
  { id: 'a2', actor: 'Scheduler', action: 'ran', target: 'inventory-sync', time: '2026-10-31T08:45:00Z' },
  { id: 'a3', actor: 'Data Injection', action: 'pushed 500 records to', target: 'POST /api/orders (dev)', time: '2026-10-31T08:02:00Z' },
  { id: 'a4', actor: 'Mock Servers', action: 'updated latency on', target: 'GET /api/orders/:id', time: '2026-10-31T07:30:00Z' },
  { id: 'a5', actor: 'Git', action: 'detected changes on', target: 'feature/refund-flow', time: '2026-10-30T17:20:00Z' },
]
