import { vi } from 'vitest'
import { NextRequest } from 'next/server'

type NextRequestInit = NonNullable<ConstructorParameters<typeof NextRequest>[1]>

// ─── Mock Prisma ────────────────────────────────────────────────────────────────

const createMockPrismaModel = () => ({
  findMany: vi.fn(),
  findUnique: vi.fn(),
  findFirst: vi.fn(),
  create: vi.fn(),
  createMany: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  delete: vi.fn(),
  deleteMany: vi.fn(),
  count: vi.fn(),
  aggregate: vi.fn(),
  upsert: vi.fn(),
})

export const prismaMock = {
  user: createMockPrismaModel(),
  account: createMockPrismaModel(),
  product: createMockPrismaModel(),
  productImage: createMockPrismaModel(),
  category: createMockPrismaModel(),
  order: createMockPrismaModel(),
  orderItem: createMockPrismaModel(),
  cartItem: createMockPrismaModel(),
  review: createMockPrismaModel(),
  address: createMockPrismaModel(),
}

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

// ─── Mock Auth ──────────────────────────────────────────────────────────────────

let currentSession: unknown = null

export const mockAuth = (session: unknown) => {
  currentSession = session
}

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve(currentSession)),
}))

// ─── Mock bcryptjs ──────────────────────────────────────────────────────────────

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn((password: string) => Promise.resolve(`hashed_${password}`)),
    compare: vi.fn((plain: string, hash: string) =>
      Promise.resolve(hash === `hashed_${plain}`),
    ),
  },
}))

// ─── Mock Stripe ────────────────────────────────────────────────────────────────

const mockStripeInstance = {
  checkout: {
    sessions: {
      create: vi.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test',
      }),
    },
  },
  webhooks: {
    constructEvent: vi.fn(),
  },
}

vi.mock('stripe', () => {
  const Stripe = function () {
    return mockStripeInstance
  }
  return { default: Stripe }
})

export { mockStripeInstance as stripeMock }

// ─── Request Helpers ────────────────────────────────────────────────────────────

interface CreateRequestOptions {
  method?: string
  body?: Record<string, unknown>
  searchParams?: Record<string, string>
  headers?: Record<string, string>
}

export function createMockRequest(options: CreateRequestOptions = {}): NextRequest {
  const { method = 'GET', body, searchParams, headers = {} } = options

  const url = new URL('http://localhost:3000/api/test')
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }

  const init: NextRequestInit = {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
  }

  if (body && method !== 'GET') {
    init.body = JSON.stringify(body)
  }

  return new NextRequest(url, init)
}

// ─── Mock Data Factories ────────────────────────────────────────────────────────

export const mockUser = (overrides = {}) => ({
  id: 'user-1',
  email: 'test@example.com',
  name: 'Test User',
  passwordHash: 'hashed_password123',
  image: null,
  role: 'CUSTOMER' as const,
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const mockAdmin = (overrides = {}) => ({
  id: 'admin-1',
  email: 'admin@8ballafrica.com',
  name: 'Admin',
  passwordHash: 'hashed_admin123',
  image: null,
  role: 'ADMIN' as const,
  emailVerified: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const mockProduct = (overrides = {}) => ({
  id: 'prod-1',
  name: 'Predator Revo 12.4mm Shaft',
  slug: 'predator-revo-12-4mm',
  description: 'Revolutionary carbon fiber shaft',
  brand: 'Predator',
  price: 520,
  comparePrice: null,
  stock: 15,
  featured: true,
  published: true,
  categoryId: 'cat-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const mockCategory = (overrides = {}) => ({
  id: 'cat-1',
  name: 'Cues',
  slug: 'cues',
  description: 'High-performance cues',
  image: null,
  parentId: null,
  sortOrder: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const mockOrder = (overrides = {}) => ({
  id: 'order-1',
  userId: 'user-1',
  status: 'PENDING' as const,
  total: 545,
  subtotal: 520,
  shippingCost: 25,
  stripeSessionId: 'cs_test_123',
  stripePaymentId: null,
  addressId: null,
  invoiceUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

export const mockCartItem = (overrides = {}) => ({
  id: 'cart-item-1',
  userId: 'user-1',
  productId: 'prod-1',
  quantity: 2,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
})

// ─── Session Factories ──────────────────────────────────────────────────────────

export const customerSession = {
  user: { id: 'user-1', email: 'test@example.com', name: 'Test User', role: 'CUSTOMER' },
}

export const adminSession = {
  user: { id: 'admin-1', email: 'admin@8ballafrica.com', name: 'Admin', role: 'ADMIN' },
}

// ─── Response Helper ────────────────────────────────────────────────────────────

export async function parseResponse(response: Response) {
  const data = await response.json()
  return { status: response.status, body: data }
}
