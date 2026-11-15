/** Demo multi-repo index — replace with `/api/code-map/analyze` response. */

/** @type {import('./types.js').CodeMapNode[]} */
export const MOCK_CODE_MAP_ROOTS = [
  {
    id: 'repo-orders',
    kind: 'repo',
    name: 'orders-service',
    path: 'acme/orders-service',
    loc: 4200,
    children: [
      {
        id: 'dir-src',
        kind: 'dir',
        name: 'src',
        path: 'src',
        loc: 3800,
        children: [
          {
            id: 'file-routes',
            kind: 'file',
            name: 'routes.js',
            path: 'src/routes/index.js',
            loc: 320,
            children: [
              {
                id: 'fn-mountRoutes',
                kind: 'function',
                name: 'mountRoutes',
                scope: 'module',
                signature: '(app) => void',
                loc: 48,
                uses: ['fn-createOrder', 'const-ORDER_STATUSES'],
                usedBy: ['file-server'],
              },
            ],
          },
          {
            id: 'file-orders-svc',
            kind: 'file',
            name: 'orders.service.js',
            path: 'src/services/orders.service.js',
            loc: 210,
            children: [
              {
                id: 'fn-createOrder',
                kind: 'function',
                name: 'createOrder',
                scope: 'module',
                signature: '(payload) => Promise<Order>',
                loc: 62,
                uses: ['const-ORDER_STATUSES', 'fn-saveOrder'],
                usedBy: ['fn-mountRoutes'],
              },
              {
                id: 'const-ORDER_STATUSES',
                kind: 'const',
                name: 'ORDER_STATUSES',
                scope: 'module',
                loc: 4,
                uses: [],
                usedBy: ['fn-createOrder', 'fn-mountRoutes'],
              },
            ],
          },
          {
            id: 'file-server',
            kind: 'file',
            name: 'server.js',
            path: 'src/server.js',
            loc: 85,
            children: [
              {
                id: 'fn-main',
                kind: 'function',
                name: 'bootstrap',
                scope: 'module',
                loc: 40,
                uses: ['fn-mountRoutes'],
                usedBy: [],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'repo-auth',
    kind: 'repo',
    name: 'auth-gateway',
    path: 'platform/auth-gateway',
    loc: 2800,
    children: [
      {
        id: 'dir-auth-src',
        kind: 'dir',
        name: 'src',
        path: 'src',
        loc: 2600,
        children: [
          {
            id: 'file-auth-mw',
            kind: 'file',
            name: 'auth.middleware.js',
            path: 'src/middleware/auth.middleware.js',
            loc: 120,
            children: [
              {
                id: 'fn-verifyToken',
                kind: 'function',
                name: 'verifyToken',
                scope: 'module',
                loc: 35,
                uses: ['const-JWT_ISSUER'],
                usedBy: ['fn-mountRoutes'],
              },
              {
                id: 'const-JWT_ISSUER',
                kind: 'let',
                name: 'JWT_ISSUER',
                scope: 'block',
                loc: 1,
                uses: [],
                usedBy: ['fn-verifyToken'],
              },
            ],
          },
        ],
      },
    ],
  },
]
