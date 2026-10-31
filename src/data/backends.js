/** Configured backends shown in the registry table (UI prototype). */
export const GIT_PROVIDERS = [
  { id: 'github', label: 'GitHub' },
  { id: 'gitlab', label: 'GitLab' },
  { id: 'bitbucket', label: 'Bitbucket' },
]

export const ARCHITECTURES = [
  { id: 'node-express', label: 'Node · Express' },
  { id: 'node-nest', label: 'Node · NestJS' },
  { id: 'java-spring', label: 'Java · Spring Boot' },
  { id: 'go-chi', label: 'Go · chi' },
  { id: 'python-fastapi', label: 'Python · FastAPI' },
]

export const INITIAL_BACKENDS = [
  {
    id: 'orders',
    name: 'orders-service',
    description: 'Checkout, inventory and payments',
    architecture: 'node-express',
    status: 'indexed',
    git: {
      provider: 'github',
      repository: 'acme/orders-service',
      branch: 'main',
      defaultBranch: 'main',
      lastSyncAt: '2026-10-31T08:10:00Z',
      cloneUrl: 'https://github.com/acme/orders-service.git',
    },
    stats: { routes: 5, functions: 14, modules: 8 },
    explorerBranch: 'feature/refund-flow',
    localBaseUrl: 'http://localhost:4000',
  },
  {
    id: 'payments',
    name: 'payments-api',
    description: 'Card vault, charges and payouts',
    architecture: 'node-nest',
    status: 'indexed',
    git: {
      provider: 'bitbucket',
      repository: 'acme/payments-api',
      branch: 'develop',
      defaultBranch: 'main',
      lastSyncAt: '2026-10-30T14:22:00Z',
      cloneUrl: 'https://bitbucket.org/acme/payments-api.git',
    },
    stats: { routes: 4, functions: 9, modules: 5 },
    explorerBranch: 'develop',
    localBaseUrl: 'http://localhost:4001',
  },
  {
    id: 'auth',
    name: 'auth-gateway',
    description: 'Sessions, tokens and SSO',
    architecture: 'go-chi',
    status: 'indexed',
    git: {
      provider: 'gitlab',
      repository: 'platform/auth-gateway',
      branch: 'main',
      defaultBranch: 'main',
      lastSyncAt: '2026-10-29T09:05:00Z',
      cloneUrl: 'https://gitlab.com/platform/auth-gateway.git',
    },
    stats: { routes: 3, functions: 7, modules: 4 },
    explorerBranch: 'main',
    localBaseUrl: 'http://localhost:4002',
  },
]

export function architectureLabel(id) {
  return ARCHITECTURES.find((a) => a.id === id)?.label ?? id
}

export function gitProviderLabel(id) {
  return GIT_PROVIDERS.find((p) => p.id === id)?.label ?? id
}

export function backendBasePath(backendId) {
  return `/backends/${backendId}`
}
