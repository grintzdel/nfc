import type { Express } from 'express'
import request from 'supertest'

import { authHeader, createAdmin, createProduct, createUser } from '../../__tests__/integration/helpers'
import { setupTestApp, teardownTestApp, clearDatabase } from '../../__tests__/integration/setup'

describe('Cart integration', () => {
  let app: Express
  let userToken: string
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
    const adminToken = (await createAdmin(app)).token
    productId = (await createProduct(app, adminToken)).id
  })

  describe('POST /api/cart/items', () => {
    it('adds an item to the cart', async () => {
      const response = await request(app)
        .post('/api/cart/items')
        .set(authHeader(userToken))
        .send({ productId, quantity: 2 })

      expect(response.status).toBe(201)
      expect(response.body.data.productId).toBe(productId)
      expect(response.body.data.quantity).toBe(2)
    })

    it('defaults quantity to 1 when not provided', async () => {
      const response = await request(app).post('/api/cart/items').set(authHeader(userToken)).send({ productId })

      expect(response.status).toBe(201)
      expect(response.body.data.quantity).toBe(1)
    })

    it('rejects a missing productId', async () => {
      const response = await request(app).post('/api/cart/items').set(authHeader(userToken)).send({ quantity: 2 })
      expect(response.status).toBe(400)
    })

    it('returns 401 without a token', async () => {
      const response = await request(app).post('/api/cart/items').send({ productId, quantity: 1 })
      expect(response.status).toBe(401)
    })
  })

  describe('GET /api/cart', () => {
    it('returns the items in the cart', async () => {
      await request(app).post('/api/cart/items').set(authHeader(userToken)).send({ productId, quantity: 2 })

      const response = await request(app).get('/api/cart').set(authHeader(userToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(1)
    })

    it('returns an empty list when the cart is empty', async () => {
      const response = await request(app).get('/api/cart').set(authHeader(userToken))

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual([])
    })

    it('does not leak another user cart', async () => {
      await request(app).post('/api/cart/items').set(authHeader(userToken)).send({ productId, quantity: 2 })

      const otherUser = await createUser(app)
      const response = await request(app).get('/api/cart').set(authHeader(otherUser.token))

      expect(response.status).toBe(200)
      expect(response.body.data).toEqual([])
    })
  })

  describe('PATCH /api/cart/items/:id', () => {
    it('updates the quantity of a cart item', async () => {
      const added = await request(app)
        .post('/api/cart/items')
        .set(authHeader(userToken))
        .send({ productId, quantity: 1 })
      const itemId = added.body.data.id as string

      const response = await request(app)
        .patch(`/api/cart/items/${itemId}`)
        .set(authHeader(userToken))
        .send({ quantity: 5 })

      expect(response.status).toBe(200)
      expect(response.body.data.quantity).toBe(5)
    })

    it('rejects a quantity below 1', async () => {
      const added = await request(app)
        .post('/api/cart/items')
        .set(authHeader(userToken))
        .send({ productId, quantity: 1 })
      const itemId = added.body.data.id as string

      const response = await request(app)
        .patch(`/api/cart/items/${itemId}`)
        .set(authHeader(userToken))
        .send({ quantity: 0 })

      expect(response.status).toBe(400)
    })
  })

  describe('DELETE /api/cart/items/:id', () => {
    it('removes a cart item', async () => {
      const added = await request(app)
        .post('/api/cart/items')
        .set(authHeader(userToken))
        .send({ productId, quantity: 1 })
      const itemId = added.body.data.id as string

      const response = await request(app).delete(`/api/cart/items/${itemId}`).set(authHeader(userToken))

      expect(response.status).toBe(200)

      const list = await request(app).get('/api/cart').set(authHeader(userToken))
      expect(list.body.data).toEqual([])
    })
  })

  describe('DELETE /api/cart', () => {
    it('clears the entire cart', async () => {
      await request(app).post('/api/cart/items').set(authHeader(userToken)).send({ productId, quantity: 1 })
      await request(app).post('/api/cart/items').set(authHeader(userToken)).send({ productId, quantity: 2 })

      const response = await request(app).delete('/api/cart').set(authHeader(userToken))

      expect(response.status).toBe(200)

      const list = await request(app).get('/api/cart').set(authHeader(userToken))
      expect(list.body.data).toEqual([])
    })
  })
})
