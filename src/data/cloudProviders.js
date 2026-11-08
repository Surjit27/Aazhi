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
