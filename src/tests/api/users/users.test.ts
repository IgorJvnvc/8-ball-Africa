import { describe, it, expect, beforeEach } from 'vitest'
import {
  prismaMock,
  mockAuth,
  createMockRequest,
  parseResponse,
  mockUser,
  mockAdmin,
  adminSession,
  customerSession,
} from '@/tests/helpers/test-utils'
import { GET } from '@/app/api/users/route'
import { GET as GET_BY_ID, PUT, DELETE } from '@/app/api/users/[id]/route'

const mockParams = (id: string) => Promise.resolve({ id })

describe('GET /api/users', () => {
  beforeEach(() => {
    prismaMock.user.findMany.mockReset()
    prismaMock.user.count.mockReset()
  })

  it('returns users list as admin', async () => {
    mockAuth(adminSession)
    const users = [
      { ...mockUser(), _count: { orders: 3 } },
      { ...mockUser({ id: 'user-2', email: 'other@test.com' }), _count: { orders: 1 } },
    ]
    prismaMock.user.findMany.mockResolvedValue(users)
    prismaMock.user.count.mockResolvedValue(2)

    const req = createMockRequest()
    const { status, body } = await parseResponse(await GET(req))

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data).toHaveLength(2)
    expect(body.pagination.total).toBe(2)
  })

  it('returns 403 for non-admin', async () => {
    mockAuth(customerSession)

    const req = createMockRequest()
    const { status, body } = await parseResponse(await GET(req))

    expect(status).toBe(403)
    expect(body.success).toBe(false)
  })

  it('returns 403 for unauthenticated', async () => {
    mockAuth(null)

    const req = createMockRequest()
    const { status } = await parseResponse(await GET(req))

    expect(status).toBe(403)
  })

  it('filters users by search query', async () => {
    mockAuth(adminSession)
    prismaMock.user.findMany.mockResolvedValue([])
    prismaMock.user.count.mockResolvedValue(0)

    const req = createMockRequest({ searchParams: { q: 'john' } })
    await GET(req)

    expect(prismaMock.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: { contains: 'john', mode: 'insensitive' } }),
          ]),
        }),
      }),
    )
  })
})

describe('GET /api/users/:id', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset()
  })

  it('returns user profile for self', async () => {
    mockAuth(customerSession)
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser(),
      addresses: [],
      _count: { orders: 2, reviews: 1 },
    })

    const req = createMockRequest()
    const { status, body } = await parseResponse(await GET_BY_ID(req, { params: mockParams('user-1') }))

    expect(status).toBe(200)
    expect(body.success).toBe(true)
    expect(body.data.email).toBe('test@example.com')
  })

  it('returns user profile for admin viewing another user', async () => {
    mockAuth(adminSession)
    prismaMock.user.findUnique.mockResolvedValue({
      ...mockUser({ id: 'user-2', email: 'other@test.com' }),
      addresses: [],
      _count: { orders: 0, reviews: 0 },
    })

    const req = createMockRequest()
    const { status, body } = await parseResponse(await GET_BY_ID(req, { params: mockParams('user-2') }))

    expect(status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('returns 403 when customer tries to view another user', async () => {
    mockAuth(customerSession)

    const req = createMockRequest()
    const { status } = await parseResponse(await GET_BY_ID(req, { params: mockParams('user-2') }))

    expect(status).toBe(403)
  })

  it('returns 401 for unauthenticated', async () => {
    mockAuth(null)

    const req = createMockRequest()
    const { status } = await parseResponse(await GET_BY_ID(req, { params: mockParams('user-1') }))

    expect(status).toBe(401)
  })

  it('returns 404 for non-existent user', async () => {
    mockAuth(adminSession)
    prismaMock.user.findUnique.mockResolvedValue(null)

    const req = createMockRequest()
    const { status, body } = await parseResponse(await GET_BY_ID(req, { params: mockParams('fake') }))

    expect(status).toBe(404)
    expect(body.error).toBe('User not found')
  })
})

describe('PUT /api/users/:id', () => {
  beforeEach(() => {
    prismaMock.user.update.mockReset()
  })

  it('allows user to update own name', async () => {
    mockAuth(customerSession)
    prismaMock.user.update.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Updated Name',
      role: 'CUSTOMER',
      image: null,
    })

    const req = createMockRequest({ method: 'PUT', body: { name: 'Updated Name' } })
    const { status, body } = await parseResponse(await PUT(req, { params: mockParams('user-1') }))

    expect(status).toBe(200)
    expect(body.data.name).toBe('Updated Name')
  })

  it('allows admin to change user role', async () => {
    mockAuth(adminSession)
    prismaMock.user.update.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      name: 'Test',
      role: 'ADMIN',
      image: null,
    })

    const req = createMockRequest({ method: 'PUT', body: { role: 'ADMIN' } })
    const { status, body } = await parseResponse(await PUT(req, { params: mockParams('user-1') }))

    expect(status).toBe(200)
    expect(body.data.role).toBe('ADMIN')
  })

  it('returns 403 when customer tries to update another user', async () => {
    mockAuth(customerSession)

    const req = createMockRequest({ method: 'PUT', body: { name: 'Hack' } })
    const { status } = await parseResponse(await PUT(req, { params: mockParams('user-2') }))

    expect(status).toBe(403)
  })
})

describe('DELETE /api/users/:id', () => {
  beforeEach(() => {
    prismaMock.user.delete.mockReset()
  })

  it('deletes user as admin', async () => {
    mockAuth(adminSession)
    prismaMock.user.delete.mockResolvedValue(mockUser({ id: 'user-2' }))

    const req = createMockRequest({ method: 'DELETE' })
    const { status, body } = await parseResponse(await DELETE(req, { params: mockParams('user-2') }))

    expect(status).toBe(200)
    expect(body.success).toBe(true)
  })

  it('prevents admin from deleting themselves', async () => {
    mockAuth(adminSession)

    const req = createMockRequest({ method: 'DELETE' })
    const { status, body } = await parseResponse(await DELETE(req, { params: mockParams('admin-1') }))

    expect(status).toBe(400)
    expect(body.error).toContain('Cannot delete your own account')
  })

  it('returns 403 for non-admin', async () => {
    mockAuth(customerSession)

    const req = createMockRequest({ method: 'DELETE' })
    const { status } = await parseResponse(await DELETE(req, { params: mockParams('user-2') }))

    expect(status).toBe(403)
  })
})
