import type { Express } from 'express'
import request from 'supertest'

import { authHeader, createAdmin, createEvent, createUser } from '../../__tests__/integration/helpers'
import { setupTestApp, teardownTestApp, clearDatabase } from '../../__tests__/integration/setup'

describe('Check-ins integration', () => {
  let app: Express
  let adminToken: string
  let customer: { token: string; userId: string }
  let eventId: string
  let bracelet: { id: string; nfcId: string }

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

    const created = await request(app).post('/api/bracelets').set(authHeader(adminToken)).send({})
    bracelet = { id: created.body.data.id as string, nfcId: created.body.data.nfcId as string }

    // Assign the bracelet to put it into pre_activated state so it can be checked in.
    await request(app)
      .patch(`/api/bracelets/${bracelet.id}/assign`)
      .set(authHeader(adminToken))
      .send({ userId: customer.userId, eventId })
  })

  describe('POST /api/check-ins', () => {
    it('records a check_in interaction', async () => {
      const response = await request(app).post('/api/check-ins').set(authHeader(adminToken)).send({
        nfcId: bracelet.nfcId,
        eventId,
        interactionType: 'check_in',
      })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.braceletId).toBe(bracelet.id)
      expect(response.body.data.eventId).toBe(eventId)
      expect(response.body.data.interactionType).toBe('check_in')
    })

    it('records a networking interaction', async () => {
      const response = await request(app).post('/api/check-ins').set(authHeader(adminToken)).send({
        nfcId: bracelet.nfcId,
        eventId,
        interactionType: 'networking',
        zoneName: 'lounge',
      })

      expect(response.status).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.data.interactionType).toBe('networking')
      expect(response.body.data.zoneName).toBe('lounge')
    })

    it('rejects a duplicate check_in for the same bracelet+event', async () => {
      await request(app)
        .post('/api/check-ins')
        .set(authHeader(adminToken))
        .send({ nfcId: bracelet.nfcId, eventId, interactionType: 'check_in' })

      const response = await request(app)
        .post('/api/check-ins')
        .set(authHeader(adminToken))
        .send({ nfcId: bracelet.nfcId, eventId, interactionType: 'check_in' })

      expect(response.status).toBe(409)
    })

    it('allows multiple networking interactions on the same bracelet+event', async () => {
      const first = await request(app)
        .post('/api/check-ins')
        .set(authHeader(adminToken))
        .send({ nfcId: bracelet.nfcId, eventId, interactionType: 'networking' })

      const second = await request(app)
        .post('/api/check-ins')
        .set(authHeader(adminToken))
        .send({ nfcId: bracelet.nfcId, eventId, interactionType: 'networking' })

      expect(first.status).toBe(201)
      expect(second.status).toBe(201)
    })

    it('rejects an unknown nfcId', async () => {
      const response = await request(app).post('/api/check-ins').set(authHeader(adminToken)).send({
        nfcId: 'NOT-A-REAL-NFC-ID',
        eventId,
        interactionType: 'check_in',
      })

      expect(response.status).toBe(404)
    })

    it('rejects a check_in for a bracelet in stock (not yet assigned)', async () => {
      const fresh = await request(app).post('/api/bracelets').set(authHeader(adminToken)).send({})
      const response = await request(app).post('/api/check-ins').set(authHeader(adminToken)).send({
        nfcId: fresh.body.data.nfcId,
        eventId,
        interactionType: 'check_in',
      })

      expect(response.status).toBe(400)
    })

    it('rejects an invalid interactionType', async () => {
      const response = await request(app).post('/api/check-ins').set(authHeader(adminToken)).send({
        nfcId: bracelet.nfcId,
        eventId,
        interactionType: 'invalid_type',
      })

      expect(response.status).toBe(400)
    })

    it('returns 401 without a token', async () => {
      const response = await request(app)
        .post('/api/check-ins')
        .send({ nfcId: bracelet.nfcId, eventId, interactionType: 'check_in' })

      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/check-ins/event/:eventId', () => {
    it('returns the check-ins for an event (admin)', async () => {
      await request(app)
        .post('/api/check-ins')
        .set(authHeader(adminToken))
        .send({ nfcId: bracelet.nfcId, eventId, interactionType: 'check_in' })

      const response = await request(app).get(`/api/check-ins/event/${eventId}`).set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(Array.isArray(response.body.data)).toBe(true)
      expect(response.body.data).toHaveLength(1)
    })

    it('returns 403 for a non-admin', async () => {
      const response = await request(app).get(`/api/check-ins/event/${eventId}`).set(authHeader(customer.token))

      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/check-ins/event/:eventId/paginated', () => {
    it('returns paginated check-ins for an event (admin)', async () => {
      await request(app)
        .post('/api/check-ins')
        .set(authHeader(adminToken))
        .send({ nfcId: bracelet.nfcId, eventId, interactionType: 'check_in' })

      const response = await request(app)
        .get(`/api/check-ins/event/${eventId}/paginated?page=1&limit=10`)
        .set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data.total).toBe(1)
    })

    it('returns 403 for a non-admin', async () => {
      const response = await request(app)
        .get(`/api/check-ins/event/${eventId}/paginated`)
        .set(authHeader(customer.token))

      expect(response.status).toBe(403)
    })
  })

  describe('side effects of check_in', () => {
    it('activates a pre_activated bracelet on check_in', async () => {
      await request(app)
        .post('/api/check-ins')
        .set(authHeader(adminToken))
        .send({ nfcId: bracelet.nfcId, eventId, interactionType: 'check_in' })

      const response = await request(app).get(`/api/bracelets/${bracelet.id}`).set(authHeader(adminToken))

      expect(response.body.data.status).toBe('active')
      expect(response.body.data.activatedAt).toEqual(expect.any(String))
    })
  })
})
