export const DATA_DESTINATIONS = [
  { id: 'POST /api/orders', label: 'POST /api/orders', environment: 'development' },
  { id: 'POST /api/inventory/sync', label: 'POST /api/inventory/sync', environment: 'development' },
  { id: 'POST /api/orders (mock)', label: 'POST /api/orders (local mock)', environment: 'local' },
]

export const SAMPLE_JSON = `[
  { "sku": "SKU-1021", "name": "Trail runner", "qty": 12, "warehouse": "eu-west-1" },
  { "sku": "SKU-7740", "name": "Rain shell", "qty": 4, "warehouse": "eu-west-1" },
  { "sku": "SKU-3302", "name": "Merino socks", "qty": 60, "warehouse": "us-east-1" }
]`

export const SAMPLE_CSV = `sku,name,qty,warehouse
SKU-1021,Trail runner,12,eu-west-1
SKU-7740,"Rain shell, waterproof",4,eu-west-1
SKU-3302,Merino socks,60,us-east-1`

export const INITIAL_INJECTION_HISTORY = [
  { id: 'j1', startedAt: '2026-10-31T08:02:00Z', destination: 'POST /api/orders', environment: 'development', records: 500, succeeded: 498, failed: 2, status: 'completed' },
  { id: 'j2', startedAt: '2026-10-30T17:40:00Z', destination: 'POST /api/inventory/sync', environment: 'development', records: 120, succeeded: 120, failed: 0, status: 'completed' },
  { id: 'j3', startedAt: '2026-10-30T11:12:00Z', destination: 'POST /api/orders (mock)', environment: 'local', records: 25, succeeded: 10, failed: 15, status: 'failed' },
]
