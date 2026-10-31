export const GIT_REPOSITORIES = [
  { id: 'repo-orders', name: 'acme/orders-service', defaultBranch: 'main' },
  { id: 'repo-payments', name: 'acme/payments-api', defaultBranch: 'main' },
]

export const GIT_BRANCHES = [
  { id: 'main', name: 'main', ahead: 0, behind: 0, current: false },
  { id: 'feature/refund-flow', name: 'feature/refund-flow', ahead: 3, behind: 1, current: true },
  { id: 'fix/stock-race', name: 'fix/stock-race', ahead: 1, behind: 4, current: false },
]

export const GIT_COMMITS = [
  { id: 'a91c3e2', message: 'Release stock on cancelled orders', author: 'Maya Chen', time: '2026-10-31T08:20:00Z', branch: 'feature/refund-flow' },
  { id: 'f04b7d1', message: 'Add stripe refund wrapper', author: 'Maya Chen', time: '2026-10-30T16:05:00Z', branch: 'feature/refund-flow' },
  { id: '3c9e8aa', message: 'Validate supported currencies on order create', author: 'Arjun Patel', time: '2026-10-30T11:42:00Z', branch: 'feature/refund-flow' },
  { id: 'b72d0f9', message: 'Fix race in reserveStock under load', author: 'Lena Brooks', time: '2026-10-29T14:18:00Z', branch: 'main' },
  { id: '61e5a4c', message: 'Bump express to 4.21.2', author: 'Dependabot', time: '2026-10-28T09:00:00Z', branch: 'main' },
]

export const GIT_CHANGED_FILES = [
  { path: 'src/controllers/orders.controller.js', status: 'M', additions: 14, deletions: 3 },
  { path: 'src/middleware/auth.middleware.js', status: 'M', additions: 6, deletions: 2 },
  { path: 'src/services/payment.service.js', status: 'M', additions: 22, deletions: 0 },
  { path: 'src/utils/validate.js', status: 'A', additions: 11, deletions: 0 },
]

export const GIT_MODIFIED_FUNCTIONS = [
  { name: 'createOrder', file: 'src/controllers/orders.controller.js', change: 'Added currency validation before charge', risk: 'high' },
  { name: 'cancelOrder', file: 'src/controllers/orders.controller.js', change: 'Calls releaseStock before updating status', risk: 'medium' },
  { name: 'authenticate', file: 'src/middleware/auth.middleware.js', change: 'Token extraction now trims whitespace', risk: 'low' },
  { name: 'charge', file: 'src/services/payment.service.js', change: 'New amount rounding for JPY-like currencies', risk: 'medium' },
  { name: 'validateOrder', file: 'src/utils/validate.js', change: 'New function', risk: 'low' },
]

export const GRAPH_COMPARISON = {
  base: { label: 'main', nodes: 11, edges: 9, endpoints: 4, externalCalls: 1 },
  head: { label: 'feature/refund-flow', nodes: 13, edges: 12, endpoints: 4, externalCalls: 2 },
  changes: [
    { type: 'added', label: 'validateOrder (function)' },
    { type: 'added', label: 'refund (external Stripe call)' },
    { type: 'changed', label: 'createOrder (new branch on currency)' },
  ],
}

export const REGRESSION_SUGGESTIONS = [
  { id: 'rt1', title: 'Create order rejects unsupported currency', reason: 'validateOrder added in this branch', priority: 'high' },
  { id: 'rt2', title: 'Cancel order releases reserved stock', reason: 'cancelOrder call order changed', priority: 'high' },
  { id: 'rt3', title: 'Charge rounds JPY amounts to whole units', reason: 'charge rounding logic modified', priority: 'medium' },
  { id: 'rt4', title: 'Protected routes return 401 without a token', reason: 'authenticate token parsing changed', priority: 'low' },
]
