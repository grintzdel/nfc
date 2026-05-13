import type { Express } from 'express'
import request from 'supertest'

import { authHeader, createAdmin, createEvent, createUser } from '../__tests__/integration/helpers'
import { setupTestApp, teardownTestApp, clearDatabase } from '../__tests__/integration/setup'

describe('NFC integration', () => {
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
  })

  async function assignBracelet(): Promise<void> {
    await request(app)
      .patch(`/api/bracelets/${bracelet.id}/assign`)
      .set(authHeader(adminToken))
      .send({ userId: customer.userId, eventId })
  }

  async function registerParticipantAndAttach(): Promise<void> {
    const participant = await request(app)
      .post('/api/participants')
      .set(authHeader(customer.token))
      .send({ eventId, profile: { displayName: 'Jane Doe', bio: 'Hello there' } })
    const participantId = participant.body.data.id as string

    await request(app)
      .patch(`/api/participants/${participantId}/bracelet`)
      .set(authHeader(adminToken))
      .send({ braceletId: bracelet.id })
  }

  describe('GET /api/nfc/:nfcId', () => {
    it('returns the public profile when bracelet is activated and linked to a participant', async () => {
      await assignBracelet()
      await registerParticipantAndAttach()

      const response = await request(app).get(`/api/nfc/${bracelet.nfcId}`)

      expect(response.status).toBe(200)
      expect(response.body.data.bracelet.nfcId).toBe(bracelet.nfcId)
      expect(response.body.data.participant.profile.displayName).toBe('Jane Doe')
      expect(response.body.data.event.id).toBe(eventId)
    })

    it('returns 404 when the nfcId does not exist', async () => {
      const response = await request(app).get('/api/nfc/UNKNOWN-NFC-ID')
      expect(response.status).toBe(404)
    })

    it('returns 404 when the bracelet is still in stock', async () => {
      const response = await request(app).get(`/api/nfc/${bracelet.nfcId}`)
      expect(response.status).toBe(404)
    })

    it('returns 404 when no participant is linked to the bracelet', async () => {
      await assignBracelet()

      const response = await request(app).get(`/api/nfc/${bracelet.nfcId}`)
      expect(response.status).toBe(404)
    })

    it('is accessible without authentication', async () => {
      await assignBracelet()
      await registerParticipantAndAttach()

      const response = await request(app).get(`/api/nfc/${bracelet.nfcId}`)
      expect(response.status).toBe(200)
    })
  })
})
