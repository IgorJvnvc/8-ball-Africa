import { describe, it, expect, beforeEach } from 'vitest'
import {
  prismaMock,
  createMockRequest,
  parseResponse,
  mockUser,
} from '@/tests/helpers/test-utils'
import { POST } from '@/app/api/auth/register/route'

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    prismaMock.user.findUnique.mockReset()
    prismaMock.user.create.mockReset()
  })

  it('creates a user with valid data', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    prismaMock.user.create.mockResolvedValue({
      id: 'new-user',
      email: 'new@example.com',
      name: 'New User',
      role: 'CUSTOMER',
      createdAt: new Date(),
    })

    const req = createMockRequest({
      method: 'POST',
      body: { email: 'new@example.com', password: 'password123', name: 'New User' },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(201)
    expect(body.success).toBe(true)
    expect(body.data.email).toBe('new@example.com')
    expect(body.data.name).toBe('New User')
  })

  it('returns 400 for duplicate email', async () => {
    prismaMock.user.findUnique.mockResolvedValue(mockUser())

    const req = createMockRequest({
      method: 'POST',
      body: { email: 'test@example.com', password: 'password123', name: 'Test' },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(400)
    expect(body.success).toBe(false)
    expect(body.error).toContain('already exists')
  })

  it('returns 400 for invalid email format', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: { email: 'not-an-email', password: 'password123', name: 'Test' },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('returns 400 for password shorter than 8 characters', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: { email: 'test@example.com', password: 'short', name: 'Test' },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('returns 400 for missing name', async () => {
    const req = createMockRequest({
      method: 'POST',
      body: { email: 'test@example.com', password: 'password123' },
    })

    const { status, body } = await parseResponse(await POST(req))

    expect(status).toBe(400)
    expect(body.success).toBe(false)
  })

  it('hashes the password before storing', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null)
    prismaMock.user.create.mockResolvedValue({
      id: 'new-user',
      email: 'new@example.com',
      name: 'New User',
      role: 'CUSTOMER',
      createdAt: new Date(),
    })

    const req = createMockRequest({
      method: 'POST',
      body: { email: 'new@example.com', password: 'mypassword', name: 'New User' },
    })

    await POST(req)

    expect(prismaMock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          passwordHash: 'hashed_mypassword',
        }),
      }),
    )
  })
})
