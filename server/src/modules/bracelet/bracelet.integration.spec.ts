import type { Express } from 'express'
import request from 'supertest'

import { authHeader, createAdmin, createEvent, createUser } from '../../__tests__/integration/helpers'
import { setupTestApp, teardownTestApp, clearDatabase } from '../../__tests__/integration/setup'

describe('Bracelets integration', () => {
  let app: Express
  let adminToken: string
  let customer: { token: string; userId: string }

  beforeAll(async () => {
    const result = await setupTestApp()
    app = result.app
  }, 60_000)

  afterAll(async () => {
    await teardownTestApp()
  })

  beforeEach(async () => {
    await clearDatabase()
    adminToken = (await createAdmin(app)).token
    const u = await createUser(app)
    customer = { token: u.token, userId: u.userId }
  })

  async function createBraceletViaApi(overrides: Partial<{ nfcId: string }> = {}): Promise<{
    id: string
    nfcId: string
  }> {
    const response = await request(app)
      .post('/api/bracelets')
      .set(authHeader(adminToken))
      .send({ nfcId: overrides.nfcId })
    return { id: response.body.data.id as string, nfcId: response.body.data.nfcId as string }
  }

  describe('POST /api/bracelets', () => {
    it('creates a bracelet for an admin', async () => {
      const response = await request(app).post('/api/bracelets').set(authHeader(adminToken)).send({})

      expect(response.status).toBe(201)
      expect(response.body.data.id).toEqual(expect.any(String))
      expect(response.body.data.nfcId).toEqual(expect.any(String))
      expect(response.body.data.status).toBe('stock')
    })

    it('creates a bracelet with a custom nfcId', async () => {
      const response = await request(app)
        .post('/api/bracelets')
        .set(authHeader(adminToken))
        .send({ nfcId: 'NFC-CUSTOM-1' })

      expect(response.status).toBe(201)
      expect(response.body.data.nfcId).toBe('NFC-CUSTOM-1')
    })

    it('returns 403 for a non-admin', async () => {
      const response = await request(app).post('/api/bracelets').set(authHeader(customer.token)).send({})
      expect(response.status).toBe(403)
    })

    it('returns 401 without a token', async () => {
      const response = await request(app).post('/api/bracelets').send({})
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/bracelets', () => {
    it('returns the list for an admin', async () => {
      await createBraceletViaApi()
      await createBraceletViaApi()

      const response = await request(app).get('/api/bracelets').set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
    })

    it('returns 403 for a non-admin', async () => {
      const response = await request(app).get('/api/bracelets').set(authHeader(customer.token))
      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/bracelets/paginated', () => {
    it('returns paginated bracelets', async () => {
      await createBraceletViaApi()
      await createBraceletViaApi()
      await createBraceletViaApi()

      const response = await request(app).get('/api/bracelets/paginated?page=1&limit=2').set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data.items).toHaveLength(2)
      expect(response.body.data.total).toBe(3)
      expect(response.body.data.totalPages).toBe(2)
    })
  })

  describe('GET /api/bracelets/:id', () => {
    it('returns a bracelet by id', async () => {
      const bracelet = await createBraceletViaApi()
      const response = await request(app).get(`/api/bracelets/${bracelet.id}`).set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data.id).toBe(bracelet.id)
    })

    it('returns 404 for an unknown id', async () => {
      const response = await request(app).get('/api/bracelets/507f1f77bcf86cd799439011').set(authHeader(adminToken))
      expect(response.status).toBe(404)
    })

    it('returns 401 without a token', async () => {
      const bracelet = await createBraceletViaApi()
      const response = await request(app).get(`/api/bracelets/${bracelet.id}`)
      expect(response.status).toBe(401)
    })
  })

  describe('PATCH /api/bracelets/:id/assign', () => {
    it('assigns a bracelet to a user for an event', async () => {
      const bracelet = await createBraceletViaApi()
      const event = await createEvent(app, adminToken)

      const response = await request(app)
        .patch(`/api/bracelets/${bracelet.id}/assign`)
        .set(authHeader(adminToken))
        .send({ userId: customer.userId, eventId: event.id })

      expect(response.status).toBe(200)
      expect(response.body.data.userId).toBe(customer.userId)
      expect(response.body.data.eventId).toBe(event.id)
      expect(response.body.data.status).toBe('pre_activated')
    })

    it('rejects when userId is missing', async () => {
      const bracelet = await createBraceletViaApi()
      const response = await request(app)
        .patch(`/api/bracelets/${bracelet.id}/assign`)
        .set(authHeader(adminToken))
        .send({ eventId: 'event-id' })

      expect(response.status).toBe(400)
    })
  })

  describe('PATCH /api/bracelets/:id/disable', () => {
    it('disables a bracelet', async () => {
      const bracelet = await createBraceletViaApi()
      const response = await request(app).patch(`/api/bracelets/${bracelet.id}/disable`).set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('disabled')
    })
  })

  describe('DELETE /api/bracelets/:id', () => {
    it('soft-deletes a bracelet', async () => {
      const bracelet = await createBraceletViaApi()
      const response = await request(app).delete(`/api/bracelets/${bracelet.id}`).set(authHeader(adminToken))

      expect(response.status).toBe(204)

      const fetch = await request(app).get(`/api/bracelets/${bracelet.id}`).set(authHeader(adminToken))
      expect(fetch.status).toBe(404)
    })

    it('returns 403 for a non-admin', async () => {
      const bracelet = await createBraceletViaApi()
      const response = await request(app).delete(`/api/bracelets/${bracelet.id}`).set(authHeader(customer.token))
      expect(response.status).toBe(403)
    })
  })
})
