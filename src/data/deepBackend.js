/** Mock data for Deep Backend UI — replace with API integration later. */

export const DISCOVERY_STAGES = [
  'Repository indexing',
  'Framework detection',
  'API endpoint discovery',
  'Function and dependency analysis',
  'Database and event discovery',
  'Execution Flow extraction',
  'Architecture graph generation',
]

export const CONNECT_METHODS = [
  { id: 'github', label: 'GitHub repository', description: 'Clone and index a remote repo' },
  { id: 'zip', label: 'Upload backend ZIP', description: 'Analyze an archived codebase' },
  { id: 'local', label: 'Local connection', description: 'Coming soon — attach a running service' },
]

/** Fallback when API is empty or unreachable (dev offline). */
export const MOCK_CONNECTED_BACKENDS = []

export const EXECUTION_FLOWS = [
  { id: 'flow-client-reg', name: 'Client Registration Flow', steps: 8 },
  { id: 'flow-payment', name: 'Payment Processing Flow', steps: 12 },
  { id: 'flow-order', name: 'Order Fulfillment Flow', steps: 10 },
  { id: 'flow-notify', name: 'Notification Flow', steps: 6 },
]

export const ARCH_GRAPH_NODES = [
  { id: 'gw', type: 'deepArchNode', position: { x: 80, y: 120 }, data: { kind: 'service', label: 'API Gateway', file: 'cmd/server/main.go' } },
  { id: 'auth', type: 'deepArchNode', position: { x: 320, y: 40 }, data: { kind: 'service', label: 'Auth Service', file: 'internal/auth/service.go' } },
  { id: 'post-login', type: 'deepArchNode', position: { x: 320, y: 200 }, data: { kind: 'endpoint', label: 'POST /login', method: 'POST', path: '/api/login' } },
  { id: 'sessions', type: 'deepArchNode', position: { x: 560, y: 120 }, data: { kind: 'database', label: 'sessions', subtitle: 'PostgreSQL' } },
  { id: 'redis', type: 'deepArchNode', position: { x: 560, y: 240 }, data: { kind: 'database', label: 'token_cache', subtitle: 'Redis' } },
  { id: 'sso', type: 'deepArchNode', position: { x: 320, y: 320 }, data: { kind: 'external', label: 'SSO Provider', subtitle: 'OAuth2' } },
]

export const ARCH_GRAPH_EDGES = [
  { id: 'e1', source: 'post-login', target: 'auth', type: 'smoothstep' },
  { id: 'e2', source: 'auth', target: 'sessions', type: 'smoothstep' },
  { id: 'e3', source: 'auth', target: 'redis', type: 'smoothstep' },
  { id: 'e4', source: 'gw', target: 'post-login', type: 'smoothstep' },
  { id: 'e5', source: 'auth', target: 'sso', type: 'smoothstep' },
]

export const TREE_PANEL = {
  services: ['API Gateway', 'Auth Service', 'Token Issuer'],
  apis: ['POST /login', 'POST /refresh', 'GET /me', 'POST /logout'],
  functions: ['ValidateCredentials', 'IssueToken', 'RevokeSession', 'ParseJWT'],
  flows: EXECUTION_FLOWS.map((f) => f.name),
}

export const DEEP_EXECUTIONS = [
  {
    id: 'RUN-1024',
    flowId: 'flow-client-reg',
    flowName: 'Client Registration Flow',
    status: 'success',
    durationMs: 1200,
    startedAt: '2026-11-07T14:02:00Z',
    environment: 'local',
    traceId: 'tr_8f2a9c',
    nodeStates: { n1: 'done', n2: 'done', n3: 'done', n4: 'done' },
  },
  {
    id: 'RUN-1025',
    flowId: 'flow-payment',
    flowName: 'Payment Processing Flow',
    status: 'failed',
    durationMs: 4800,
    startedAt: '2026-11-07T14:05:00Z',
    environment: 'staging',
    traceId: 'tr_1b44de',
    failedNodeId: 'n5',
    nodeStates: { n1: 'done', n2: 'done', n3: 'done', n4: 'done', n5: 'failed', n6: 'skipped' },
  },
  {
    id: 'RUN-1026',
    flowId: 'flow-client-reg',
    flowName: 'Client Registration Flow',
    status: 'running',
    durationMs: null,
    startedAt: '2026-11-07T14:08:00Z',
    environment: 'local',
    traceId: 'tr_9ac011',
    nodeStates: { n1: 'done', n2: 'active', n3: 'pending', n4: 'pending' },
  },
]

