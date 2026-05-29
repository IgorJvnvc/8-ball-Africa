import { describe, it, expect, beforeEach } from 'vitest'
import {
  prismaMock,
  mockAuth,
  createMockRequest,
  parseResponse,
  mockCategory,
  adminSession,
  customerSession,
} from '@/tests/helpers/test-utils'
import { GET, POST } from '@/app/api/categories/route'

describe('GET /api/categories', () => {
  beforeEach(() => {
    prismaMock.category.findMany.mockReset()
    prismaMock.category.count.mockReset()
  })

  it('returns paginated categories with product count', async () => {
    const categories = [
      {
        ...mockCategory({ id: 'cat-1', name: 'Cues', slug: 'cues' }),
        parent: null,
        _count: { products: 10 },
      },
      {
        ...mockCategory({ id: 'cat-2', name: 'Tables', slug: 'tables' }),
        parent: null,
        _count: { products: 5 },
      },
    ]
    prismaMock.category.findMany.mockResolvedValue(categories)
    prismaMock.category.count.mockResolvedValue(2)

    const req = createMockRequest()
    const { status, body } = await parseResponse(await GET(req))

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(2)
    expect(body.data[0]._count.products).toBe(10)
    expect(body.pagination.total).toBe(2)
    expect(body.pagination.page).toBe(1)
  })

  it('returns empty array when no categories exist', async () => {
    prismaMock.category.findMany.mockResolvedValue([])
    prismaMock.category.count.mockResolvedValue(0)

    const req = createMockRequest({
      searchParams: {
        page: '2',
        limit: '10',
      },
    })

    const { status, body } = await parseResponse(await GET(req))

    expect(status).toBe(200)
    expect(body.data).toHaveLength(0)
    expect(body.pagination.page).toBe(2)
    expect(body.pagination.limit).toBe(10)
    expect(body.pagination.total).toBe(0)
  })
})

describe('POST /api/categories', () => {
  beforeEach(() => {
    prismaMock.category.create.mockReset()
  })

  it('creates a category as admin', async () => {
    mockAuth(adminSession)
    const newCat = mockCategory({ id: 'new-cat', name: 'Gloves', slug: 'gloves' })
    prismaMock.category.create.mockResolvedValue(newCat)

    const req = createMockRequest({
      method: 'POST',
      body: { name: 'Gloves', slug: 'gloves', description: 'Billiard gloves' },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.name).toBe('Gloves')
  })

  it('returns 403 for non-admin', async () => {
    mockAuth(customerSession)

    const req = createMockRequest({
      method: 'POST',
      body: { name: 'Hack', slug: 'hack' },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(403)
    expect(body.success).toBe(false)
  })

  it('returns 403 for unauthenticated', async () => {
    mockAuth(null)

    const req = createMockRequest({
      method: 'POST',
      body: { name: 'Test', slug: 'test' },
    })

    const { status } = await parseResponse(await POST(req))

    expect(status).toBe(403)
  })
})
