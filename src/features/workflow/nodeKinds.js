import { Boxes, Braces, Cloud, Database, FlaskConical, GitFork, Globe, Network, Shield, Zap } from 'lucide-react'

export const KIND_META = {
  endpoint: { label: 'Endpoint', icon: Globe, accent: '#4A90E2' },
  controller: { label: 'Controller', icon: Network, accent: '#2D65A8' },
  middleware: { label: 'Middleware', icon: Shield, accent: '#B54708' },
  function: { label: 'Function', icon: Braces, accent: '#5B6676' },
  service: { label: 'Service', icon: Boxes, accent: '#17703D' },
  database: { label: 'Database', icon: Database, accent: '#0E7490' },
  external: { label: 'External API', icon: Cloud, accent: '#C2410C' },
  event: { label: 'Event', icon: Zap, accent: '#A16207' },
  condition: { label: 'Condition', icon: GitFork, accent: '#1B2430' },
  mock: { label: 'Mock response', icon: FlaskConical, accent: '#6B7587' },
}

// Items offered in the palette; `defaults` seeds new nodes of that kind.
export const PALETTE_ITEMS = [
  { kind: 'endpoint', defaults: { label: 'GET /api/new', method: 'GET', path: '/api/new', subtitle: 'HTTP route' } },
  { kind: 'controller', defaults: { label: 'newController', subtitle: 'Controller' } },
  { kind: 'middleware', defaults: { label: 'newMiddleware', subtitle: 'Middleware' } },
  { kind: 'function', defaults: { label: 'newFunction', subtitle: 'Function' } },
  { kind: 'service', defaults: { label: 'newService', subtitle: 'Service call' } },
  { kind: 'database', defaults: { label: 'newTable', subtitle: 'Database query' } },
  { kind: 'external', defaults: { label: 'External API', subtitle: 'HTTPS call', timeoutMs: 5000, retries: 1 } },
  { kind: 'event', defaults: { label: 'event.name', subtitle: 'Event topic' } },
  { kind: 'condition', defaults: { label: 'Condition?', subtitle: 'Branch' } },
  { kind: 'mock', defaults: { label: '200 OK', subtitle: 'Mock response', mockStatus: 200 } },
]

export const MINIMAP_COLORS = Object.fromEntries(Object.entries(KIND_META).map(([k, v]) => [k, v.accent]))

export const DRAG_KIND_TYPE = 'application/preflight-kind'
