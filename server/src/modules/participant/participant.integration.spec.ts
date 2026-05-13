import type { Express } from 'express'
import request from 'supertest'

import { authHeader, createAdmin, createEvent, createUser } from '../../__tests__/integration/helpers'
import { setupTestApp, teardownTestApp, clearDatabase } from '../../__tests__/integration/setup'

describe('Participants integration', () => {
  let app: Express
  let adminToken: string
  let customer: { token: string; userId: string }
  let eventId: string

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
    eventId = (await createEvent(app, adminToken)).id
  })

  function registerPayload(overrides: Partial<{ eventId: string; displayName: string }> = {}) {
    return {
      eventId: overrides.eventId ?? eventId,
      profile: { displayName: overrides.displayName ?? 'Jane Doe' },
    }
  }

  describe('POST /api/participants', () => {
    it('registers the authenticated user for an event', async () => {
      const response = await request(app)
        .post('/api/participants')
        .set(authHeader(customer.token))
        .send(registerPayload())

      expect(response.status).toBe(201)
      expect(response.body.data.userId).toBe(customer.userId)
      expect(response.body.data.eventId).toBe(eventId)
      expect(response.body.data.profile.displayName).toBe('Jane Doe')
    })

    it('rejects a missing eventId', async () => {
      const response = await request(app)
        .post('/api/participants')
        .set(authHeader(customer.token))
        .send({ profile: { displayName: 'X' } })

      expect(response.status).toBe(400)
    })

    it('rejects a missing displayName', async () => {
      const response = await request(app)
        .post('/api/participants')
        .set(authHeader(customer.token))
        .send({ eventId, profile: {} })

      expect(response.status).toBe(400)
    })

    it('rejects double registration for the same event', async () => {
      await request(app).post('/api/participants').set(authHeader(customer.token)).send(registerPayload())
      const response = await request(app)
        .post('/api/participants')
        .set(authHeader(customer.token))
        .send(registerPayload())

      expect(response.status).toBe(409)
    })

    it('returns 404 for an unknown event', async () => {
      const response = await request(app)
        .post('/api/participants')
        .set(authHeader(customer.token))
        .send(registerPayload({ eventId: '507f1f77bcf86cd799439011' }))

      expect(response.status).toBe(404)
    })

    it('returns 401 without a token', async () => {
      const response = await request(app).post('/api/participants').send(registerPayload())
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/participants/me', () => {
    it('returns the participations of the authenticated user', async () => {
      await request(app).post('/api/participants').set(authHeader(customer.token)).send(registerPayload())

      const response = await request(app).get('/api/participants/me').set(authHeader(customer.token))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].event.id).toBe(eventId)
    })

    it('returns an empty list for a user without participations', async () => {
      const response = await request(app).get('/api/participants/me').set(authHeader(customer.token))

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual([])
    })
  })

  describe('GET /api/participants/event/:eventId', () => {
    it('returns the participants of an event for an admin', async () => {
      await request(app).post('/api/participants').set(authHeader(customer.token)).send(registerPayload())

      const response = await request(app).get(`/api/participants/event/${eventId}`).set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    it('returns 403 for a non-admin', async () => {
      const response = await request(app).get(`/api/participants/event/${eventId}`).set(authHeader(customer.token))

      expect(response.status).toBe(403)
    })
  })

  describe('PATCH /api/participants/:id/profile', () => {
    it('updates the profile when the user is the owner', async () => {
      const created = await request(app)
        .post('/api/participants')
        .set(authHeader(customer.token))
        .send(registerPayload())
      const participantId = created.body.data.id as string

      const response = await request(app)
        .patch(`/api/participants/${participantId}/profile`)
        .set(authHeader(customer.token))
        .send({ displayName: 'Renamed', bio: 'New bio' })

      expect(response.status).toBe(200)
      expect(response.body.data.profile.displayName).toBe('Renamed')
      expect(response.body.data.profile.bio).toBe('New bio')
    })

    it('returns 403 when the user is not the owner', async () => {
      const created = await request(app)
        .post('/api/participants')
        .set(authHeader(customer.token))
        .send(registerPayload())
      const participantId = created.body.data.id as string

      const intruder = await createUser(app)
      const response = await request(app)
        .patch(`/api/participants/${participantId}/profile`)
        .set(authHeader(intruder.token))
        .send({ displayName: 'Hijack' })

      expect(response.status).toBe(403)
    })
  })

  describe('DELETE /api/participants/:id', () => {
    it('unregisters when the user is the owner', async () => {
      const created = await request(app)
        .post('/api/participants')
        .set(authHeader(customer.token))
        .send(registerPayload())
      const participantId = created.body.data.id as string

      const response = await request(app).delete(`/api/participants/${participantId}`).set(authHeader(customer.token))

      expect(response.status).toBe(204)
    })
  })
})
