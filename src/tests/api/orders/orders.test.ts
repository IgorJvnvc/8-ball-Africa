import { describe, it, expect, beforeEach } from 'vitest'
import {
  prismaMock,
  mockAuth,
  createMockRequest,
  parseResponse,
  mockOrder,
  mockProduct,
  mockCartItem,
  adminSession,
  customerSession,
} from '@/tests/helpers/test-utils'
import { GET, POST } from '@/app/api/orders/route'
import { PUT } from '@/app/api/orders/[id]/status/route'

const mockParams = (id: string) => Promise.resolve({ id })

describe('GET /api/orders', () => {
  beforeEach(() => {
    prismaMock.order.findMany.mockReset()
    prismaMock.order.count.mockReset()
  })

  it('returns orders for authenticated customer (own only)', async () => {
    mockAuth(customerSession)
    const orders = [
      {
        ...mockOrder(),
        items: [{ name: 'Predator Revo', quantity: 1, price: 520 }],
        user: { name: 'Test User', email: 'test@example.com' },
      },
    ]
    prismaMock.order.findMany.mockResolvedValue(orders)
    prismaMock.order.count.mockResolvedValue(1)

    const req = createMockRequest()
    const { status, body } = await parseResponse(await GET(req))

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(1)
    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ userId: 'user-1' }),
      }),
    )
  })

  it('returns all orders for admin', async () => {
    mockAuth(adminSession)
    prismaMock.order.findMany.mockResolvedValue([])
    prismaMock.order.count.mockResolvedValue(0)

    const req = createMockRequest()
    await GET(req)

    // Admin should not have userId filter
    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({ userId: expect.anything() }),
      }),
    )
  })

  it('returns 401 for unauthenticated', async () => {
    mockAuth(null)

    const req = createMockRequest()
    const { status } = await parseResponse(await GET(req))

    expect(status).toBe(401)
  })

  it('filters by status', async () => {
    mockAuth(adminSession)
    prismaMock.order.findMany.mockResolvedValue([])
    prismaMock.order.count.mockResolvedValue(0)

    const req = createMockRequest({ searchParams: { status: 'PAID' } })
    await GET(req)

    expect(prismaMock.order.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'PAID' }),
      }),
    )
  })
})

describe('POST /api/orders', () => {
  beforeEach(() => {
    prismaMock.cartItem.findMany.mockReset()
    prismaMock.order.create.mockReset()
    prismaMock.cartItem.deleteMany.mockReset()
  })

  it('creates an order from cart items', async () => {
    mockAuth(customerSession)
    prismaMock.cartItem.findMany.mockResolvedValue([
      { ...mockCartItem(), product: mockProduct({ price: 520 }) },
    ])
    prismaMock.order.create.mockResolvedValue(mockOrder())
    prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 1 })

    const req = createMockRequest({ method: 'POST', body: {} })
    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.checkoutUrl).toBe('https://checkout.stripe.com/test')
  })

  it('returns 400 for empty cart', async () => {
    mockAuth(customerSession)
    prismaMock.cartItem.findMany.mockResolvedValue([])

    const req = createMockRequest({ method: 'POST', body: {} })
    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(400)
    expect(body.error).toBe('Cart is empty')
  })

  it('returns 401 for unauthenticated', async () => {
    mockAuth(null)

    const req = createMockRequest({ method: 'POST', body: {} })
    const { status } = await parseResponse(await POST(req))

    expect(status).toBe(401)
  })

  it('clears cart after order creation', async () => {
    mockAuth(customerSession)
    prismaMock.cartItem.findMany.mockResolvedValue([{ ...mockCartItem(), product: mockProduct() }])
    prismaMock.order.create.mockResolvedValue(mockOrder())
    prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 1 })

    const req = createMockRequest({ method: 'POST', body: {} })
    await POST(req)

    expect(prismaMock.cartItem.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
    })
  })

  it('calculates free shipping for orders over $500', async () => {
    mockAuth(customerSession)
    prismaMock.cartItem.findMany.mockResolvedValue([
      { ...mockCartItem({ quantity: 1 }), product: mockProduct({ price: 600 }) },
    ])
    prismaMock.order.create.mockResolvedValue(mockOrder())
    prismaMock.cartItem.deleteMany.mockResolvedValue({ count: 1 })

    const req = createMockRequest({ method: 'POST', body: {} })
    await POST(req)

    expect(prismaMock.order.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          shippingCost: 0,
          total: 600,
        }),
      }),
    )
  })
})

describe('PUT /api/orders/:id/status', () => {
  beforeEach(() => {
    prismaMock.order.update.mockReset()
  })

  it('updates order status as admin', async () => {
    mockAuth(adminSession)
    prismaMock.order.update.mockResolvedValue({
      ...mockOrder({ status: 'SHIPPED' }),
      user: { email: 'test@example.com', name: 'Test' },
    })

    const req = createMockRequest({ method: 'PUT', body: { status: 'SHIPPED' } })
    const { status, body } = await parseResponse(await PUT(req, { params: mockParams('order-1') }))

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.status).toBe('SHIPPED')
  })

  it('returns 400 for invalid status', async () => {
    mockAuth(adminSession)

    const req = createMockRequest({ method: 'PUT', body: { status: 'INVALID' } })
    const { status, body } = await parseResponse(await PUT(req, { params: mockParams('order-1') }))

    expect(status).toBe(400)
    expect(body.error).toBe('Invalid status')
  })

  it('returns 403 for non-admin', async () => {
    mockAuth(customerSession)

    const req = createMockRequest({ method: 'PUT', body: { status: 'SHIPPED' } })
    const { status } = await parseResponse(await PUT(req, { params: mockParams('order-1') }))

    expect(status).toBe(403)
  })

  it('returns 403 for unauthenticated', async () => {
    mockAuth(null)

    const req = createMockRequest({ method: 'PUT', body: { status: 'SHIPPED' } })
    const { status } = await parseResponse(await PUT(req, { params: mockParams('order-1') }))

    expect(status).toBe(403)
  })
})
