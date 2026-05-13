import type { Express } from 'express'
import request from 'supertest'

import { setupTestApp, teardownTestApp, clearDatabase } from '../../__tests__/integration/setup'
import { FaqModel } from './infrastructure/schema/faq.schema'

describe('Marketing integration', () => {
  let app: Express

  beforeAll(async () => {
    const result = await setupTestApp()
    app = result.app
  }, 60_000)

  afterAll(async () => {
    await teardownTestApp()
  })

  beforeEach(async () => {
    await clearDatabase()
  })

  describe('GET /api/marketing/faqs', () => {
    it('returns an empty list when no FAQs exist', async () => {
      const response = await request(app).get('/api/marketing/faqs')

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.data).toEqual([])
    })

    it('returns FAQs sorted by order ascending', async () => {
      await FaqModel.create([
        { question: 'B?', answer: 'b', order: 2 },
        { question: 'A?', answer: 'a', order: 1 },
        { question: 'C?', answer: 'c', order: 3 },
      ])

      const response = await request(app).get('/api/marketing/faqs')

      expect(response.status).toBe(200)
      expect(response.body.data).toHaveLength(3)
      expect(response.body.data.map((f: { question: string }) => f.question)).toEqual(['A?', 'B?', 'C?'])
    })

    it('excludes soft-deleted FAQs', async () => {
      await FaqModel.create([
        { question: 'Active', answer: 'a', order: 1 },
        { question: 'Deleted', answer: 'd', order: 2, deletedAt: new Date() },
      ])

      const response = await request(app).get('/api/marketing/faqs')

      expect(response.body.data).toHaveLength(1)
      expect(response.body.data[0].question).toBe('Active')
    })

    it('is accessible without authentication', async () => {
      const response = await request(app).get('/api/marketing/faqs')
      expect(response.status).toBe(200)
    })
  })
})