export const DEEP_LOGS = [
  { id: 'l1', ts: '14:08:01.204', level: 'info', component: 'Auth Service', executionId: 'RUN-1026', traceId: 'tr_9ac011', message: 'POST /clients accepted' },
  { id: 'l2', ts: '14:08:01.892', level: 'debug', component: 'ValidateClient', executionId: 'RUN-1026', traceId: 'tr_9ac011', message: 'Schema validation passed' },
  { id: 'l3', ts: '14:05:04.102', level: 'error', component: 'ChargeCard', executionId: 'RUN-1025', traceId: 'tr_1b44de', message: 'Upstream timeout after 4000ms' },
  { id: 'l4', ts: '14:02:00.445', level: 'info', component: 'CreateClient', executionId: 'RUN-1024', traceId: 'tr_8f2a9c', message: 'Client record persisted' },
]

export const FLOW_STUDIO_INITIAL_NODES = [
  { id: 'n1', type: 'deepFlowNode', position: { x: 0, y: 120 }, data: { kind: 'event', label: 'Client registration event', subtitle: 'Trigger' } },
  { id: 'n2', type: 'deepFlowNode', position: { x: 240, y: 120 }, data: { kind: 'api', label: 'POST /clients', subtitle: 'Create Client' } },
  { id: 'n3', type: 'deepFlowNode', position: { x: 480, y: 120 }, data: { kind: 'function', label: 'ValidateClient', subtitle: 'Backend function' } },
  { id: 'n4', type: 'deepFlowNode', position: { x: 720, y: 40 }, data: { kind: 'event', label: 'client.created', subtitle: 'Publish event' } },
  { id: 'n5', type: 'deepFlowNode', position: { x: 720, y: 200 }, data: { kind: 'mock', label: 'Retry / log', subtitle: 'Failure branch' } },
]

export const FLOW_STUDIO_INITIAL_EDGES = [
  { id: 'fe1', source: 'n1', target: 'n2', type: 'smoothstep' },
  { id: 'fe2', source: 'n2', target: 'n3', type: 'smoothstep' },
  { id: 'fe3', source: 'n3', target: 'n4', type: 'smoothstep', label: 'Success' },
  { id: 'fe4', source: 'n3', target: 'n5', type: 'smoothstep', label: 'Failure' },
]

export const FLOW_PALETTE = [
  { kind: 'api', label: 'API', defaults: { label: 'GET /resource', subtitle: 'HTTP endpoint' } },
  { kind: 'function', label: 'Backend function', defaults: { label: 'handlerFn', subtitle: 'Function' } },
  { kind: 'event', label: 'Event trigger', defaults: { label: 'domain.event', subtitle: 'Event' } },
  { kind: 'data', label: 'Data generator', defaults: { label: 'Synthetic rows', subtitle: 'Data' } },
  { kind: 'scheduler', label: 'Scheduler', defaults: { label: '0 */5 * * *', subtitle: 'Cron' } },
  { kind: 'condition', label: 'Condition', defaults: { label: 'If status == 200', subtitle: 'Branch' } },
  { kind: 'delay', label: 'Delay', defaults: { label: 'Wait 2s', subtitle: 'Delay' } },
  { kind: 'mock', label: 'Mock service', defaults: { label: 'Mock 200', subtitle: 'Mock' } },
  { kind: 'assertion', label: 'Assertion', defaults: { label: 'Assert body.id', subtitle: 'Validation' } },
  { kind: 'log', label: 'Log query', defaults: { label: 'level:error', subtitle: 'Logs' } },
]

export const MOCK_PROJECTS = [
  { id: 'p1', name: 'Platform onboarding', backends: 2, flows: 4, updatedAt: '2026-11-06' },
  { id: 'p2', name: 'Payments hardening', backends: 1, flows: 3, updatedAt: '2026-11-04' },
]
