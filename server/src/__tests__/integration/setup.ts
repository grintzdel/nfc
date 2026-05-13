import type { Express } from 'express'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

import { createApp } from '../../create-app'

let mongoServer: MongoMemoryServer | null = null

export async function setupTestApp(): Promise<{ app: Express }> {
  process.env.NODE_ENV = 'test'
  process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-key'
  process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '1h'

  mongoServer = await MongoMemoryServer.create()
  await mongoose.connect(mongoServer.getUri())

  const app = createApp()
  return { app }
}

export async function teardownTestApp(): Promise<void> {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
    mongoServer = null
  }
}

export async function clearDatabase(): Promise<void> {
  const collections = Object.values(mongoose.connection.collections)
  await Promise.all(collections.map((c) => c.deleteMany({})))
}
