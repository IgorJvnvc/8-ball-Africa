import { describe, it, expect, beforeEach } from 'vitest'
import {
  prismaMock,
  mockAuth,
  createMockRequest,
  parseResponse,
  mockProduct,
  mockCategory,
  adminSession,
  customerSession,
} from '@/tests/helpers/test-utils'
import { GET, PUT, DELETE } from '@/app/api/products/[id]/route'

const mockParams = (id: string) => Promise.resolve({ id })

describe('GET /api/products/:id', () => {
  beforeEach(() => {
    prismaMock.product.findUnique.mockReset()
  })

  it('returns a product by id', async () => {
    const product = {
      ...mockProduct(),
      images: [{ id: 'img-1', url: '/test.jpg', alt: null, sortOrder: 0 }],
      category: mockCategory(),
      reviews: [],
    }
    prismaMock.product.findUnique.mockResolvedValue(product)

    const req = createMockRequest()
    const { status, body } = await parseResponse(await GET(req, { params: mockParams('prod-1') }))

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.id).toBe('prod-1')
    expect(body.data.name).toBe('Predator Revo 12.4mm Shaft')
  })

  it('returns 404 for non-existent product', async () => {
    prismaMock.product.findUnique.mockResolvedValue(null)

    const req = createMockRequest()
    const { status, body } = await parseResponse(await GET(req, { params: mockParams('fake-id') }))

    expect(status).toBe(404)
    expect(body.success).toBe(false)
    expect(body.error).toBe('Product not found')
  })
})

describe('PUT /api/products/:id', () => {
  beforeEach(() => {
    prismaMock.product.update.mockReset()
  })

  it('updates a product as admin', async () => {
    mockAuth(adminSession)
    const updated = { ...mockProduct(), name: 'Updated Name', category: mockCategory(), images: [] }
    prismaMock.product.update.mockResolvedValue(updated)

    const req = createMockRequest({
      method: 'PUT',
      body: { name: 'Updated Name', price: 600 },
    })

    const { status, body } = await parseResponse(await PUT(req, { params: mockParams('prod-1') }))

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.name).toBe('Updated Name')
  })

  it('returns 403 for non-admin', async () => {
    mockAuth(customerSession)

    const req = createMockRequest({
      method: 'PUT',
      body: { name: 'Hacked' },
    })

    const { status, body } = await parseResponse(await PUT(req, { params: mockParams('prod-1') }))

    expect(status).toBe(403)
    expect(body.success).toBe(false)
  })

  it('returns 403 for unauthenticated', async () => {
    mockAuth(null)

    const req = createMockRequest({ method: 'PUT', body: { name: 'X' } })
    const { status } = await parseResponse(await PUT(req, { params: mockParams('prod-1') }))

    expect(status).toBe(403)
  })
})

describe('DELETE /api/products/:id', () => {
  beforeEach(() => {
    prismaMock.product.delete.mockReset()
  })

  it('deletes a product as admin', async () => {
    mockAuth(adminSession)
    prismaMock.product.delete.mockResolvedValue(mockProduct())

    const req = createMockRequest({ method: 'DELETE' })
    const { status, body } = await parseResponse(await DELETE(req, { params: mockParams('prod-1') }))

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(prismaMock.product.delete).toHaveBeenCalledWith({ where: { id: 'prod-1' } })
  })

  it('returns 403 for non-admin', async () => {
    mockAuth(customerSession)

    const req = createMockRequest({ method: 'DELETE' })
    const { status } = await parseResponse(await DELETE(req, { params: mockParams('prod-1') }))

    expect(status).toBe(403)
  })
})
