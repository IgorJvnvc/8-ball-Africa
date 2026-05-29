import { beforeEach, describe, expect, it } from 'vitest'
import {
  adminSession,
  createMockRequest,
  customerSession,
  mockAuth,
  mockCategory,
  parseResponse,
  prismaMock,
} from '@/tests/helpers/test-utils'
import { DELETE, PUT } from '@/app/api/categories/[id]/route'

describe('PUT /api/categories/:id', () => {
  beforeEach(() => {
    prismaMock.category.update.mockReset()
  })

  it('updates a category as admin', async () => {
    mockAuth(adminSession)

    prismaMock.category.update.mockResolvedValue({
      ...mockCategory({ id: 'cat-1', name: 'Updated Cues', slug: 'updated-cues' }),
      _count: { products: 3 },
    })

    const req = createMockRequest({
      method: 'PUT',
      body: {
        name: 'Updated Cues',
        slug: 'updated-cues',
        description: 'Updated description',
        image: '/images/categories/cues.jpg',
        sortOrder: 2,
      },
    })

    const { status, body } = await parseResponse(
      await PUT(req, { params: Promise.resolve({ id: 'cat-1' }) }),
    )

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.name).toBe('Updated Cues')
  })

  it('returns 403 for non-admin users', async () => {
    mockAuth(customerSession)

    const req = createMockRequest({
      method: 'PUT',
      body: { name: 'Should Fail', slug: 'should-fail' },
    })

    const { status, body } = await parseResponse(
      await PUT(req, { params: Promise.resolve({ id: 'cat-1' }) }),
    )

    expect(status).toBe(403)
    expect(body.success).toBe(false)
  })
})

describe('DELETE /api/categories/:id', () => {
  beforeEach(() => {
    prismaMock.category.findUnique.mockReset()
    prismaMock.category.delete.mockReset()
  })

  it('deletes an empty category as admin', async () => {
    mockAuth(adminSession)

    prismaMock.category.findUnique.mockResolvedValue({
      _count: {
        products: 0,
        children: 0,
      },
    })

    prismaMock.category.delete.mockResolvedValue(mockCategory({ id: 'cat-empty' }))

    const req = createMockRequest({ method: 'DELETE' })
    const { status, body } = await parseResponse(
      await DELETE(req, { params: Promise.resolve({ id: 'cat-empty' }) }),
    )

    expect(status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('blocks deleting category with products', async () => {
    mockAuth(adminSession)

    prismaMock.category.findUnique.mockResolvedValue({
      _count: {
        products: 2,
        children: 0,
      },
    })

    const req = createMockRequest({ method: 'DELETE' })
    const { status, body } = await parseResponse(
      await DELETE(req, { params: Promise.resolve({ id: 'cat-busy' }) }),
    )

    expect(status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('returns 403 for non-admin users', async () => {
    mockAuth(customerSession)

    const req = createMockRequest({ method: 'DELETE' })
    const { status, body } = await parseResponse(
      await DELETE(req, { params: Promise.resolve({ id: 'cat-1' }) }),
    )

    expect(status).toBe(403)
    expect(body.success).toBe(false)
  })
})
