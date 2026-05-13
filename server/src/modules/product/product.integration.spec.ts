import type { Express } from 'express'
import request from 'supertest'

import { setupTestApp, teardownTestApp, clearDatabase } from '../../__tests__/integration/setup'
import { UserModel } from '../auth/infrastructure/schema/user.schema'

describe('Products CRUD integration', () => {
  let app: Express
  let adminToken: string
  let customerToken: string

  async function adminLogin(): Promise<string> {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'admin@example.com', password: 'secret123', firstName: 'Admin', lastName: 'Root' })

    await UserModel.updateOne({ email: 'admin@example.com' }, { $set: { role: 'admin' } })

    const login = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'secret123' })
    return login.body.data.token as string
  }

  async function customerLogin(): Promise<string> {
    const register = await request(app)
      .post('/api/auth/register')
      .send({ email: 'bob@example.com', password: 'secret123', firstName: 'Bob', lastName: 'Doe' })
    return register.body.data.token as string
  }

  beforeAll(async () => {
    const result = await setupTestApp()
    app = result.app
  }, 60_000)

  afterAll(async () => {
    await teardownTestApp()
  })

  beforeEach(async () => {
    await clearDatabase()
    adminToken = await adminLogin()
    customerToken = await customerLogin()
  })

  describe('full CRUD lifecycle', () => {
    it('creates, reads, updates and deletes a product end-to-end', async () => {
      const created = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'PULSE Pro', price: 49.9, description: 'Le pass premium', stock: 50 })

      expect(created.status).toBe(201)
      expect(created.body.success).toBe(true)
      expect(created.body.data.id).toEqual(expect.any(String))
      expect(created.body.data.slug).toBe('pulse-pro')
      const productId = created.body.data.id as string

      const list = await request(app).get('/api/products')
      expect(list.status).toBe(200)
      expect(list.body.data).toHaveLength(1)
      expect(list.body.data[0].name).toBe('PULSE Pro')

      const updated = await request(app)
        .patch(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 39.9, stock: 30 })

      expect(updated.status).toBe(200)
      expect(updated.body.data.price).toBe(39.9)
      expect(updated.body.data.stock).toBe(30)

      const deleted = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
      expect(deleted.status).toBe(200)

      const finalList = await request(app).get('/api/products')
      expect(finalList.body.data).toHaveLength(0)
    })
  })

  describe('validation errors', () => {
    it('rejects a product with missing name', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 19.9 })

      expect(response.status).toBe(400)
      expect(response.body.error).toMatch(/name/i)
    })

    it('rejects a product with negative price', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Cheap', price: -5 })

      expect(response.status).toBe(400)
      expect(response.body.error).toMatch(/price/i)
    })
  })

  describe('permission errors', () => {
    it('forbids product creation for a non-admin', async () => {
      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ name: 'PULSE Pro', price: 49.9 })

      expect(response.status).toBe(403)
      expect(response.body.error).toMatch(/admin/i)
    })

    it('forbids product deletion without authentication', async () => {
      const response = await request(app).delete('/api/products/some-id')

      expect(response.status).toBe(401)
    })
  })

  describe('not found', () => {
    it('returns 404 for an unknown slug', async () => {
      const response = await request(app).get('/api/products/does-not-exist')

      expect(response.status).toBe(404)
    })
  })
})
