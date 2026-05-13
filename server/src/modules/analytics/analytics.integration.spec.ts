import type { Express } from 'express'
import request from 'supertest'

import { authHeader, createAdmin, createEvent, createUser } from '../../__tests__/integration/helpers'
import { setupTestApp, teardownTestApp, clearDatabase } from '../../__tests__/integration/setup'

describe('Analytics integration', () => {
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

  const protectedEndpoints = [
    '/api/admin-stats/events/active',
    '/api/admin-stats/events/next',
    '/api/admin-stats/participants/count',
    '/api/admin-stats/bracelets/count',
    '/api/admin-stats/bracelets/stock',
    '/api/admin-stats/bracelets/activations',
    '/api/admin-stats/revenue',
    '/api/admin-stats/interactions',
    '/api/admin-stats/events/page-stats',
  ]

  describe('admin-only access', () => {
    it.each(protectedEndpoints)('returns 401 without a token: %s', async (endpoint) => {
      const response = await request(app).get(endpoint)
      expect(response.status).toBe(401)
    })

    it.each(protectedEndpoints)('returns 403 for a non-admin: %s', async (endpoint) => {
      const response = await request(app).get(endpoint).set(authHeader(customerToken))
      expect(response.status).toBe(403)
    })

    it.each(protectedEndpoints)('returns 200 for an admin: %s', async (endpoint) => {
      const response = await request(app).get(endpoint).set(authHeader(adminToken))
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
    })
  })

  describe('GET /api/admin-stats/events/active', () => {
    it('returns active events with month-over-month stats', async () => {
      const event = await createEvent(app, adminToken)
      await request(app).post(`/api/events/${event.id}/publish`).set(authHeader(adminToken)).send({})

      const response = await request(app).get('/api/admin-stats/events/active').set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(Array.isArray(response.body.data.events)).toBe(true)
      expect(response.body.data.events).toHaveLength(1)
      expect(typeof response.body.data.count).toBe('number')
      expect(typeof response.body.data.diffVsLastMonth).toBe('number')
    })
  })

  describe('GET /api/admin-stats/revenue', () => {
    it('returns revenue stats', async () => {
      const response = await request(app).get('/api/admin-stats/revenue').set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
    })
  })

  describe('GET /api/admin-stats/events/:eventId', () => {
    it('returns detail stats for a known event', async () => {
      const event = await createEvent(app, adminToken)
      const response = await request(app).get(`/api/admin-stats/events/${event.id}`).set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toBeDefined()
    })

    it('returns 403 for a non-admin', async () => {
      const event = await createEvent(app, adminToken)
      const response = await request(app).get(`/api/admin-stats/events/${event.id}`).set(authHeader(customerToken))

      expect(response.status).toBe(403)
    })
  })
})
