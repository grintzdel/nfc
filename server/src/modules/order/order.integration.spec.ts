import type { Express } from 'express'
import request from 'supertest'

import { authHeader, createAdmin, createProduct, createUser } from '../../__tests__/integration/helpers'
import { setupTestApp, teardownTestApp, clearDatabase } from '../../__tests__/integration/setup'

describe('Orders integration', () => {
  let app: Express
  let userToken: string
  let adminToken: string
  let productId: string

  beforeAll(async () => {
    const result = await setupTestApp()
    app = result.app
  }, 60_000)

  afterAll(async () => {
    await teardownTestApp()
  })

  beforeEach(async () => {
    await clearDatabase()
    userToken = (await createUser(app)).token
    adminToken = (await createAdmin(app)).token
    productId = (await createProduct(app, adminToken, { price: 19.9, stock: 100 })).id
  })

  async function fillCart(token: string, quantity = 2): Promise<void> {
    await request(app).post('/api/cart/items').set(authHeader(token)).send({ productId, quantity })
  }

  describe('POST /api/orders', () => {
    it('creates an order from a non-empty cart and clears the cart', async () => {
      await fillCart(userToken, 3)

      const response = await request(app)
        .post('/api/orders')
        .set(authHeader(userToken))
        .send({ shippingAddress: '1 rue de la Paix, 75002 Paris' })

      expect(response.status).toBe(201)
      expect(response.body.data.id).toEqual(expect.any(String))
      expect(response.body.data.items).toHaveLength(1)
      expect(response.body.data.items[0].quantity).toBe(3)
      expect(response.body.data.status).toBe('pending')

      const cart = await request(app).get('/api/cart').set(authHeader(userToken))
      expect(cart.body.data).toEqual([])
    })

    it('rejects an order when the cart is empty', async () => {
      const response = await request(app)
        .post('/api/orders')
        .set(authHeader(userToken))
        .send({ shippingAddress: '1 rue de la Paix' })

      expect(response.status).toBe(400)
    })

    it('rejects an order when shippingAddress is missing', async () => {
      await fillCart(userToken)
      const response = await request(app).post('/api/orders').set(authHeader(userToken)).send({})

      expect(response.status).toBe(400)
    })

    it('returns 401 without a token', async () => {
      const response = await request(app).post('/api/orders').send({ shippingAddress: 'X' })
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/orders', () => {
    it('returns the orders of the authenticated user', async () => {
      await fillCart(userToken)
      await request(app).post('/api/orders').set(authHeader(userToken)).send({ shippingAddress: 'A' })
      await fillCart(userToken)
      await request(app).post('/api/orders').set(authHeader(userToken)).send({ shippingAddress: 'B' })

      const response = await request(app).get('/api/orders').set(authHeader(userToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(2)
    })

    it('does not leak another user orders', async () => {
      await fillCart(userToken)
      await request(app).post('/api/orders').set(authHeader(userToken)).send({ shippingAddress: 'A' })

      const otherUser = await createUser(app)
      const response = await request(app).get('/api/orders').set(authHeader(otherUser.token))

      expect(response.body.data).toEqual([])
    })
  })

  describe('GET /api/orders/admin', () => {
    it('returns all orders for an admin', async () => {
      await fillCart(userToken)
      await request(app).post('/api/orders').set(authHeader(userToken)).send({ shippingAddress: 'A' })

      const response = await request(app).get('/api/orders/admin').set(authHeader(adminToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    it('returns 403 for a non-admin', async () => {
      const response = await request(app).get('/api/orders/admin').set(authHeader(userToken))
      expect(response.status).toBe(403)
    })
  })

  describe('GET /api/orders/:id', () => {
    it('returns an order by id', async () => {
      await fillCart(userToken)
      const created = await request(app)
        .post('/api/orders')
        .set(authHeader(userToken))
        .send({ shippingAddress: 'A' })
      const orderId = created.body.data.id as string

      const response = await request(app).get(`/api/orders/${orderId}`).set(authHeader(userToken))

      expect(response.status).toBe(200)
      expect(response.body.data.id).toBe(orderId)
    })

    it('returns 404 for an unknown id', async () => {
      const response = await request(app)
        .get('/api/orders/507f1f77bcf86cd799439011')
        .set(authHeader(userToken))
      expect(response.status).toBe(404)
    })
  })

  describe('PATCH /api/orders/:id/status', () => {
    it('updates the status when called by an admin', async () => {
      await fillCart(userToken)
      const created = await request(app)
        .post('/api/orders')
        .set(authHeader(userToken))
        .send({ shippingAddress: 'A' })
      const orderId = created.body.data.id as string

      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set(authHeader(adminToken))
        .send({ status: 'confirmed' })

      expect(response.status).toBe(200)
      expect(response.body.data.status).toBe('confirmed')
    })

    it('rejects an invalid status', async () => {
      await fillCart(userToken)
      const created = await request(app)
        .post('/api/orders')
        .set(authHeader(userToken))
        .send({ shippingAddress: 'A' })
      const orderId = created.body.data.id as string

      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set(authHeader(adminToken))
        .send({ status: 'unknown' })

      expect(response.status).toBe(400)
    })

    it('returns 403 for a non-admin', async () => {
      await fillCart(userToken)
      const created = await request(app)
        .post('/api/orders')
        .set(authHeader(userToken))
        .send({ shippingAddress: 'A' })
      const orderId = created.body.data.id as string

      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set(authHeader(userToken))
        .send({ status: 'confirmed' })

      expect(response.status).toBe(403)
    })
  })
})
