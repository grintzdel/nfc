import type { Express } from 'express'
import request from 'supertest'

import { authHeader, createAdmin, createUser } from '../../__tests__/integration/helpers'
import { setupTestApp, teardownTestApp, clearDatabase } from '../../__tests__/integration/setup'

describe('Supply orders integration', () => {
  let app: Express
  let adminToken: string
  let customerToken: string

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
    customerToken = (await createUser(app)).token
  })

  function payload(overrides: Partial<{ units: number; orderedAt: string; estimatedDeliveryDate: string }> = {}) {
    return {
      units: overrides.units ?? 100,
      orderedAt: overrides.orderedAt ?? new Date().toISOString(),
      estimatedDeliveryDate:
        overrides.estimatedDeliveryDate ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }
  }

  describe('POST /api/supply-orders', () => {
    it('creates a supply order for an admin', async () => {
      const response = await request(app).post('/api/supply-orders').set(authHeader(adminToken)).send(payload())

      expect(response.status).toBe(201)
      expect(response.body.data.id).toEqual(expect.any(String))
      expect(response.body.data.units).toBe(100)
      expect(response.body.data.status).toBe('pending')
    })

    it('rejects a non-positive unit count', async () => {
      const response = await request(app)
        .post('/api/supply-orders')
        .set(authHeader(adminToken))
        .send(payload({ units: 0 }))

      expect(response.status).toBe(400)
    })

    it('returns 403 for a non-admin', async () => {
      const response = await request(app).post('/api/supply-orders').set(authHeader(customerToken)).send(payload())

      expect(response.status).toBe(403)
    })

    it('returns 401 without a token', async () => {
      const response = await request(app).post('/api/supply-orders').send(payload())
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/supply-orders', () => {
    it('returns the list for an admin', async () => {
      await request(app).post('/api/supply-orders').set(authHeader(adminToken)).send(payload({ units: 50 }))
      await request(app).post('/api/supply-orders').set(authHeader(adminToken)).send(payload({ units: 75 }))

      const response = await request(app).get('/api/supply-orders').set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
    })

    it('returns 403 for a non-admin', async () => {
      const response = await request(app).get('/api/supply-orders').set(authHeader(customerToken))
      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/supply-orders/:id', () => {
    it('returns a single order', async () => {
      const created = await request(app).post('/api/supply-orders').set(authHeader(adminToken)).send(payload())
      const id = created.body.data.id as string

      const response = await request(app).get(`/api/supply-orders/${id}`).set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data.id).toBe(id)
    })

    it('returns 404 for an unknown id', async () => {
      const response = await request(app)
        .get('/api/supply-orders/507f1f77bcf86cd799439011')
        .set(authHeader(adminToken))
      expect(response.status).toBe(404)
    })
  })

  describe('POST /api/supply-orders/:id/receive', () => {
    it('marks an order as received', async () => {
      const created = await request(app).post('/api/supply-orders').set(authHeader(adminToken)).send(payload())
      const id = created.body.data.id as string

      const response = await request(app).post(`/api/supply-orders/${id}/receive`).set(authHeader(adminToken)).send({})

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('received')
      expect(response.body.data.receivedAt).toEqual(expect.any(String))
    })
  })

  describe('POST /api/supply-orders/:id/cancel', () => {
    it('cancels a pending order', async () => {
      const created = await request(app).post('/api/supply-orders').set(authHeader(adminToken)).send(payload())
      const id = created.body.data.id as string

      const response = await request(app).post(`/api/supply-orders/${id}/cancel`).set(authHeader(adminToken)).send({})

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('cancelled')
    })
  })
})
