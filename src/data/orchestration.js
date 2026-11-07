/** Orchestration & data-simulation UI — wired to APIs later. */

export const CLOUD_PROVIDERS = [
  {
    id: 'aws',
    label: 'Amazon Web Services',
    shortLabel: 'AWS',
    schedulerService: 'Amazon EventBridge',
    computeOptions: ['Lambda', 'ECS Fargate', 'Step Functions'],
    deployHint: 'IAM role + optional access keys; EventBridge invokes your flow worker.',
  },
  {
    id: 'gcp',
    label: 'Google Cloud',
    shortLabel: 'GCP',
    schedulerService: 'Cloud Scheduler',
    computeOptions: ['Cloud Run', 'Cloud Functions', 'Workflows'],
    deployHint: 'Service account JSON + project id; Scheduler publishes to Pub/Sub or HTTPS.',
  },
  {
    id: 'azure',
    label: 'Microsoft Azure',
    shortLabel: 'Azure',
    schedulerService: 'Azure Logic Apps / Functions',
    computeOptions: ['Azure Functions', 'Container Apps', 'Logic Apps'],
    deployHint: 'App registration + subscription; Timer trigger or Event Grid for runs.',
  },
]

export const ORCHESTRATION_STEP_KINDS = [
  { id: 'ingest', label: 'Ingest data', description: 'Load fixtures, DB snapshot, or API sample' },
  { id: 'transform', label: 'Transform', description: 'Map / enrich / anonymize' },
  { id: 'simulate', label: 'Simulate event', description: 'Publish domain event or webhook' },
  { id: 'call_api', label: 'Call API', description: 'HTTP step against discovered endpoint' },
  { id: 'assert', label: 'Assert', description: 'Validate response or side effect' },
  { id: 'deploy', label: 'Deploy slice', description: 'Push artifact to cloud target (future)' },
]

export const SIMULATION_PRESETS = [
  { id: 'load-spike', label: 'Load spike', description: 'Burst traffic against one API' },
  { id: 'fixture-replay', label: 'Fixture replay', description: 'Replay captured payloads on schedule' },
  { id: 'chaos-delay', label: 'Chaos delay', description: 'Inject latency between steps' },
  { id: 'full-journey', label: 'Full journey', description: 'Multi-step user registration style flow' },
]

export const MOCK_ORCHESTRATION_PIPELINES = [
  {
    id: 'pipe_demo',
    projectId: null,
    name: 'Nightly data refresh (demo)',
    preset: 'fixture-replay',
    cloudProviderId: 'aws',
    cloudProfileId: null,
    notepad: '# Ad-hoc notes\n# curl examples, SQL, or agent prompts live here',
    steps: [
      { id: 'st1', kind: 'ingest', label: 'Pull staging fixtures', config: { source: 's3://fixtures/orders' } },
      { id: 'st2', kind: 'transform', label: 'Scrub PII', config: { rules: 'email, phone' } },
      { id: 'st3', kind: 'simulate', label: 'Emit order.created', config: { topic: 'orders' } },
    ],
    schedule: { cron: '0 2 * * *', timezone: 'UTC', enabled: false },
    lastRunStatus: 'never',
    updatedAt: '2026-11-07T12:00:00Z',
  },
]
