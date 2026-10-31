export const PROJECT_ROOT = 'orders-service'

export const SOURCE_FILES = {
  'src/server.js': `import express from 'express';
import { authenticate } from './middleware/auth.middleware.js';
import { ordersRouter } from './routes/orders.routes.js';

const app = express();
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/orders', authenticate, ordersRouter);

app.use((err, req, res, next) => {
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
`,
  'src/routes/orders.routes.js': `import { Router } from 'express';
import * as orders from '../controllers/orders.controller.js';

export const ordersRouter = Router();

ordersRouter.get('/', orders.listOrders);
ordersRouter.post('/', orders.createOrder);
ordersRouter.get('/:id', orders.getOrder);
ordersRouter.post('/:id/cancel', orders.cancelOrder);
`,
  'src/controllers/orders.controller.js': `import { validateOrder } from '../utils/validate.js';
import * as ordersRepository from '../db/orders.repository.js';
import * as inventoryService from '../services/inventory.service.js';
import * as paymentService from '../services/payment.service.js';
import { sendOrderConfirmation } from '../services/notification.service.js';

export async function listOrders(req, res) {
  const orders = await ordersRepository.findOrders({ userId: req.user.id, status: req.query.status });
  res.json({ data: orders });
}

export async function getOrder(req, res) {
  const order = await ordersRepository.findOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
}

export async function createOrder(req, res) {
  const errors = validateOrder(req.body);
  if (errors.length) return res.status(422).json({ errors });

  await inventoryService.reserveStock(req.body.items);
  const payment = await paymentService.charge({ amount: req.body.total, currency: req.body.currency, userId: req.user.id });
  const order = await ordersRepository.insertOrder({ ...req.body, userId: req.user.id, paymentId: payment.id, status: 'confirmed' });
  await sendOrderConfirmation(order);
  res.status(201).json(order);
}

export async function cancelOrder(req, res) {
  const order = await ordersRepository.findOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  await paymentService.refund(order.paymentId);
  await inventoryService.releaseStock(order.items);
  const updated = await ordersRepository.updateOrder(order.id, { status: 'cancelled' });
  res.json(updated);
}
`,
  'src/middleware/auth.middleware.js': `import jwt from 'jsonwebtoken';

export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}

export function authenticate(req, res, next) {
  const header = req.headers.authorization ?? '';
  const token = header.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
`,
  'src/utils/validate.js': `export function validateOrder(body) {
  const errors = [];
  if (!Array.isArray(body.items) || body.items.length === 0) errors.push('items must be a non-empty array');
  if (typeof body.total !== 'number' || body.total <= 0) errors.push('total must be a positive number');
  if (!['USD', 'EUR', 'GBP'].includes(body.currency)) errors.push('currency is not supported');
  return errors;
}
`,
  'src/services/inventory.service.js': `import { db } from '../db/client.js';

export async function reserveStock(items) {
  for (const item of items) {
    const result = await db.query('UPDATE inventory SET reserved = reserved + $1 WHERE sku = $2 AND stock >= $1', [item.qty, item.sku]);
    if (result.rowCount === 0) throw new Error('Insufficient stock for ' + item.sku);
  }
}

export async function releaseStock(items) {
  for (const item of items) {
    await db.query('UPDATE inventory SET reserved = reserved - $1 WHERE sku = $2', [item.qty, item.sku]);
  }
}
`,
  'src/services/payment.service.js': `import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_KEY);

export async function charge({ amount, currency, userId }) {
  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency: currency.toLowerCase(),
    metadata: { userId },
    confirm: true,
  });
}

export async function refund(paymentId) {
  return stripe.refunds.create({ payment_intent: paymentId });
}
`,
  'src/services/notification.service.js': `import { eventBus } from '../events/bus.js';

export async function sendOrderConfirmation(order) {
  await eventBus.publish('order.confirmed', { orderId: order.id, userId: order.userId });
}
`,
  'src/db/orders.repository.js': `import { db } from './client.js';

export async function insertOrder(order) {
  const { rows } = await db.query(
    'INSERT INTO orders (user_id, items, total, currency, payment_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [order.userId, JSON.stringify(order.items), order.total, order.currency, order.paymentId, order.status],
  );
  return rows[0];
}

export async function findOrderById(id) {
  const { rows } = await db.query('SELECT * FROM orders WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function findOrders({ userId, status }) {
  const { rows } = await db.query('SELECT * FROM orders WHERE user_id = $1 AND ($2::text IS NULL OR status = $2)', [userId, status ?? null]);
  return rows;
}

export async function updateOrder(id, patch) {
  const { rows } = await db.query('UPDATE orders SET status = $2 WHERE id = $1 RETURNING *', [id, patch.status]);
  return rows[0];
}
`,
}

