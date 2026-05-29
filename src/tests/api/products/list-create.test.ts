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
import { GET, POST } from '@/app/api/products/route'

describe('GET /api/products', () => {
  beforeEach(() => {
    prismaMock.product.findMany.mockReset()
    prismaMock.product.count.mockReset()
  })

  it('returns paginated products', async () => {
    const products = [
      mockProduct({ id: 'p1', name: 'Product 1' }),
      mockProduct({ id: 'p2', name: 'Product 2' }),
    ]
    prismaMock.product.findMany.mockResolvedValue(products)
    prismaMock.product.count.mockResolvedValue(2)

    const req = createMockRequest({ searchParams: { page: '1', limit: '12' } })
    const { status, body } = await parseResponse(await GET(req))

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(2)
    expect(body.pagination.total).toBe(2)
    expect(body.pagination.page).toBe(1)
  })

  it('filters by category', async () => {
    prismaMock.product.findMany.mockResolvedValue([])
    prismaMock.product.count.mockResolvedValue(0)

    const req = createMockRequest({ searchParams: { category: 'cues' } })
    await GET(req)

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          category: { slug: 'cues' },
        }),
      }),
    )
  })

  it('filters by brand', async () => {
    prismaMock.product.findMany.mockResolvedValue([])
    prismaMock.product.count.mockResolvedValue(0)

    const req = createMockRequest({ searchParams: { brand: 'Predator,Mezz' } })
    await GET(req)

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          brand: { in: ['Predator', 'Mezz'] },
        }),
      }),
    )
  })

  it('filters by price range', async () => {
    prismaMock.product.findMany.mockResolvedValue([])
    prismaMock.product.count.mockResolvedValue(0)

    const req = createMockRequest({ searchParams: { minPrice: '100', maxPrice: '500' } })
    await GET(req)

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          price: { gte: 100, lte: 500 },
        }),
      }),
    )
  })

  it('searches by query', async () => {
    prismaMock.product.findMany.mockResolvedValue([])
    prismaMock.product.count.mockResolvedValue(0)

    const req = createMockRequest({ searchParams: { q: 'predator' } })
    await GET(req)

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: { contains: 'predator', mode: 'insensitive' } }),
          ]),
        }),
      }),
    )
  })

  it('supports multi-word search using AND terms', async () => {
    prismaMock.product.findMany.mockResolvedValue([])
    prismaMock.product.count.mockResolvedValue(0)

    const req = createMockRequest({ searchParams: { q: 'predator cue' } })
    await GET(req)

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({ name: { contains: 'predator', mode: 'insensitive' } }),
              ]),
            }),
            expect.objectContaining({
              OR: expect.arrayContaining([
                expect.objectContaining({ name: { contains: 'cue', mode: 'insensitive' } }),
              ]),
            }),
          ]),
        }),
      }),
    )
  })

  it('caps requested page size at 48', async () => {
    prismaMock.product.findMany.mockResolvedValue([])
    prismaMock.product.count.mockResolvedValue(0)

    const req = createMockRequest({ searchParams: { limit: '999' } })
    await GET(req)

    expect(prismaMock.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 48,
      }),
    )
  })

  it('returns empty array when no products match', async () => {
    prismaMock.product.findMany.mockResolvedValue([])
    prismaMock.product.count.mockResolvedValue(0)

    const req = createMockRequest({ searchParams: { brand: 'NonExistent' } })
    const { status, body } = await parseResponse(await GET(req))

    expect(status).toBe(200)
    expect(body.data).toHaveLength(0)
    expect(body.pagination.total).toBe(0)
  })
})

describe('POST /api/products', () => {
  beforeEach(() => {
    prismaMock.product.create.mockReset()
    prismaMock.productImage.createMany.mockReset()
  })

  it('creates a product as admin', async () => {
    mockAuth(adminSession)
    const newProduct = mockProduct({ id: 'new-prod' })
    prismaMock.product.create.mockResolvedValue({ ...newProduct, category: mockCategory() })
    prismaMock.productImage.createMany.mockResolvedValue({ count: 1 })

    const req = createMockRequest({
      method: 'POST',
      body: {
        name: 'New Cue',
        slug: 'new-cue',
        brand: 'Predator',
        price: 300,
        stock: 10,
        categoryId: 'cat-1',
        images: ['/images/new-cue.jpg'],
      },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(201)
    expect(body.success).toBe(true)
  })

  it('returns 403 for non-admin users', async () => {
    mockAuth(customerSession)

    const req = createMockRequest({
      method: 'POST',
      body: { name: 'Hack Product', slug: 'hack', brand: 'X', price: 1, stock: 1, categoryId: 'cat-1' },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(403)
    expect(body.success).toBe(false)
    expect(body.error).toBe('Unauthorized')
  })

  it('returns 403 for unauthenticated requests', async () => {
    mockAuth(null)

    const req = createMockRequest({
      method: 'POST',
      body: { name: 'Test', slug: 'test', brand: 'X', price: 1, stock: 1, categoryId: 'cat-1' },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(403)
    expect(body.success).toBe(false)
  })
})
