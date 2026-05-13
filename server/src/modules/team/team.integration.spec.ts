import type { Express } from 'express'
import request from 'supertest'

import { authHeader, createAdmin, createEvent, createUser } from '../../__tests__/integration/helpers'
import { setupTestApp, teardownTestApp, clearDatabase } from '../../__tests__/integration/setup'

describe('Teams integration', () => {
  let app: Express
  let owner: { token: string; userId: string }
  let target: { token: string; userId: string }
  let intruder: { token: string; userId: string }
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
    const o = await createAdmin(app)
    owner = { token: o.token, userId: o.userId }
    const t = await createUser(app)
    target = { token: t.token, userId: t.userId }
    const i = await createUser(app)
    intruder = { token: i.token, userId: i.userId }
    eventId = (await createEvent(app, owner.token)).id
  })

  describe('POST /api/teams/events/:eventId/invite', () => {
    it('lets the event owner invite a user as staff', async () => {
      const response = await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(owner.token))
        .send({ userId: target.userId, role: 'staff' })

      expect(response.status).toBe(201)
      expect(response.body.data.userId).toBe(target.userId)
      expect(response.body.data.role).toBe('staff')
      expect(response.body.data.acceptedAt).toBeNull()
    })

    it('rejects an invitation from a non-owner / non-manager', async () => {
      const response = await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(intruder.token))
        .send({ userId: target.userId, role: 'staff' })

      expect(response.status).toBe(403)
    })

    it('rejects role=owner', async () => {
      const response = await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(owner.token))
        .send({ userId: target.userId, role: 'owner' })

      expect(response.status).toBe(400)
    })

    it('rejects an unknown target user', async () => {
      const response = await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(owner.token))
        .send({ userId: '507f1f77bcf86cd799439011', role: 'staff' })

      expect(response.status).toBe(404)
    })

    it('rejects a duplicate invitation', async () => {
      await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(owner.token))
        .send({ userId: target.userId, role: 'staff' })

      const response = await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(owner.token))
        .send({ userId: target.userId, role: 'staff' })

      expect(response.status).toBe(409)
    })
  })

  describe('GET /api/teams/events/:eventId', () => {
    it('lists team members for an admin', async () => {
      await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(owner.token))
        .send({ userId: target.userId, role: 'staff' })

      const response = await request(app).get(`/api/teams/events/${eventId}`).set(authHeader(owner.token))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    it('returns 403 for a non-admin', async () => {
      const response = await request(app).get(`/api/teams/events/${eventId}`).set(authHeader(target.token))
      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/teams/me', () => {
    it('returns memberships of the authenticated user', async () => {
      await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(owner.token))
        .send({ userId: target.userId, role: 'manager' })

      const response = await request(app).get('/api/teams/me').set(authHeader(target.token))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].role).toBe('manager')
    })
  })

  describe('POST /api/teams/:id/accept', () => {
    it('accepts an invitation', async () => {
      const invite = await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(owner.token))
        .send({ userId: target.userId, role: 'staff' })
      const inviteId = invite.body.data.id as string

      const response = await request(app).post(`/api/teams/${inviteId}/accept`).set(authHeader(target.token)).send({})

      expect(response.status).toBe(200)
      expect(response.body.data.acceptedAt).toEqual(expect.any(String))
    })

    it('returns 403 when accepted by someone else', async () => {
      const invite = await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(owner.token))
        .send({ userId: target.userId, role: 'staff' })
      const inviteId = invite.body.data.id as string

      const response = await request(app).post(`/api/teams/${inviteId}/accept`).set(authHeader(intruder.token)).send({})

      expect(response.status).toBe(403)
    })
  })

  describe('PATCH /api/teams/:id/role', () => {
    it('changes the role when called by the owner', async () => {
      const invite = await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(owner.token))
        .send({ userId: target.userId, role: 'staff' })
      const inviteId = invite.body.data.id as string

      const response = await request(app)
        .patch(`/api/teams/${inviteId}/role`)
        .set(authHeader(owner.token))
        .send({ role: 'manager' })

      expect(response.status).toBe(200)
      expect(response.body.data.role).toBe('manager')
    })

    it('returns 403 when called by a non-owner', async () => {
      const invite = await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(owner.token))
        .send({ userId: target.userId, role: 'staff' })
      const inviteId = invite.body.data.id as string

      const response = await request(app)
        .patch(`/api/teams/${inviteId}/role`)
        .set(authHeader(intruder.token))
        .send({ role: 'manager' })

      expect(response.status).toBe(403)
    })
  })

  describe('DELETE /api/teams/:id', () => {
    it('revokes a member when called by the owner', async () => {
      const invite = await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(owner.token))
        .send({ userId: target.userId, role: 'staff' })
      const inviteId = invite.body.data.id as string

      const response = await request(app).delete(`/api/teams/${inviteId}`).set(authHeader(owner.token))

      expect(response.status).toBe(204)
    })

    it('returns 403 when called by a non-owner', async () => {
      const invite = await request(app)
        .post(`/api/teams/events/${eventId}/invite`)
        .set(authHeader(owner.token))
        .send({ userId: target.userId, role: 'staff' })
      const inviteId = invite.body.data.id as string

      const response = await request(app).delete(`/api/teams/${inviteId}`).set(authHeader(intruder.token))

      expect(response.status).toBe(403)
    })
  })
})
