/** Pager — n8n-style hostable event workflows (design / local state until API). */

export const PAGER_TEMPLATES = [
  { id: 'tpl_webhook_sim', label: 'Webhook → simulate event', description: 'Ingress URL fires a domain event into your project APIs.' },
  { id: 'tpl_ai_build', label: 'AI-generated fixture loop', description: 'Agent drafts steps; you publish a temp host.' },
  { id: 'tpl_schedule_fanout', label: 'Schedule fan-out', description: 'Cron triggers parallel HTTP calls with shared payload.' },
]

export const PAGER_NODE_PALETTE = [
  { kind: 'trigger', label: 'Webhook', subtitle: 'Start', defaults: { label: 'POST /pager/in', subtitle: 'Public trigger' } },
  { kind: 'event', label: 'Emit event', subtitle: 'Bus', defaults: { label: 'order.created', subtitle: 'Domain event' } },
  { kind: 'api', label: 'HTTP request', subtitle: 'API', defaults: { label: 'POST /api/clients', subtitle: 'From Explorer' } },
  { kind: 'ai', label: 'AI step', subtitle: 'Agent', defaults: { label: 'Draft payload', subtitle: 'Deepe bot' } },
  { kind: 'transform', label: 'Transform JSON', subtitle: 'Map', defaults: { label: 'Map fields', subtitle: 'JMESPath / jq' } },
  { kind: 'condition', label: 'IF branch', subtitle: 'Branch', defaults: { label: 'status == 200', subtitle: 'Route' } },
  { kind: 'delay', label: 'Wait', subtitle: 'Timing', defaults: { label: 'Wait 3s', subtitle: 'Backoff' } },
  { kind: 'host', label: 'Temp host', subtitle: 'Publish', defaults: { label: 'Expose 24h', subtitle: 'Pager URL' } },
]

export const PAGER_INITIAL_NODES = [
  {
    id: 'pg1',
    type: 'pagerNode',
    position: { x: 40, y: 140 },
    data: { kind: 'trigger', label: 'Webhook entry', subtitle: 'Pager trigger' },
  },
  {
    id: 'pg2',
    type: 'pagerNode',
    position: { x: 280, y: 100 },
    data: { kind: 'ai', label: 'Agent: build scenario', subtitle: 'Deepe bot' },
  },
  {
    id: 'pg3',
    type: 'pagerNode',
    position: { x: 520, y: 140 },
    data: { kind: 'api', label: 'POST /clients', subtitle: 'Discovered API' },
  },
  {
    id: 'pg4',
    type: 'pagerNode',
    position: { x: 760, y: 140 },
    data: { kind: 'host', label: 'Temp host', subtitle: '24h URL' },
  },
]

export const PAGER_INITIAL_EDGES = [
  { id: 'pe1', source: 'pg1', target: 'pg2', type: 'smoothstep', animated: true },
  { id: 'pe2', source: 'pg2', target: 'pg3', type: 'smoothstep' },
  { id: 'pe3', source: 'pg3', target: 'pg4', type: 'smoothstep' },
]
