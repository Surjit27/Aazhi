import { BACKEND_FUNCTIONS, PROJECT_ROOT, lineOf } from './backendSource.js'

const fnSymbol = (name) => BACKEND_FUNCTIONS.find((f) => f.name === name)

function fnNode(id, name, kind, position, extra = {}) {
  const fn = fnSymbol(name)
  return {
    id,
    type: 'preflightNode',
    position,
    data: {
      kind,
      label: name,
      subtitle: fn ? `${PROJECT_ROOT}/${fn.file}` : '',
      file: fn?.file ?? null,
      line: fn ? lineOf(fn.file, fn.signature) : null,
      description: fn?.description ?? '',
      durationMs: 0,
      timeoutMs: 3000,
      retries: 0,
      ...extra,
    },
  }
}

export const INITIAL_WORKFLOW_NODES = [
  {
    id: 'n1',
    type: 'preflightNode',
    position: { x: 0, y: 200 },
    data: {
      kind: 'endpoint',
      label: 'POST /api/orders',
      subtitle: 'orders.routes.js',
      file: 'src/routes/orders.routes.js',
      line: 7,
      method: 'POST',
      path: '/api/orders',
      description: 'Public entry point for placing a new order.',
      durationMs: 1,
      timeoutMs: 10000,
      retries: 0,
    },
  },
  fnNode('n2', 'authenticate', 'middleware', { x: 260, y: 200 }, { durationMs: 4 }),
  fnNode('n3', 'createOrder', 'controller', { x: 520, y: 200 }, { durationMs: 2 }),
  fnNode('n4', 'validateOrder', 'function', { x: 800, y: 40 }, { durationMs: 3 }),
  fnNode('n5', 'reserveStock', 'service', { x: 800, y: 200 }, { durationMs: 42 }),
  {
    id: 'n6',
    type: 'preflightNode',
    position: { x: 1080, y: 200 },
    data: {
      kind: 'condition',
      label: 'Stock reserved?',
      subtitle: 'Branch on reserveStock result',
      file: null,
      line: null,
      description: 'Routes to payment when every SKU was reserved, otherwise returns a conflict.',
      durationMs: 1,
      timeoutMs: 0,
      retries: 0,
    },
  },
  fnNode('n7', 'charge', 'external', { x: 1340, y: 120 }, { durationMs: 812, timeoutMs: 5000, retries: 2 }),
  fnNode('n8', 'insertOrder', 'database', { x: 1600, y: 120 }, { durationMs: 18 }),
  fnNode('n9', 'sendOrderConfirmation', 'service', { x: 1860, y: 120 }, { durationMs: 9 }),
  {
    id: 'n10',
    type: 'preflightNode',
    position: { x: 2120, y: 120 },
    data: {
      kind: 'event',
      label: 'order.confirmed',
      subtitle: 'Event topic',
      file: 'src/events/bus.js',
      line: 1,
      description: 'Published to downstream consumers (email, analytics, fulfilment).',
      durationMs: 2,
      timeoutMs: 0,
      retries: 0,
    },
  },
  {
    id: 'n11',
    type: 'preflightNode',
    position: { x: 2380, y: 120 },
    data: {
      kind: 'mock',
      label: '201 Created',
      subtitle: 'Mock response',
      file: null,
      line: null,
      description: 'Returns the persisted order payload.',
      durationMs: 1,
      timeoutMs: 0,
      retries: 0,
      mockStatus: 201,
    },
  },
  {
    id: 'n12',
    type: 'preflightNode',
    position: { x: 1340, y: 320 },
    data: {
      kind: 'mock',
      label: '409 Insufficient stock',
      subtitle: 'Mock response',
      file: null,
      line: null,
      description: 'Returned when reserveStock throws for any SKU.',
      durationMs: 1,
      timeoutMs: 0,
      retries: 0,
      mockStatus: 409,
    },
  },
]

const edge = (id, source, target, sourceHandle) => ({
  id,
  source,
  target,
  ...(sourceHandle ? { sourceHandle } : {}),
  type: 'smoothstep',
  animated: false,
})

export const INITIAL_WORKFLOW_EDGES = [
  edge('e1-2', 'n1', 'n2'),
  edge('e2-3', 'n2', 'n3'),
  edge('e3-4', 'n3', 'n4'),
  edge('e4-5', 'n4', 'n5'),
  edge('e5-6', 'n5', 'n6'),
  edge('e6-7', 'n6', 'n7', 'true'),
  edge('e6-12', 'n6', 'n12', 'false'),
  edge('e7-8', 'n7', 'n8'),
  edge('e8-9', 'n8', 'n9'),
  edge('e9-10', 'n9', 'n10'),
  edge('e10-11', 'n10', 'n11'),
]

// Success path order used by the runtime trace
export const TRACE_SEQUENCE = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n7', 'n8', 'n9', 'n10', 'n11']

export const TRACE_LOGS = {
  n1: { level: 'info', message: 'Request received: POST /api/orders (content-type application/json)' },
  n2: { level: 'info', message: 'Bearer token verified for user usr_8841' },
  n3: { level: 'info', message: 'createOrder started with 3 line items' },
  n4: { level: 'info', message: 'Payload valid (3 items, USD)' },
  n5: { level: 'info', message: 'Reserved SKU-1021 x2, SKU-7740 x1, SKU-3302 x4' },
  n6: { level: 'info', message: 'All SKUs reserved, continuing to payment' },
  n7: { level: 'warn', message: 'Payment provider responded slowly (812 ms), retry budget 2 remaining' },
  n8: { level: 'info', message: 'Order row inserted with status confirmed' },
  n9: { level: 'info', message: 'Confirmation queued for order ord_51c0' },
  n10: { level: 'info', message: 'Event order.confirmed published' },
  n11: { level: 'info', message: 'Responded 201 Created in 895 ms' },
  n12: { level: 'error', message: 'Insufficient stock for SKU-7740 (requested 4, available 2)' },
}
