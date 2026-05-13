import type { Express } from 'express'
import request from 'supertest'

import { UserModel } from '../../modules/auth/infrastructure/schema/user.schema'

export interface AuthFixture {
  token: string
  userId: string
  email: string
}

let userCounter = 0

function nextEmail(prefix: string): string {
  userCounter++
  return `${prefix}+${userCounter}@example.com`
}

export async function createUser(
  app: Express,
  overrides: Partial<{ email: string; password: string; firstName: string; lastName: string }> = {}
): Promise<AuthFixture> {
  const email = overrides.email ?? nextEmail('user')
  const password = overrides.password ?? 'secret123'
  const response = await request(app)
    .post('/api/auth/register')
    .send({
      email,
      password,
      firstName: overrides.firstName ?? 'User',
      lastName: overrides.lastName ?? 'Doe',
    })

  return {
    token: response.body.data.token as string,
    userId: response.body.data.user.id as string,
    email,
  }
}

export async function createAdmin(
  app: Express,
  overrides: Partial<{ email: string; password: string; firstName: string; lastName: string }> = {}
): Promise<AuthFixture> {
  const email = overrides.email ?? nextEmail('admin')
  const password = overrides.password ?? 'secret123'

  await request(app)
    .post('/api/auth/register')
    .send({
      email,
      password,
      firstName: overrides.firstName ?? 'Admin',
      lastName: overrides.lastName ?? 'Root',
    })

  await UserModel.updateOne({ email }, { $set: { role: 'admin' } })

  const login = await request(app).post('/api/auth/login').send({ email, password })
  return {
    token: login.body.data.token as string,
    userId: login.body.data.user.id as string,
    email,
  }
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` }
}

export async function createProduct(
  app: Express,
  adminToken: string,
  overrides: Partial<{ name: string; price: number; description: string; stock: number }> = {}
): Promise<{ id: string; slug: string }> {
  const response = await request(app)
    .post('/api/products')
    .set(authHeader(adminToken))
    .send({
      name: overrides.name ?? 'PULSE Pass',
      price: overrides.price ?? 19.9,
      description: overrides.description ?? 'A pass for the event',
      stock: overrides.stock ?? 100,
    })
  return { id: response.body.data.id as string, slug: response.body.data.slug as string }
}

let eventCounter = 0

export async function createEvent(
  app: Express,
  adminToken: string,
  overrides: Partial<{
    name: string
    venueName: string
    venueAddress: string
    city: string
    startsAt: string
    endsAt: string
    description: string
    capacity: number
    staffCount: number
  }> = {}
): Promise<{ id: string; slug: string; ownerId: string }> {
  eventCounter++
  const startsAt = overrides.startsAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  const endsAt = overrides.endsAt ?? new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString()
  const response = await request(app)
    .post('/api/events')
    .set(authHeader(adminToken))
    .send({
      name: overrides.name ?? `Pulse Demo ${eventCounter}`,
      venueName: overrides.venueName ?? 'Grand Hall',
      venueAddress: overrides.venueAddress ?? '1 rue de Paris, 75001 Paris',
      city: overrides.city ?? 'Paris',
      startsAt,
      endsAt,
      description: overrides.description ?? 'A test event',
      capacity: overrides.capacity ?? 500,
      staffCount: overrides.staffCount ?? 5,
    })
  return {
    id: response.body.data.id as string,
    slug: response.body.data.slug as string,
    ownerId: response.body.data.ownerId as string,
  }
}

export async function createBracelet(
  app: Express,
  adminToken: string,
  overrides: Partial<{ nfcId: string; productId: string }> = {}
): Promise<{ id: string; nfcId: string }> {
  const response = await request(app)
    .post('/api/bracelets')
    .set(authHeader(adminToken))
    .send({
      nfcId: overrides.nfcId,
      productId: overrides.productId,
    })
  return { id: response.body.data.id as string, nfcId: response.body.data.nfcId as string }
}
