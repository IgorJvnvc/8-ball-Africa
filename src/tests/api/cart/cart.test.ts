import { describe, it, expect, beforeEach } from 'vitest'
import {
  prismaMock,
  mockAuth,
  createMockRequest,
  parseResponse,
  mockCartItem,
  mockProduct,
  customerSession,
} from '@/tests/helpers/test-utils'
import { GET } from '@/app/api/cart/route'
import { POST } from '@/app/api/cart/items/route'
import { PUT, DELETE } from '@/app/api/cart/items/[id]/route'

const mockParams = (id: string) => Promise.resolve({ id })

describe('GET /api/cart', () => {
  beforeEach(() => {
    prismaMock.cartItem.findMany.mockReset()
  })

  it('returns cart items for authenticated user', async () => {
    mockAuth(customerSession)
    const items = [
      {
        ...mockCartItem(),
        product: { ...mockProduct(), images: [{ url: '/test.jpg' }] },
      },
    ]
    prismaMock.cartItem.findMany.mockResolvedValue(items)

    const { status, body } = await parseResponse(await GET())

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(1)
    expect(body.data[0].product.name).toBe('Predator Revo 12.4mm Shaft')
  })

  it('returns empty cart', async () => {
    mockAuth(customerSession)
    prismaMock.cartItem.findMany.mockResolvedValue([])

    const { status, body } = await parseResponse(await GET())

    expect(status).toBe(200)
    expect(body.data).toHaveLength(0)
  })

  it('returns 401 for unauthenticated', async () => {
    mockAuth(null)

    const { status } = await parseResponse(await GET())

    expect(status).toBe(401)
  })
})

describe('POST /api/cart/items', () => {
  beforeEach(() => {
    prismaMock.product.findUnique.mockReset()
    prismaMock.cartItem.upsert.mockReset()
  })

  it('adds item to cart', async () => {
    mockAuth(customerSession)
    prismaMock.product.findUnique.mockResolvedValue(mockProduct())
    prismaMock.cartItem.upsert.mockResolvedValue({
      ...mockCartItem(),
      product: { ...mockProduct(), images: [] },
    })

    const req = createMockRequest({
      method: 'POST',
      body: { productId: 'prod-1', quantity: 1 },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(201)
    expect(body.success).toBe(true)
  })

  it('returns 404 for non-existent product', async () => {
    mockAuth(customerSession)
    prismaMock.product.findUnique.mockResolvedValue(null)

    const req = createMockRequest({
      method: 'POST',
      body: { productId: 'fake-prod', quantity: 1 },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(404)
    expect(body.error).toBe('Product not found')
  })

  it('returns 400 for insufficient stock', async () => {
    mockAuth(customerSession)
    prismaMock.product.findUnique.mockResolvedValue(mockProduct({ stock: 0 }))

    const req = createMockRequest({
      method: 'POST',
      body: { productId: 'prod-1', quantity: 1 },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(400)
    expect(body.error).toBe('Insufficient stock')
  })

  it('returns 401 for unauthenticated', async () => {
    mockAuth(null)

    const req = createMockRequest({
      method: 'POST',
      body: { productId: 'prod-1', quantity: 1 },
    })

    const { status } = await parseResponse(await POST(req))

    expect(status).toBe(401)
  })

  it('returns 400 for invalid quantity', async () => {
    mockAuth(customerSession)

    const req = createMockRequest({
      method: 'POST',
      body: { productId: 'prod-1', quantity: 0 },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(400)
    expect(body.success).toBe(false)
  })
})

describe('PUT /api/cart/items/:id', () => {
  beforeEach(() => {
    prismaMock.cartItem.update.mockReset()
    prismaMock.cartItem.delete.mockReset()
  })

  it('updates item quantity', async () => {
    mockAuth(customerSession)
    prismaMock.cartItem.update.mockResolvedValue(mockCartItem({ quantity: 3 }))

    const req = createMockRequest({ method: 'PUT', body: { quantity: 3 } })
    const { status, body } = await parseResponse(
      await PUT(req, { params: mockParams('cart-item-1') }),
    )

    expect(status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('deletes item when quantity is 0', async () => {
    mockAuth(customerSession)
    prismaMock.cartItem.delete.mockResolvedValue(mockCartItem())

    const req = createMockRequest({ method: 'PUT', body: { quantity: 0 } })
    const { status, body } = await parseResponse(
      await PUT(req, { params: mockParams('cart-item-1') }),
    )

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toBeNull()
    expect(prismaMock.cartItem.delete).toHaveBeenCalled()
  })

  it('returns 401 for unauthenticated', async () => {
    mockAuth(null)

    const req = createMockRequest({ method: 'PUT', body: { quantity: 2 } })
    const { status } = await parseResponse(await PUT(req, { params: mockParams('cart-item-1') }))

    expect(status).toBe(401)
  })
})

describe('DELETE /api/cart/items/:id', () => {
  beforeEach(() => {
    prismaMock.cartItem.delete.mockReset()
  })

  it('removes item from cart', async () => {
    mockAuth(customerSession)
    prismaMock.cartItem.delete.mockResolvedValue(mockCartItem())

    const req = createMockRequest({ method: 'DELETE' })
    const { status, body } = await parseResponse(
      await DELETE(req, { params: mockParams('cart-item-1') }),
    )

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(prismaMock.cartItem.delete).toHaveBeenCalledWith({
      where: { id: 'cart-item-1', userId: 'user-1' },
    })
  })

  it('returns 401 for unauthenticated', async () => {
    mockAuth(null)

    const req = createMockRequest({ method: 'DELETE' })
    const { status } = await parseResponse(await DELETE(req, { params: mockParams('cart-item-1') }))

    expect(status).toBe(401)
  })
})
