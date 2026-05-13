import type { Express } from 'express'
import request from 'supertest'

import { authHeader, createAdmin, createEvent, createUser } from '../../__tests__/integration/helpers'
import { setupTestApp, teardownTestApp, clearDatabase } from '../../__tests__/integration/setup'

describe('Events integration', () => {
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

  describe('POST /api/events', () => {
    it('creates an event for an authenticated user', async () => {
      const startsAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      const endsAt = new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString()

      const response = await request(app)
        .post('/api/events')
        .set(authHeader(adminToken))
        .send({
          name: 'Pulse Demo 2026',
          description: 'Demo event',
          venueName: 'Grand Hall',
          venueAddress: '1 rue de Paris',
          city: 'Paris',
          startsAt,
          endsAt,
          capacity: 500,
          staffCount: 5,
        })

      expect(response.status).toBe(201)
      expect(response.body.data.id).toEqual(expect.any(String))
      expect(response.body.data.slug).toBe('pulse-demo-2026')
      expect(response.body.data.status).toBe('draft')
    })

    it('rejects a missing name', async () => {
      const response = await request(app)
        .post('/api/events')
        .set(authHeader(adminToken))
        .send({ capacity: 100, startsAt: 'x', endsAt: 'y' })

      expect(response.status).toBe(400)
    })

    it('returns 401 without a token', async () => {
      const response = await request(app).post('/api/events').send({ name: 'X' })
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/events/public/:slug', () => {
    it('returns a published event by slug with participantCount', async () => {
      const event = await createEvent(app, adminToken, { name: 'Public Festival' })
      await request(app).post(`/api/events/${event.id}/publish`).set(authHeader(adminToken)).send({})

      const response = await request(app).get(`/api/events/public/${event.slug}`)

      expect(response.status).toBe(200)
      expect(response.body.data.slug).toBe(event.slug)
      expect(response.body.data.participantCount).toBe(0)
    })

    it('returns 404 for a draft event (not yet published)', async () => {
      const event = await createEvent(app, adminToken)
      const response = await request(app).get(`/api/events/public/${event.slug}`)
      expect(response.status).toBe(404)
    })

    it('returns 404 for an unknown slug', async () => {
      const response = await request(app).get('/api/events/public/does-not-exist')
      expect(response.status).toBe(404)
    })

    it('is accessible without authentication', async () => {
      const event = await createEvent(app, adminToken)
      await request(app).post(`/api/events/${event.id}/publish`).set(authHeader(adminToken)).send({})

      const response = await request(app).get(`/api/events/public/${event.slug}`)
      expect(response.status).toBe(200)
    })
  })

  describe('GET /api/events', () => {
    it('returns events owned by the authenticated user', async () => {
      await createEvent(app, adminToken, { name: 'Mine 1' })
      await createEvent(app, adminToken, { name: 'Mine 2' })

      // Another user's event should not appear
      const otherAdmin = await createAdmin(app)
      await createEvent(app, otherAdmin.token, { name: 'Theirs' })

      const response = await request(app).get('/api/events').set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
      expect(response.body.data.map((e: { name: string }) => e.name).sort()).toEqual(['Mine 1', 'Mine 2'])
    })
  })

  describe('GET /api/events/admin', () => {
    it('returns all events for an admin', async () => {
      await createEvent(app, adminToken, { name: 'A' })
      await createEvent(app, adminToken, { name: 'B' })

      const response = await request(app).get('/api/events/admin').set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
    })

    it('returns 403 for a non-admin', async () => {
      const response = await request(app).get('/api/events/admin').set(authHeader(customerToken))
      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/events/:id', () => {
    it('returns an event by id', async () => {
      const event = await createEvent(app, adminToken)
      const response = await request(app).get(`/api/events/${event.id}`).set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data.id).toBe(event.id)
    })

    it('returns 404 for an unknown id', async () => {
      const response = await request(app)
        .get('/api/events/507f1f77bcf86cd799439011')
        .set(authHeader(adminToken))
      expect(response.status).toBe(404)
    })
  })

  describe('PATCH /api/events/:id', () => {
    it('updates an event owned by the user', async () => {
      const event = await createEvent(app, adminToken)
      const response = await request(app)
        .patch(`/api/events/${event.id}`)
        .set(authHeader(adminToken))
        .send({ name: 'Renamed' })

      expect(response.status).toBe(200)
      expect(response.body.data.name).toBe('Renamed')
    })

    it('returns 403 when the user is not the owner', async () => {
      const event = await createEvent(app, adminToken)
      const otherAdmin = await createAdmin(app)
      const response = await request(app)
        .patch(`/api/events/${event.id}`)
        .set(authHeader(otherAdmin.token))
        .send({ name: 'Hijack' })

      expect(response.status).toBe(403)
    })
  })

  describe('event status transitions', () => {
    it('walks an event through draft → upcoming → in_progress → completed', async () => {
      const event = await createEvent(app, adminToken)

      const published = await request(app).post(`/api/events/${event.id}/publish`).set(authHeader(adminToken)).send({})
      expect(published.status).toBe(200)
      expect(published.body.data.status).toBe('upcoming')

      const started = await request(app).post(`/api/events/${event.id}/start`).set(authHeader(adminToken)).send({})
      expect(started.status).toBe(200)
      expect(started.body.data.status).toBe('in_progress')

      const completed = await request(app).post(`/api/events/${event.id}/complete`).set(authHeader(adminToken)).send({})
      expect(completed.status).toBe(200)
      expect(completed.body.data.status).toBe('completed')
    })

    it('cancels a draft event', async () => {
      const event = await createEvent(app, adminToken)
      const response = await request(app).post(`/api/events/${event.id}/cancel`).set(authHeader(adminToken)).send({})

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('cancelled')
    })

    it('rejects publish when user is not the owner', async () => {
      const event = await createEvent(app, adminToken)
      const otherAdmin = await createAdmin(app)
      const response = await request(app)
        .post(`/api/events/${event.id}/publish`)
        .set(authHeader(otherAdmin.token))
        .send({})

      expect(response.status).toBe(403)
    })

    it('rejects an invalid transition (start before publish)', async () => {
      const event = await createEvent(app, adminToken)
      const response = await request(app).post(`/api/events/${event.id}/start`).set(authHeader(adminToken)).send({})

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/events/:id', () => {
    it('soft-deletes an event owned by the user', async () => {
      const event = await createEvent(app, adminToken)
      const response = await request(app).delete(`/api/events/${event.id}`).set(authHeader(adminToken))

      expect(response.status).toBe(204)

      const fetch = await request(app).get(`/api/events/${event.id}`).set(authHeader(adminToken))
      expect(fetch.status).toBe(404)
    })

    it('returns 403 when the user is not the owner', async () => {
      const event = await createEvent(app, adminToken)
      const otherAdmin = await createAdmin(app)
      const response = await request(app).delete(`/api/events/${event.id}`).set(authHeader(otherAdmin.token))

      expect(response.status).toBe(403)
    })
  })
})