// Each function is located by a unique signature string inside its file; line numbers are derived from the source.
export const BACKEND_FUNCTIONS = [
  {
    name: 'listOrders',
    file: 'src/controllers/orders.controller.js',
    signature: 'export async function listOrders',
    kind: 'controller',
    description: 'Returns the authenticated user\'s orders, optionally filtered by status.',
    params: [
      { name: 'req', type: 'Request', description: 'Express request; reads req.user and req.query.status' },
      { name: 'res', type: 'Response', description: 'Express response' },
    ],
    deps: ['findOrders'],
  },
  {
    name: 'getOrder',
    file: 'src/controllers/orders.controller.js',
    signature: 'export async function getOrder',
    kind: 'controller',
    description: 'Fetches a single order by its id.',
    params: [
      { name: 'req', type: 'Request', description: 'Reads req.params.id' },
      { name: 'res', type: 'Response', description: 'Express response' },
    ],
    deps: ['findOrderById'],
  },
  {
    name: 'createOrder',
    file: 'src/controllers/orders.controller.js',
    signature: 'export async function createOrder',
    kind: 'controller',
    description: 'Validates the cart, reserves stock, charges the payment provider and stores the confirmed order.',
    params: [
      { name: 'req', type: 'Request', description: 'Body: { items, total, currency }' },
      { name: 'res', type: 'Response', description: 'Returns 201 with the created order' },
    ],
    deps: ['validateOrder', 'reserveStock', 'charge', 'insertOrder', 'sendOrderConfirmation'],
  },
  {
    name: 'cancelOrder',
    file: 'src/controllers/orders.controller.js',
    signature: 'export async function cancelOrder',
    kind: 'controller',
    description: 'Refunds the payment, releases reserved stock and marks the order as cancelled.',
    params: [
      { name: 'req', type: 'Request', description: 'Reads req.params.id' },
      { name: 'res', type: 'Response', description: 'Express response' },
    ],
    deps: ['findOrderById', 'refund', 'releaseStock', 'updateOrder'],
  },
  {
    name: 'validateOrder',
    file: 'src/utils/validate.js',
    signature: 'export function validateOrder',
    kind: 'utility',
    description: 'Returns a list of validation messages for an incoming order payload.',
    params: [{ name: 'body', type: 'object', description: 'items, total and currency fields' }],
    deps: [],
  },
  {
    name: 'authenticate',
    file: 'src/middleware/auth.middleware.js',
    signature: 'export function authenticate',
    kind: 'middleware',
    description: 'Rejects requests without a valid bearer token and attaches req.user.',
    params: [
      { name: 'req', type: 'Request', description: 'Reads the Authorization header' },
      { name: 'res', type: 'Response', description: 'Returns 401 on failure' },
      { name: 'next', type: 'Function', description: 'Continues the middleware chain' },
    ],
    deps: ['verifyToken'],
  },
  {
    name: 'verifyToken',
    file: 'src/middleware/auth.middleware.js',
    signature: 'export function verifyToken',
    kind: 'utility',
    description: 'Verifies a JWT signature against the configured secret.',
    params: [{ name: 'token', type: 'string', description: 'Raw JWT' }],
    deps: [],
  },
  {
    name: 'reserveStock',
    file: 'src/services/inventory.service.js',
    signature: 'export async function reserveStock',
    kind: 'service',
    description: 'Reserves each SKU in the cart and throws when stock is insufficient.',
    params: [{ name: 'items', type: 'Array<{ sku, qty }>', description: 'Cart line items' }],
    deps: [],
  },
  {
    name: 'releaseStock',
    file: 'src/services/inventory.service.js',
    signature: 'export async function releaseStock',
    kind: 'service',
    description: 'Returns reserved quantities to available stock.',
    params: [{ name: 'items', type: 'Array<{ sku, qty }>', description: 'Cart line items' }],
    deps: [],
  },
  {
    name: 'charge',
    file: 'src/services/payment.service.js',
    signature: 'export async function charge',
    kind: 'external',
    description: 'Creates and confirms a payment intent with the payment provider.',
    params: [{ name: '{ amount, currency, userId }', type: 'object', description: 'Amount in major units' }],
    deps: [],
  },
  {
    name: 'refund',
    file: 'src/services/payment.service.js',
    signature: 'export async function refund',
    kind: 'external',
    description: 'Refunds a previously captured payment.',
    params: [{ name: 'paymentId', type: 'string', description: 'Payment intent id' }],
    deps: [],
  },
  {
    name: 'sendOrderConfirmation',
    file: 'src/services/notification.service.js',
    signature: 'export async function sendOrderConfirmation',
    kind: 'service',
    description: 'Publishes the order.confirmed event for downstream consumers.',
    params: [{ name: 'order', type: 'Order', description: 'Persisted order record' }],
    deps: [],
  },
  {
    name: 'insertOrder',
    file: 'src/db/orders.repository.js',
    signature: 'export async function insertOrder',
    kind: 'database',
    description: 'Inserts an order row and returns it.',
    params: [{ name: 'order', type: 'object', description: 'Order columns' }],
    deps: [],
  },
  {
    name: 'findOrderById',
    file: 'src/db/orders.repository.js',
    signature: 'export async function findOrderById',
    kind: 'database',
    description: 'Looks up one order by id, or null.',
    params: [{ name: 'id', type: 'string', description: 'Order id' }],
    deps: [],
  },
  {
    name: 'findOrders',
    file: 'src/db/orders.repository.js',
    signature: 'export async function findOrders',
    kind: 'database',
    description: 'Lists orders for a user with an optional status filter.',
    params: [{ name: '{ userId, status }', type: 'object', description: 'Filter options' }],
    deps: [],
  },
  {
    name: 'updateOrder',
    file: 'src/db/orders.repository.js',
    signature: 'export async function updateOrder',
    kind: 'database',
    description: 'Updates the status of an order.',
    params: [
      { name: 'id', type: 'string', description: 'Order id' },
      { name: 'patch', type: 'object', description: 'Fields to update' },
    ],
    deps: [],
  },
]

