import {
  BACKEND_FUNCTIONS as ORDERS_FUNCTIONS,
  BACKEND_ROUTES as ORDERS_ROUTES,
  GIT_FILE_STATUS as ORDERS_GIT,
  PROJECT_ROOT as ORDERS_ROOT,
  ROUTE_PARAMETERS as ORDERS_PARAMS,
  SOURCE_FILES as ORDERS_FILES,
  lineOf as ordersLineOf,
} from './backendSource.js'

const PAYMENTS_FILES = {
  'src/main.ts': `import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(4001);
}
bootstrap();
`,
  'src/charges/charges.controller.ts': `import { Controller, Post, Body } from '@nestjs/common';
import { ChargesService } from './charges.service';

@Controller('api/charges')
export class ChargesController {
  constructor(private charges: ChargesService) {}

  @Post()
  create(@Body() dto: CreateChargeDto) {
    return this.charges.create(dto);
  }
}
`,
}

const PAYMENTS_FUNCTIONS = [
  {
    name: 'create',
    file: 'src/charges/charges.controller.ts',
    signature: 'create(@Body() dto',
    kind: 'controller',
    description: 'Creates a charge against a stored payment method.',
    params: [{ name: 'dto', type: 'CreateChargeDto', description: 'Amount and customer id' }],
    deps: ['ChargesService'],
  },
]

const PAYMENTS_ROUTES = [
  { method: 'POST', path: '/api/charges', handler: 'create', auth: true, file: 'src/charges/charges.controller.ts' },
  { method: 'GET', path: '/api/health', handler: 'inline', auth: false, file: 'src/main.ts' },
]

const AUTH_FILES = {
  'cmd/gateway/main.go': `package main

func main() {
  r := chi.NewRouter()
  r.Get("/api/health", health)
  r.Post("/api/sessions", createSession)
  http.ListenAndServe(":4002", r)
}
`,
}

const AUTH_FUNCTIONS = [
  {
    name: 'createSession',
    file: 'cmd/gateway/main.go',
    signature: 'func createSession',
    kind: 'controller',
    description: 'Issues a session token after credential validation.',
    params: [{ name: 'credentials', type: 'object', description: 'Email and password' }],
    deps: ['validateCredentials'],
  },
]

const AUTH_ROUTES = [
  { method: 'GET', path: '/api/health', handler: 'health', auth: false, file: 'cmd/gateway/main.go' },
  { method: 'POST', path: '/api/sessions', handler: 'createSession', auth: false, file: 'cmd/gateway/main.go' },
]

function lineOfFactory(sourceFiles) {
  return (file, signature) => {
    const lines = sourceFiles[file]?.split('\n') ?? []
    const idx = lines.findIndex((line) => line.includes(signature))
    return idx === -1 ? 1 : idx + 1
  }
}

const ORDERS_CATALOG = {
  projectRoot: ORDERS_ROOT,
  sourceFiles: ORDERS_FILES,
  backendFunctions: ORDERS_FUNCTIONS,
  backendRoutes: ORDERS_ROUTES,
  routeParameters: ORDERS_PARAMS,
  gitFileStatus: ORDERS_GIT,
  lineOf: ordersLineOf,
}

const PAYMENTS_CATALOG = {
  projectRoot: 'payments-api',
  sourceFiles: PAYMENTS_FILES,
  backendFunctions: PAYMENTS_FUNCTIONS,
  backendRoutes: PAYMENTS_ROUTES,
  routeParameters: [],
  gitFileStatus: { 'src/charges/charges.controller.ts': 'M' },
  lineOf: lineOfFactory(PAYMENTS_FILES),
}

const AUTH_CATALOG = {
  projectRoot: 'auth-gateway',
  sourceFiles: AUTH_FILES,
  backendFunctions: AUTH_FUNCTIONS,
  backendRoutes: AUTH_ROUTES,
  routeParameters: [],
  gitFileStatus: {},
  lineOf: lineOfFactory(AUTH_FILES),
}

const EMPTY_CATALOG = {
  projectRoot: 'new-service',
  sourceFiles: {
    'README.md': '# Connect a repository\n\nPreflight will index routes and functions after the first sync completes.',
  },
  backendFunctions: [],
  backendRoutes: [],
  routeParameters: [],
  gitFileStatus: {},
  lineOf: () => 1,
}

export const BACKEND_CATALOG = {
  orders: ORDERS_CATALOG,
  payments: PAYMENTS_CATALOG,
  auth: AUTH_CATALOG,
}

export function getBackendCatalog(backendId) {
  return BACKEND_CATALOG[backendId] ?? EMPTY_CATALOG
}
