import type { Express } from 'express'
import request from 'supertest'

import { setupTestApp, teardownTestApp, clearDatabase } from '../../__tests__/integration/setup'

describe('Auth integration', () => {
  let app: Express

  beforeAll(async () => {
    const result = await setupTestApp()
    app = result.app
  }, 60_000)

  afterAll(async () => {
    await teardownTestApp()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  async function registerUser(
    overrides: Partial<{ email: string; password: string; firstName: string; lastName: string }> = {}
  ) {
    const payload = {
      email: 'alice@example.com',
      password: 'secret123',
      firstName: 'Alice',
      lastName: 'Doe',
      ...overrides,
    }
    return request(app).post('/api/auth/register').send(payload)
  }

  describe('POST /api/auth/register', () => {
    it('creates a user and returns a token', async () => {
      const response = await registerUser()

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.token).toEqual(expect.any(String))
      expect(response.body.data.user.email).toBe('alice@example.com')
    })

    it('rejects an invalid email format', async () => {
      const response = await registerUser({ email: 'not-an-email' })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })

    it('rejects a password shorter than 6 characters', async () => {
      const response = await registerUser({ password: '12345' })

      expect(response.status).toBe(400)
      expect(response.body.success).toBe(false)
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await registerUser()
    })

    it('returns a token on successful login', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@example.com', password: 'secret123' })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.token).toEqual(expect.any(String))
    })

    it('rejects an unknown user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@example.com', password: 'whatever' })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('rejects a wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'alice@example.com', password: 'wrong-password' })

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })
  })

  describe('protected route /api/participants/me', () => {
    it('returns 401 without a token', async () => {
      const response = await request(app).get('/api/participants/me')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('returns 401 with an invalid token', async () => {
      const response = await request(app).get('/api/participants/me').set('Authorization', 'Bearer not.a.real.token')

      expect(response.status).toBe(401)
      expect(response.body.success).toBe(false)
    })

    it('returns 200 with a valid token', async () => {
      const register = await registerUser()
      const token = register.body.data.token as string

      const response = await request(app).get('/api/participants/me').set('Authorization', `Bearer ${token}`)

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })
})
