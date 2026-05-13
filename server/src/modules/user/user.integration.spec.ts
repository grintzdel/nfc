import type { Express } from 'express'
import request from 'supertest'

import { authHeader, createAdmin, createUser } from '../../__tests__/integration/helpers'
import { setupTestApp, teardownTestApp, clearDatabase } from '../../__tests__/integration/setup'

describe('Users integration', () => {
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

  describe('GET /api/users/me', () => {
    it('returns the authenticated user', async () => {
      const user = await createUser(app, { firstName: 'Alice', lastName: 'Doe' })
      const response = await request(app).get('/api/users/me').set(authHeader(user.token))

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data.email).toBe(user.email)
      expect(response.body.data.firstName).toBe('Alice')
      expect(response.body.data.role).toBe('customer')
    })

    it('returns 401 without a token', async () => {
      const response = await request(app).get('/api/users/me')
      expect(response.status).toBe(401)
    })
  })

  describe('PATCH /api/users/me', () => {
    it('updates the authenticated user', async () => {
      const user = await createUser(app)
      const response = await request(app)
        .patch('/api/users/me')
        .set(authHeader(user.token))
        .send({ firstName: 'Updated', lastName: 'Name' })

      expect(response.status).toBe(200)
      expect(response.body.data.firstName).toBe('Updated')
      expect(response.body.data.lastName).toBe('Name')
    })

    it('returns 401 without a token', async () => {
      const response = await request(app).patch('/api/users/me').send({ firstName: 'Foo' })
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/users', () => {
    it('returns the user list for an admin', async () => {
      const admin = await createAdmin(app)
      await createUser(app)
      await createUser(app)

      const response = await request(app).get('/api/users').set(authHeader(admin.token))

      expect(response.status).toBe(200)
      expect(response.body.data.length).toBeGreaterThanOrEqual(3)
    })

    it('returns 403 for a non-admin', async () => {
      const user = await createUser(app)
      const response = await request(app).get('/api/users').set(authHeader(user.token))

      expect(response.status).toBe(403)
    })

    it('returns 401 without a token', async () => {
      const response = await request(app).get('/api/users')
      expect(response.status).toBe(401)
    })
  })
})
