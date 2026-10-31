export const ASSISTANT_SUGGESTIONS = [
  { id: 'explain', label: 'Explain a function', prompt: 'Explain what createOrder does' },
  { id: 'deps', label: 'Discover dependencies', prompt: 'What depends on reserveStock?' },
  { id: 'tests', label: 'Generate test scenarios', prompt: 'Generate test scenarios for createOrder' },
  { id: 'mock', label: 'Suggest a mock response', prompt: 'Suggest a mock response for POST /api/orders' },
  { id: 'workflow', label: 'Propose a workflow change', prompt: 'Add rate limiting before authentication' },
]

export const ASSISTANT_CONTEXTS = [
  { id: 'createOrder', label: 'Function: createOrder' },
  { id: 'orders-flow', label: 'Workflow: Create Order flow' },
  { id: 'mock-orders', label: 'Mock: orders-mock' },
]

export const ASSISTANT_REPLIES = {
  explain: {
    text: 'createOrder is the controller behind POST /api/orders. It validates the payload, reserves stock for each SKU, charges the payment provider, stores the confirmed order and publishes order.confirmed. It returns 201 on success, 422 on invalid input and 500 if any downstream call fails.',
  },
  deps: {
    text: 'reserveStock is called by createOrder inside the order flow. Its only downstream dependency is the inventory database table. cancelOrder calls releaseStock to undo the reservation, so changes to reserveStock affect both create and cancel paths.',
  },
  tests: {
    text: 'Suggested scenarios for createOrder:',
    list: [
      'Valid cart with three SKUs returns 201 and a confirmed order',
      'Empty items array returns 422 with an items error',
      'Unsupported currency (JPY) returns 422',
      'Insufficient stock on one SKU returns 409 and releases earlier reservations',
      'Payment timeout is retried twice before returning 500',
    ],
  },
  mock: {
    text: 'A realistic mock for POST /api/orders returns 201 with the order id, status and total. I suggest a 10 percent 409 error injection to exercise the conflict path.',
    mockPatch: {
      endpointPath: '/api/orders',
      method: 'POST',
      response: '{\n  "id": "ord_mock_0001",\n  "status": "confirmed",\n  "total": 84.5,\n  "currency": "USD"\n}',
    },
  },
  workflow: {
    text: 'I can insert a rate limiter between the endpoint and authentication. Review the preview below before applying it.',
    proposal: {
      id: 'prop-rate-limit',
      title: 'Insert rate limiter before authentication',
      summary: 'Adds a Rate limiter middleware node between POST /api/orders and authenticate (100 requests per minute per user).',
      removeEdgeIds: ['e1-2'],
      addNodes: [
        {
          id: 'n13',
          type: 'preflightNode',
          position: { x: 130, y: 360 },
          data: {
            kind: 'middleware',
            label: 'rateLimit',
            subtitle: 'Proposed middleware',
            file: 'src/middleware/rateLimit.middleware.js',
            line: 1,
            description: '100 requests per minute per user, returns 429 when exceeded.',
            durationMs: 1,
            timeoutMs: 0,
            retries: 0,
          },
        },
      ],
      addEdges: [
        { id: 'e1-13', source: 'n1', target: 'n13', type: 'smoothstep' },
        { id: 'e13-2', source: 'n13', target: 'n2', type: 'smoothstep' },
      ],
    },
  },
  fallback: {
    text: 'I can explain functions, map dependencies, generate test scenarios, suggest mock responses and propose workflow changes. Pick a suggestion or ask about a function such as createOrder or reserveStock.',
  },
}

export const ASSISTANT_INTENTS = [
  { match: /explain/i, reply: 'explain' },
  { match: /depend|reserveStock|calls|who uses/i, reply: 'deps' },
  { match: /test|scenario/i, reply: 'tests' },
  { match: /mock|response/i, reply: 'mock' },
  { match: /workflow|rate|add|insert|change|propose/i, reply: 'workflow' },
]