export const BACKEND_ROUTES = [
  { method: 'GET', path: '/api/health', handler: 'inline (server.js)', auth: false, file: 'src/server.js' },
  { method: 'GET', path: '/api/orders', handler: 'listOrders', auth: true, file: 'src/routes/orders.routes.js' },
  { method: 'POST', path: '/api/orders', handler: 'createOrder', auth: true, file: 'src/routes/orders.routes.js' },
  { method: 'GET', path: '/api/orders/:id', handler: 'getOrder', auth: true, file: 'src/routes/orders.routes.js' },
  { method: 'POST', path: '/api/orders/:id/cancel', handler: 'cancelOrder', auth: true, file: 'src/routes/orders.routes.js' },
]

export const ROUTE_PARAMETERS = [
  { route: 'GET /api/orders', name: 'status', location: 'query', type: 'string', required: false, description: 'Filter by order status' },
  { route: 'POST /api/orders', name: 'items', location: 'body', type: 'array', required: true, description: 'Cart line items with sku and qty' },
  { route: 'POST /api/orders', name: 'total', location: 'body', type: 'number', required: true, description: 'Order total in major units' },
  { route: 'POST /api/orders', name: 'currency', location: 'body', type: 'string', required: true, description: 'USD, EUR or GBP' },
  { route: 'GET /api/orders/:id', name: 'id', location: 'path', type: 'string', required: true, description: 'Order identifier' },
  { route: 'POST /api/orders/:id/cancel', name: 'id', location: 'path', type: 'string', required: true, description: 'Order identifier' },
]

// Git status per file: M = modified, A = added, U = untracked
export const GIT_FILE_STATUS = {
  'src/controllers/orders.controller.js': 'M',
  'src/middleware/auth.middleware.js': 'M',
  'src/services/payment.service.js': 'M',
  'src/utils/validate.js': 'A',
}

export function lineOf(file, signature) {
  const lines = SOURCE_FILES[file]?.split('\n') ?? []
  const idx = lines.findIndex((line) => line.includes(signature))
  return idx === -1 ? 1 : idx + 1
}
