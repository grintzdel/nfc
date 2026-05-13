# Backend E-commerce + Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Express/MongoDB backend API for PULSE (NFC event bracelet) covering auth (register/login/JWT) and e-commerce (products, cart, orders).

**Architecture:** Clean Architecture with modules (auth, product, cart, order). Each module has domain/ (entity, repository interface, errors, constants), application/ (use-cases, services, security), infrastructure/ (mongoose schema, repository impl), presentation/ (controllers, DTOs). Entity pattern follows kairos-crm: private constructor, readonly props object, factory methods, business methods returning `this`, no setters.

**Tech Stack:** Node.js, Express, MongoDB/Mongoose, bcryptjs, jsonwebtoken, TypeScript, Jest, mongodb-memory-server

**Reference project:** `/Users/maoudin/Desktop/Developer/eemi/cours/vue-node-2/server/` — same architecture, adapt patterns.

---

## File Map

```
server/
├── package.json
├── tsconfig.json
├── jest.config.ts
├── .env
├── src/
│   ├── @types/
│   │   └── global.d.ts                          # Nullable<T>, Express req.user augment
│   ├── config/
│   │   └── database.ts                          # Mongoose connection
│   ├── shared/
│   │   ├── errors/
│   │   │   └── app.error.ts                     # AppError base class
│   │   └── middlewares/
│   │       ├── auth.middleware.ts                # JWT verification → req.user
│   │       ├── logger.middleware.ts              # HTTP method, URL, duration
│   │       └── error-handler.middleware.ts       # Global error → JSON response
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.module.ts
│   │   │   ├── domain/
│   │   │   │   ├── entity/user.entity.ts
│   │   │   │   ├── constants/auth.constant.ts
│   │   │   │   ├── errors/auth.error.ts
│   │   │   │   └── repository/user.repository.interface.ts
│   │   │   ├── application/
│   │   │   │   ├── services/
│   │   │   │   │   ├── auth.service.ts
│   │   │   │   │   └── security/
│   │   │   │   │       ├── hash.service-security.ts
│   │   │   │   │       └── jwt.service-security.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── register/register.use-case.ts
│   │   │   │       └── login/login.use-case.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── schema/user.schema.ts
│   │   │   │   └── repository/user.repository.mongoose-mongo.ts
│   │   │   └── presentation/
│   │   │       ├── controllers/auth.controller.ts
│   │   │       └── dto/
│   │   │           ├── register.request.dto.ts
│   │   │           ├── login.request.dto.ts
│   │   │           └── auth.response.dto.ts
│   │   ├── user/
│   │   │   ├── user.module.ts
│   │   │   ├── application/
│   │   │   │   ├── services/user.service.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── get-me/get-me.use-case.ts
│   │   │   │       ├── update-me/update-me.use-case.ts
│   │   │   │       └── get-all-users/get-all-users.use-case.ts
│   │   │   └── presentation/
│   │   │       ├── controllers/user.controller.ts
│   │   │       └── dto/
│   │   │           ├── update-user.request.dto.ts
│   │   │           └── user.response.dto.ts
│   │   ├── product/
│   │   │   ├── product.module.ts
│   │   │   ├── domain/
│   │   │   │   ├── entity/product.entity.ts
│   │   │   │   ├── constants/product.constant.ts
│   │   │   │   ├── errors/product.error.ts
│   │   │   │   └── repository/product.repository.interface.ts
│   │   │   ├── application/
│   │   │   │   ├── services/product.service.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── create-product/create-product.use-case.ts
│   │   │   │       ├── get-all-products/get-all-products.use-case.ts
│   │   │   │       ├── get-product-by-slug/get-product-by-slug.use-case.ts
│   │   │   │       ├── get-featured-products/get-featured-products.use-case.ts
│   │   │   │       ├── update-product/update-product.use-case.ts
│   │   │   │       └── delete-product/delete-product.use-case.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── schema/product.schema.ts
│   │   │   │   └── repository/product.repository.mongoose-mongo.ts
│   │   │   └── presentation/
│   │   │       ├── controllers/product.controller.ts
│   │   │       └── dto/
│   │   │           ├── create-product.request.dto.ts
│   │   │           ├── update-product.request.dto.ts
│   │   │           └── product.response.dto.ts
│   │   ├── cart/
│   │   │   ├── cart.module.ts
│   │   │   ├── domain/
│   │   │   │   ├── entity/cart-item.entity.ts
│   │   │   │   ├── constants/cart.constant.ts
│   │   │   │   ├── errors/cart.error.ts
│   │   │   │   └── repository/cart-item.repository.interface.ts
│   │   │   ├── application/
│   │   │   │   ├── services/cart.service.ts
│   │   │   │   └── use-cases/
│   │   │   │       ├── add-to-cart/add-to-cart.use-case.ts
│   │   │   │       ├── get-cart/get-cart.use-case.ts
│   │   │   │       ├── update-cart-item/update-cart-item.use-case.ts
│   │   │   │       ├── remove-cart-item/remove-cart-item.use-case.ts
│   │   │   │       └── clear-cart/clear-cart.use-case.ts
│   │   │   ├── infrastructure/
│   │   │   │   ├── schema/cart-item.schema.ts
│   │   │   │   └── repository/cart-item.repository.mongoose-mongo.ts
│   │   │   └── presentation/
│   │   │       ├── controllers/cart.controller.ts
│   │   │       └── dto/
│   │   │           ├── add-to-cart.request.dto.ts
│   │   │           ├── update-cart-item.request.dto.ts
│   │   │           └── cart-item.response.dto.ts
│   │   └── order/
│   │       ├── order.module.ts
│   │       ├── domain/
│   │       │   ├── entity/order.entity.ts
│   │       │   ├── constants/order.constant.ts
│   │       │   ├── errors/order.error.ts
│   │       │   └── repository/order.repository.interface.ts
│   │       ├── application/
│   │       │   ├── services/order.service.ts
│   │       │   └── use-cases/
│   │       │       ├── create-order/create-order.use-case.ts
│   │       │       ├── get-my-orders/get-my-orders.use-case.ts
│   │       │       ├── get-order-by-id/get-order-by-id.use-case.ts
│   │       │       ├── get-all-orders/get-all-orders.use-case.ts
│   │       │       └── update-order-status/update-order-status.use-case.ts
│   │       ├── infrastructure/
│   │       │   ├── schema/order.schema.ts
│   │       │   └── repository/order.repository.mongoose-mongo.ts
│   │       └── presentation/
│   │           ├── controllers/order.controller.ts
│   │           └── dto/
│   │               ├── create-order.request.dto.ts
│   │               ├── update-order-status.request.dto.ts
│   │               └── order.response.dto.ts
│   ├── seed.ts
│   └── main.ts
```

---

## Task 1: Project Scaffold

**Files:**

- Create: `server/package.json`
- Create: `server/tsconfig.json`
- Create: `server/jest.config.ts`
- Create: `server/.env`
- Create: `package.json` (root workspace)

- [ ] **Step 1: Create root package.json**

```json
{
  "name": "pulse-nfc",
  "private": true,
  "scripts": {
    "dev": "concurrently -n server,client -c blue,green \"pnpm run dev:server\" \"pnpm run dev:client\"",
    "dev:server": "cd server && pnpm run dev",
    "dev:client": "cd client && pnpm run dev",
    "build": "cd client && pnpm build && cd ../server && pnpm build",
    "seed": "cd server && pnpm run seed",
    "test:server": "cd server && pnpm test"
  },
  "devDependencies": {
    "concurrently": "^9.1.2"
  }
}
```

- [ ] **Step 2: Create server/package.json**

```json
{
  "name": "pulse-server",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/main.ts",
    "build": "tsc",
    "start": "node dist/main.js",
    "test": "jest --passWithNoTests",
    "test:watch": "jest --watch",
    "seed": "ts-node-dev --transpile-only src/seed.ts"
  },
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.6",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "jsonwebtoken": "^9.0.2",
    "mongoose": "^8.8.0"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.0",
    "@types/jest": "^29.5.14",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/ms": "^2.1.0",
    "@types/node": "^22.9.0",
    "jest": "^29.7.0",
    "mongodb-memory-server": "^10.4.0",
    "ts-jest": "^29.2.5",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 3: Create server/tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "baseUrl": "./src",
    "paths": {
      "@modules/*": ["modules/*"],
      "@shared/*": ["shared/*"],
      "@config/*": ["config/*"]
    },
    "typeRoots": ["./src/@types", "./node_modules/@types"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 4: Create server/jest.config.ts**

```typescript
import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleNameMapper: {
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
  },
}

export default config
```

- [ ] **Step 5: Create server/.env**

```
MONGODB_URI=mongodb://localhost:27017/pulse
JWT_SECRET=pulse-dev-secret-change-in-production
PORT=3001
```

- [ ] **Step 6: Install dependencies**

Run from project root:

```bash
cd server && pnpm install
cd .. && pnpm install
```

- [ ] **Step 7: Commit**

```bash
git add package.json server/package.json server/tsconfig.json server/jest.config.ts server/.env
git commit -m "chore: scaffold server project with dependencies and config"
```

---

## Task 2: Global Types + Shared Infrastructure

**Files:**

- Create: `server/src/@types/global.d.ts`
- Create: `server/src/shared/errors/app.error.ts`
- Create: `server/src/shared/middlewares/logger.middleware.ts`
- Create: `server/src/shared/middlewares/error-handler.middleware.ts`
- Create: `server/src/shared/middlewares/auth.middleware.ts`
- Create: `server/src/config/database.ts`

- [ ] **Step 1: Create global.d.ts**

File: `server/src/@types/global.d.ts`

```typescript
type Nullable<T> = T | null

declare namespace Express {
  interface Request {
    user?: {
      userId: string
      role: string
    }
  }
}
```

- [ ] **Step 2: Create AppError**

File: `server/src/shared/errors/app.error.ts`

```typescript
export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message)
    this.name = this.constructor.name
  }
}
```

- [ ] **Step 3: Create logger middleware**

File: `server/src/shared/middlewares/logger.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express'

export function loggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now()

  const originalJson = res.json.bind(res)
  let responseBody: unknown

  res.json = (body: unknown) => {
    responseBody = body
    return originalJson(body)
  }

  res.on('finish', () => {
    const duration = Date.now() - start
    const status = res.statusCode
    const method = req.method
    const url = req.originalUrl

    const statusColor =
      status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : status >= 300 ? '\x1b[36m' : '\x1b[32m'
    const reset = '\x1b[0m'

    console.log(`${method.padEnd(7)} ${statusColor}${status}${reset} ${url} ${duration}ms`)

    if (['POST', 'PATCH', 'PUT'].includes(method) && req.body) {
      const sanitized = { ...req.body }
      if (sanitized.password) sanitized.password = '***'
      if (sanitized.confirmPassword) sanitized.confirmPassword = '***'
      console.log(`  -> req:`, JSON.stringify(sanitized))
    }

    if (responseBody) {
      const str = JSON.stringify(responseBody)
      const truncated = str.length > 200 ? str.slice(0, 200) + '...' : str
      console.log(`  -> res:`, truncated)
    }
  })

  next()
}
```

- [ ] **Step 4: Create error handler middleware**

File: `server/src/shared/middlewares/error-handler.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/app.error'

export function errorHandlerMiddleware(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    })
    return
  }

  console.error('Unexpected error:', err)
  res.status(500).json({
    success: false,
    error: 'Internal server error',
  })
}
```

- [ ] **Step 5: Create auth middleware**

File: `server/src/shared/middlewares/auth.middleware.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/app.error'
import { JwtServiceSecurity } from '../../modules/auth/application/services/security/jwt.service-security'

export function createAuthMiddleware(jwtService: JwtServiceSecurity) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      next(new AppError(401, 'Missing or invalid token'))
      return
    }

    try {
      const token = header.split(' ')[1]
      const payload = jwtService.verify(token)
      req.user = { userId: payload.userId as string, role: payload.role as string }
      next()
    } catch {
      next(new AppError(401, 'Invalid or expired token'))
    }
  }
}

export function createAdminMiddleware() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== 'admin') {
      next(new AppError(403, 'Admin access required'))
      return
    }
    next()
  }
}
```

- [ ] **Step 6: Create database config**

File: `server/src/config/database.ts`

```typescript
import mongoose from 'mongoose'

export async function connectDatabase(uri: string): Promise<void> {
  await mongoose.connect(uri)
  console.log('Connected to MongoDB')
}
```

- [ ] **Step 7: Commit**

```bash
git add server/src/@types/ server/src/shared/ server/src/config/
git commit -m "feat: add global types, shared errors, middlewares and database config"
```

---

## Task 3: Auth Module — Domain Layer

**Files:**

- Create: `server/src/modules/auth/domain/constants/auth.constant.ts`
- Create: `server/src/modules/auth/domain/entity/user.entity.ts`
- Create: `server/src/modules/auth/domain/errors/auth.error.ts`
- Create: `server/src/modules/auth/domain/repository/user.repository.interface.ts`

- [ ] **Step 1: Create auth constants**

File: `server/src/modules/auth/domain/constants/auth.constant.ts`

```typescript
export const AuthConstant = {
  SALT_ROUNDS: 10,
  JWT_DEFAULT_EXPIRATION: '24h',
} as const

export const UserRole = {
  ADMIN: 'admin',
  CUSTOMER: 'customer',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]
```

- [ ] **Step 2: Create auth errors**

File: `server/src/modules/auth/domain/errors/auth.error.ts`

```typescript
import { AppError } from '@shared/errors/app.error'

export class UserAlreadyExistsError extends AppError {
  constructor(email: string) {
    super(409, `User with email "${email}" already exists`)
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super(401, 'Invalid email or password')
  }
}

export class UserNotFoundError extends AppError {
  constructor(id: string) {
    super(404, `User with id "${id}" not found`)
  }
}
```

- [ ] **Step 3: Create UserEntity (kairos-crm pattern)**

File: `server/src/modules/auth/domain/entity/user.entity.ts`

```typescript
import { UserRole } from '../constants/auth.constant'

export interface UserEntityProps {
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}

export class UserEntity {
  private constructor(private readonly props: UserEntityProps) {}

  static create(props: Partial<UserEntityProps>): UserEntity {
    if (!props.email) {
      throw new Error('Email is required')
    }
    if (!props.password) {
      throw new Error('Password is required')
    }

    const now = new Date()

    return new UserEntity({
      id: props.id ?? '',
      email: props.email,
      password: props.password,
      firstName: props.firstName ?? '',
      lastName: props.lastName ?? '',
      role: props.role ?? UserRole.CUSTOMER,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      deletedAt: props.deletedAt ?? null,
    })
  }

  static fromProps(props: UserEntityProps): UserEntity {
    return new UserEntity(props)
  }

  get id(): string {
    return this.props.id
  }
  get email(): string {
    return this.props.email
  }
  get password(): string {
    return this.props.password
  }
  get firstName(): string {
    return this.props.firstName
  }
  get lastName(): string {
    return this.props.lastName
  }
  get role(): UserRole {
    return this.props.role
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date {
    return this.props.updatedAt
  }
  get deletedAt(): Nullable<Date> {
    return this.props.deletedAt
  }

  get fullName(): string {
    return `${this.props.firstName} ${this.props.lastName}`.trim()
  }

  isAdmin(): boolean {
    return this.props.role === UserRole.ADMIN
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null
  }

  update(newProps: { email?: string; firstName?: string; lastName?: string }): this {
    if (newProps.email !== undefined) this.props.email = newProps.email
    if (newProps.firstName !== undefined) this.props.firstName = newProps.firstName
    if (newProps.lastName !== undefined) this.props.lastName = newProps.lastName
    this.props.updatedAt = new Date()
    return this
  }

  updatePassword(hashedPassword: string): this {
    this.props.password = hashedPassword
    this.props.updatedAt = new Date()
    return this
  }

  softDelete(): void {
    if (!this.props.deletedAt) {
      this.props.deletedAt = new Date()
      this.props.updatedAt = new Date()
    }
  }

  toJSON(): UserEntityProps {
    return { ...this.props }
  }
}
```

- [ ] **Step 4: Create user repository interface**

File: `server/src/modules/auth/domain/repository/user.repository.interface.ts`

```typescript
import { UserEntity } from '../entity/user.entity'

export interface IUserRepository {
  findByEmail(email: string): Promise<Nullable<UserEntity>>
  findById(id: string): Promise<Nullable<UserEntity>>
  findAll(): Promise<UserEntity[]>
  create(user: UserEntity): Promise<UserEntity>
  update(user: UserEntity): Promise<UserEntity>
}
```

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/auth/domain/
git commit -m "feat(auth): add domain layer — entity, repository interface, errors, constants"
```

---

## Task 4: Auth Module — Infrastructure Layer

**Files:**

- Create: `server/src/modules/auth/infrastructure/schema/user.schema.ts`
- Create: `server/src/modules/auth/infrastructure/repository/user.repository.mongoose-mongo.ts`

- [ ] **Step 1: Create user Mongoose schema**

File: `server/src/modules/auth/infrastructure/schema/user.schema.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose'
import { UserRole } from '../../domain/constants/auth.constant'

export interface UserDocument extends Document {
  email: string
  password: string
  firstName: string
  lastName: string
  role: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    role: { type: String, enum: [UserRole.ADMIN, UserRole.CUSTOMER], default: UserRole.CUSTOMER },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const UserModel = mongoose.model<UserDocument>('User', userSchema)
```

- [ ] **Step 2: Create user repository implementation**

File: `server/src/modules/auth/infrastructure/repository/user.repository.mongoose-mongo.ts`

```typescript
import { IUserRepository } from '../../domain/repository/user.repository.interface'
import { UserEntity } from '../../domain/entity/user.entity'
import { UserModel, UserDocument } from '../schema/user.schema'
import { UserRole } from '../../domain/constants/auth.constant'

export class UserRepositoryMongooseMongo implements IUserRepository {
  private toEntity(doc: UserDocument): UserEntity {
    return UserEntity.fromProps({
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      firstName: doc.firstName,
      lastName: doc.lastName,
      role: doc.role as UserRole,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    })
  }

  async findByEmail(email: string): Promise<Nullable<UserEntity>> {
    const doc = await UserModel.findOne({ email, deletedAt: null })
    return doc ? this.toEntity(doc) : null
  }

  async findById(id: string): Promise<Nullable<UserEntity>> {
    const doc = await UserModel.findOne({ _id: id, deletedAt: null })
    return doc ? this.toEntity(doc) : null
  }

  async findAll(): Promise<UserEntity[]> {
    const docs = await UserModel.find({ deletedAt: null }).sort({ createdAt: -1 })
    return docs.map((doc) => this.toEntity(doc))
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const doc = await UserModel.create({
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    })
    return this.toEntity(doc)
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const json = user.toJSON()
    const doc = await UserModel.findByIdAndUpdate(
      user.id,
      {
        email: json.email,
        password: json.password,
        firstName: json.firstName,
        lastName: json.lastName,
        role: json.role,
        deletedAt: json.deletedAt,
      },
      { new: true }
    )
    return this.toEntity(doc!)
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add server/src/modules/auth/infrastructure/
git commit -m "feat(auth): add infrastructure layer — mongoose schema and repository"
```

---

## Task 5: Auth Module — Application Layer

**Files:**

- Create: `server/src/modules/auth/application/services/security/hash.service-security.ts`
- Create: `server/src/modules/auth/application/services/security/jwt.service-security.ts`
- Create: `server/src/modules/auth/application/use-cases/register/register.use-case.ts`
- Create: `server/src/modules/auth/application/use-cases/login/login.use-case.ts`
- Create: `server/src/modules/auth/application/services/auth.service.ts`

- [ ] **Step 1: Create hash security service**

File: `server/src/modules/auth/application/services/security/hash.service-security.ts`

```typescript
import bcrypt from 'bcryptjs'
import { AuthConstant } from '../../../domain/constants/auth.constant'

export class HashServiceSecurity {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, AuthConstant.SALT_ROUNDS)
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }
}
```

- [ ] **Step 2: Create JWT security service**

File: `server/src/modules/auth/application/services/security/jwt.service-security.ts`

```typescript
import jwt from 'jsonwebtoken'
import type { StringValue } from 'ms'

export class JwtServiceSecurity {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: StringValue
  ) {}

  generate(payload: Record<string, unknown>): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn })
  }

  verify(token: string): Record<string, unknown> {
    return jwt.verify(token, this.secret) as Record<string, unknown>
  }
}
```

- [ ] **Step 3: Create register use-case**

File: `server/src/modules/auth/application/use-cases/register/register.use-case.ts`

```typescript
import { IUserRepository } from '../../../domain/repository/user.repository.interface'
import { UserEntity } from '../../../domain/entity/user.entity'
import { UserAlreadyExistsError } from '../../../domain/errors/auth.error'
import { HashServiceSecurity } from '../../services/security/hash.service-security'
import { JwtServiceSecurity } from '../../services/security/jwt.service-security'

interface RegisterInput {
  email: string
  password: string
  firstName: string
  lastName: string
}

interface RegisterOutput {
  token: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashServiceSecurity,
    private readonly jwtService: JwtServiceSecurity
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const existing = await this.userRepository.findByEmail(input.email)
    if (existing) {
      throw new UserAlreadyExistsError(input.email)
    }

    const hashedPassword = await this.hashService.hash(input.password)

    const user = UserEntity.create({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
    })

    const saved = await this.userRepository.create(user)

    const token = this.jwtService.generate({
      userId: saved.id,
      role: saved.role,
    })

    return {
      token,
      user: {
        id: saved.id,
        email: saved.email,
        firstName: saved.firstName,
        lastName: saved.lastName,
        role: saved.role,
      },
    }
  }
}
```

- [ ] **Step 4: Create login use-case**

File: `server/src/modules/auth/application/use-cases/login/login.use-case.ts`

```typescript
import { IUserRepository } from '../../../domain/repository/user.repository.interface'
import { InvalidCredentialsError } from '../../../domain/errors/auth.error'
import { HashServiceSecurity } from '../../services/security/hash.service-security'
import { JwtServiceSecurity } from '../../services/security/jwt.service-security'

interface LoginInput {
  email: string
  password: string
}

interface LoginOutput {
  token: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashServiceSecurity,
    private readonly jwtService: JwtServiceSecurity
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    const isPasswordValid = await this.hashService.compare(input.password, user.password)
    if (!isPasswordValid) {
      throw new InvalidCredentialsError()
    }

    const token = this.jwtService.generate({
      userId: user.id,
      role: user.role,
    })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }
  }
}
```

- [ ] **Step 5: Create auth service**

File: `server/src/modules/auth/application/services/auth.service.ts`

```typescript
import { RegisterUseCase } from '../use-cases/register/register.use-case'
import { LoginUseCase } from '../use-cases/login/login.use-case'

export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  register(input: { email: string; password: string; firstName: string; lastName: string }) {
    return this.registerUseCase.execute(input)
  }

  login(input: { email: string; password: string }) {
    return this.loginUseCase.execute(input)
  }
}
```

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/auth/application/
git commit -m "feat(auth): add application layer — use-cases, services, security"
```

---

## Task 6: Auth Module — Presentation Layer + Module Wiring

**Files:**

- Create: `server/src/modules/auth/presentation/dto/register.request.dto.ts`
- Create: `server/src/modules/auth/presentation/dto/login.request.dto.ts`
- Create: `server/src/modules/auth/presentation/dto/auth.response.dto.ts`
- Create: `server/src/modules/auth/presentation/controllers/auth.controller.ts`
- Create: `server/src/modules/auth/auth.module.ts`

- [ ] **Step 1: Create register request DTO**

File: `server/src/modules/auth/presentation/dto/register.request.dto.ts`

```typescript
import { AppError } from '@shared/errors/app.error'

export class RegisterRequestDto {
  public readonly email: string
  public readonly password: string
  public readonly firstName: string
  public readonly lastName: string

  constructor(body: Record<string, unknown>) {
    if (!body.email || typeof body.email !== 'string') {
      throw new AppError(400, 'Email is required')
    }
    if (!body.password || typeof body.password !== 'string') {
      throw new AppError(400, 'Password is required')
    }
    if (typeof body.password === 'string' && body.password.length < 6) {
      throw new AppError(400, 'Password must be at least 6 characters')
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email as string)) {
      throw new AppError(400, 'Invalid email format')
    }

    this.email = (body.email as string).toLowerCase().trim()
    this.password = body.password as string
    this.firstName = (body.firstName as string) ?? ''
    this.lastName = (body.lastName as string) ?? ''
  }
}
```

- [ ] **Step 2: Create login request DTO**

File: `server/src/modules/auth/presentation/dto/login.request.dto.ts`

```typescript
import { AppError } from '@shared/errors/app.error'

export class LoginRequestDto {
  public readonly email: string
  public readonly password: string

  constructor(body: Record<string, unknown>) {
    if (!body.email || typeof body.email !== 'string') {
      throw new AppError(400, 'Email is required')
    }
    if (!body.password || typeof body.password !== 'string') {
      throw new AppError(400, 'Password is required')
    }

    this.email = (body.email as string).toLowerCase().trim()
    this.password = body.password as string
  }
}
```

- [ ] **Step 3: Create auth response DTO**

File: `server/src/modules/auth/presentation/dto/auth.response.dto.ts`

```typescript
export class AuthResponseDto {
  public readonly token: string
  public readonly user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }

  constructor(data: {
    token: string
    user: { id: string; email: string; firstName: string; lastName: string; role: string }
  }) {
    this.token = data.token
    this.user = data.user
  }
}
```

- [ ] **Step 4: Create auth controller**

File: `server/src/modules/auth/presentation/controllers/auth.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import { AuthService } from '../../application/services/auth.service'
import { RegisterRequestDto } from '../dto/register.request.dto'
import { LoginRequestDto } from '../dto/login.request.dto'
import { AuthResponseDto } from '../dto/auth.response.dto'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new RegisterRequestDto(req.body)
      const result = await this.authService.register(dto)
      const response = new AuthResponseDto(result)
      res.status(201).json({ success: true, data: response })
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new LoginRequestDto(req.body)
      const result = await this.authService.login(dto)
      const response = new AuthResponseDto(result)
      res.status(200).json({ success: true, data: response })
    } catch (error) {
      next(error)
    }
  }
}
```

- [ ] **Step 5: Create auth module**

File: `server/src/modules/auth/auth.module.ts`

```typescript
import { Router } from 'express'
import { UserRepositoryMongooseMongo } from './infrastructure/repository/user.repository.mongoose-mongo'
import { HashServiceSecurity } from './application/services/security/hash.service-security'
import { JwtServiceSecurity } from './application/services/security/jwt.service-security'
import { RegisterUseCase } from './application/use-cases/register/register.use-case'
import { LoginUseCase } from './application/use-cases/login/login.use-case'
import { AuthService } from './application/services/auth.service'
import { AuthController } from './presentation/controllers/auth.controller'
import { AuthConstant } from './domain/constants/auth.constant'
import type { StringValue } from 'ms'

export function createAuthModule() {
  const userRepository = new UserRepositoryMongooseMongo()
  const hashService = new HashServiceSecurity()
  const jwtService = new JwtServiceSecurity(
    process.env.JWT_SECRET!,
    (process.env.JWT_EXPIRES_IN ?? AuthConstant.JWT_DEFAULT_EXPIRATION) as StringValue
  )

  const registerUseCase = new RegisterUseCase(userRepository, hashService, jwtService)
  const loginUseCase = new LoginUseCase(userRepository, hashService, jwtService)
  const authService = new AuthService(registerUseCase, loginUseCase)
  const controller = new AuthController(authService)

  const router = Router()
  router.post('/register', (req, res, next) => controller.register(req, res, next))
  router.post('/login', (req, res, next) => controller.login(req, res, next))

  return { router, jwtService, userRepository }
}
```

- [ ] **Step 6: Commit**

```bash
git add server/src/modules/auth/presentation/ server/src/modules/auth/auth.module.ts
git commit -m "feat(auth): add presentation layer, DTOs, controller and module wiring"
```

---

## Task 7: User Module

**Files:**

- Create: `server/src/modules/user/application/use-cases/get-me/get-me.use-case.ts`
- Create: `server/src/modules/user/application/use-cases/update-me/update-me.use-case.ts`
- Create: `server/src/modules/user/application/use-cases/get-all-users/get-all-users.use-case.ts`
- Create: `server/src/modules/user/application/services/user.service.ts`
- Create: `server/src/modules/user/presentation/dto/update-user.request.dto.ts`
- Create: `server/src/modules/user/presentation/dto/user.response.dto.ts`
- Create: `server/src/modules/user/presentation/controllers/user.controller.ts`
- Create: `server/src/modules/user/user.module.ts`

- [ ] **Step 1: Create get-me use-case**

File: `server/src/modules/user/application/use-cases/get-me/get-me.use-case.ts`

```typescript
import { IUserRepository } from '@modules/auth/domain/repository/user.repository.interface'
import { UserNotFoundError } from '@modules/auth/domain/errors/auth.error'
import { UserEntity } from '@modules/auth/domain/entity/user.entity'

export class GetMeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new UserNotFoundError(userId)
    }
    return user
  }
}
```

- [ ] **Step 2: Create update-me use-case**

File: `server/src/modules/user/application/use-cases/update-me/update-me.use-case.ts`

```typescript
import { IUserRepository } from '@modules/auth/domain/repository/user.repository.interface'
import { UserNotFoundError } from '@modules/auth/domain/errors/auth.error'
import { UserEntity } from '@modules/auth/domain/entity/user.entity'

interface UpdateMeInput {
  firstName?: string
  lastName?: string
  email?: string
}

export class UpdateMeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, input: UpdateMeInput): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      throw new UserNotFoundError(userId)
    }
    user.update(input)
    return this.userRepository.update(user)
  }
}
```

- [ ] **Step 3: Create get-all-users use-case**

File: `server/src/modules/user/application/use-cases/get-all-users/get-all-users.use-case.ts`

```typescript
import { IUserRepository } from '@modules/auth/domain/repository/user.repository.interface'
import { UserEntity } from '@modules/auth/domain/entity/user.entity'

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserEntity[]> {
    return this.userRepository.findAll()
  }
}
```

- [ ] **Step 4: Create user service**

File: `server/src/modules/user/application/services/user.service.ts`

```typescript
import { GetMeUseCase } from '../use-cases/get-me/get-me.use-case'
import { UpdateMeUseCase } from '../use-cases/update-me/update-me.use-case'
import { GetAllUsersUseCase } from '../use-cases/get-all-users/get-all-users.use-case'

export class UserService {
  constructor(
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateMeUseCase: UpdateMeUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase
  ) {}

  getMe(userId: string) {
    return this.getMeUseCase.execute(userId)
  }

  updateMe(userId: string, input: { firstName?: string; lastName?: string; email?: string }) {
    return this.updateMeUseCase.execute(userId, input)
  }

  getAllUsers() {
    return this.getAllUsersUseCase.execute()
  }
}
```

- [ ] **Step 5: Create user DTOs**

File: `server/src/modules/user/presentation/dto/user.response.dto.ts`

```typescript
import { UserEntity } from '@modules/auth/domain/entity/user.entity'

export class UserResponseDto {
  public readonly id: string
  public readonly email: string
  public readonly firstName: string
  public readonly lastName: string
  public readonly role: string
  public readonly createdAt: Date

  constructor(entity: UserEntity) {
    this.id = entity.id
    this.email = entity.email
    this.firstName = entity.firstName
    this.lastName = entity.lastName
    this.role = entity.role
    this.createdAt = entity.createdAt
  }
}
```

File: `server/src/modules/user/presentation/dto/update-user.request.dto.ts`

```typescript
export class UpdateUserRequestDto {
  public readonly firstName?: string
  public readonly lastName?: string
  public readonly email?: string

  constructor(body: Record<string, unknown>) {
    if (body.firstName !== undefined) this.firstName = body.firstName as string
    if (body.lastName !== undefined) this.lastName = body.lastName as string
    if (body.email !== undefined) this.email = (body.email as string).toLowerCase().trim()
  }
}
```

- [ ] **Step 6: Create user controller**

File: `server/src/modules/user/presentation/controllers/user.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import { UserService } from '../../application/services/user.service'
import { UserResponseDto } from '../dto/user.response.dto'
import { UpdateUserRequestDto } from '../dto/update-user.request.dto'

export class UserController {
  constructor(private readonly userService: UserService) {}

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userService.getMe(req.user!.userId)
      res.status(200).json({ success: true, data: new UserResponseDto(user) })
    } catch (error) {
      next(error)
    }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new UpdateUserRequestDto(req.body)
      const user = await this.userService.updateMe(req.user!.userId, dto)
      res.status(200).json({ success: true, data: new UserResponseDto(user) })
    } catch (error) {
      next(error)
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userService.getAllUsers()
      res.status(200).json({ success: true, data: users.map((u) => new UserResponseDto(u)) })
    } catch (error) {
      next(error)
    }
  }
}
```

- [ ] **Step 7: Create user module**

File: `server/src/modules/user/user.module.ts`

```typescript
import { Router } from 'express'
import { IUserRepository } from '@modules/auth/domain/repository/user.repository.interface'
import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { createAuthMiddleware, createAdminMiddleware } from '@shared/middlewares/auth.middleware'
import { GetMeUseCase } from './application/use-cases/get-me/get-me.use-case'
import { UpdateMeUseCase } from './application/use-cases/update-me/update-me.use-case'
import { GetAllUsersUseCase } from './application/use-cases/get-all-users/get-all-users.use-case'
import { UserService } from './application/services/user.service'
import { UserController } from './presentation/controllers/user.controller'

export function createUserModule(userRepository: IUserRepository, jwtService: JwtServiceSecurity) {
  const getMeUseCase = new GetMeUseCase(userRepository)
  const updateMeUseCase = new UpdateMeUseCase(userRepository)
  const getAllUsersUseCase = new GetAllUsersUseCase(userRepository)
  const userService = new UserService(getMeUseCase, updateMeUseCase, getAllUsersUseCase)
  const controller = new UserController(userService)

  const authMiddleware = createAuthMiddleware(jwtService)
  const adminMiddleware = createAdminMiddleware()

  const router = Router()
  router.get('/me', authMiddleware, (req, res, next) => controller.getMe(req, res, next))
  router.patch('/me', authMiddleware, (req, res, next) => controller.updateMe(req, res, next))
  router.get('/', authMiddleware, adminMiddleware, (req, res, next) => controller.getAll(req, res, next))

  return router
}
```

- [ ] **Step 8: Commit**

```bash
git add server/src/modules/user/
git commit -m "feat(user): add user module — get me, update me, get all (admin)"
```

---

## Task 8: Product Module

**Files:**

- Create: all files under `server/src/modules/product/`

- [ ] **Step 1: Create product constants**

File: `server/src/modules/product/domain/constants/product.constant.ts`

```typescript
export const ProductCategory = {
  BRACELET: 'bracelet',
  PASS: 'pass',
  BUNDLE: 'bundle',
} as const

export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory]
```

- [ ] **Step 2: Create product errors**

File: `server/src/modules/product/domain/errors/product.error.ts`

```typescript
import { AppError } from '@shared/errors/app.error'

export class ProductNotFoundError extends AppError {
  constructor(identifier: string) {
    super(404, `Product "${identifier}" not found`)
  }
}

export class ProductAlreadyExistsError extends AppError {
  constructor(slug: string) {
    super(409, `Product with slug "${slug}" already exists`)
  }
}
```

- [ ] **Step 3: Create product entity**

File: `server/src/modules/product/domain/entity/product.entity.ts`

```typescript
import { ProductCategory } from '../constants/product.constant'

export interface ProductVariant {
  name: string
  color: string
  priceModifier: number
}

export interface ProductEntityProps {
  id: string
  name: string
  slug: string
  description: string
  price: number
  images: string[]
  category: ProductCategory
  variants: ProductVariant[]
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}

export class ProductEntity {
  private constructor(private readonly props: ProductEntityProps) {}

  static create(props: Partial<ProductEntityProps>): ProductEntity {
    if (!props.name) throw new Error('Product name is required')
    if (props.price === undefined || props.price < 0) throw new Error('Valid price is required')

    const now = new Date()
    const slug =
      props.slug ??
      props.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    return new ProductEntity({
      id: props.id ?? '',
      name: props.name,
      slug,
      description: props.description ?? '',
      price: props.price,
      images: props.images ?? [],
      category: props.category ?? ProductCategory.BRACELET,
      variants: props.variants ?? [],
      stock: props.stock ?? 0,
      featured: props.featured ?? false,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      deletedAt: props.deletedAt ?? null,
    })
  }

  static fromProps(props: ProductEntityProps): ProductEntity {
    return new ProductEntity(props)
  }

  get id(): string {
    return this.props.id
  }
  get name(): string {
    return this.props.name
  }
  get slug(): string {
    return this.props.slug
  }
  get description(): string {
    return this.props.description
  }
  get price(): number {
    return this.props.price
  }
  get images(): string[] {
    return this.props.images
  }
  get category(): ProductCategory {
    return this.props.category
  }
  get variants(): ProductVariant[] {
    return this.props.variants
  }
  get stock(): number {
    return this.props.stock
  }
  get featured(): boolean {
    return this.props.featured
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date {
    return this.props.updatedAt
  }
  get deletedAt(): Nullable<Date> {
    return this.props.deletedAt
  }

  isInStock(): boolean {
    return this.props.stock > 0
  }

  isFeatured(): boolean {
    return this.props.featured
  }

  isDeleted(): boolean {
    return this.props.deletedAt !== null
  }

  decrementStock(quantity: number): this {
    if (this.props.stock < quantity) {
      throw new Error('Insufficient stock')
    }
    this.props.stock -= quantity
    this.props.updatedAt = new Date()
    return this
  }

  update(newProps: Partial<Omit<ProductEntityProps, 'id' | 'createdAt'>>): this {
    if (newProps.name !== undefined) this.props.name = newProps.name
    if (newProps.slug !== undefined) this.props.slug = newProps.slug
    if (newProps.description !== undefined) this.props.description = newProps.description
    if (newProps.price !== undefined) this.props.price = newProps.price
    if (newProps.images !== undefined) this.props.images = newProps.images
    if (newProps.category !== undefined) this.props.category = newProps.category
    if (newProps.variants !== undefined) this.props.variants = newProps.variants
    if (newProps.stock !== undefined) this.props.stock = newProps.stock
    if (newProps.featured !== undefined) this.props.featured = newProps.featured
    this.props.updatedAt = new Date()
    return this
  }

  softDelete(): void {
    if (!this.props.deletedAt) {
      this.props.deletedAt = new Date()
      this.props.updatedAt = new Date()
    }
  }

  toJSON(): ProductEntityProps {
    return { ...this.props }
  }
}
```

- [ ] **Step 4: Create product repository interface**

File: `server/src/modules/product/domain/repository/product.repository.interface.ts`

```typescript
import { ProductEntity } from '../entity/product.entity'

export interface IProductRepository {
  findAll(): Promise<ProductEntity[]>
  findById(id: string): Promise<Nullable<ProductEntity>>
  findBySlug(slug: string): Promise<Nullable<ProductEntity>>
  findFeatured(): Promise<ProductEntity[]>
  create(product: ProductEntity): Promise<ProductEntity>
  update(product: ProductEntity): Promise<ProductEntity>
  delete(id: string): Promise<void>
}
```

- [ ] **Step 5: Create product schema**

File: `server/src/modules/product/infrastructure/schema/product.schema.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface ProductDocument extends Document {
  name: string
  slug: string
  description: string
  price: number
  images: string[]
  category: string
  variants: { name: string; color: string; priceModifier: number }[]
  stock: number
  featured: boolean
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

const productVariantSchema = new Schema(
  {
    name: { type: String, required: true },
    color: { type: String, required: true },
    priceModifier: { type: Number, default: 0 },
  },
  { _id: false }
)

const productSchema = new Schema<ProductDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    price: { type: Number, required: true },
    images: { type: [String], default: [] },
    category: { type: String, enum: ['bracelet', 'pass', 'bundle'], default: 'bracelet' },
    variants: { type: [productVariantSchema], default: [] },
    stock: { type: Number, default: 0 },
    featured: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
)

export const ProductModel = mongoose.model<ProductDocument>('Product', productSchema)
```

- [ ] **Step 6: Create product repository implementation**

File: `server/src/modules/product/infrastructure/repository/product.repository.mongoose-mongo.ts`

```typescript
import { IProductRepository } from '../../domain/repository/product.repository.interface'
import { ProductEntity } from '../../domain/entity/product.entity'
import { ProductModel, ProductDocument } from '../schema/product.schema'
import { ProductCategory } from '../../domain/constants/product.constant'

export class ProductRepositoryMongooseMongo implements IProductRepository {
  private toEntity(doc: ProductDocument): ProductEntity {
    return ProductEntity.fromProps({
      id: doc._id.toString(),
      name: doc.name,
      slug: doc.slug,
      description: doc.description,
      price: doc.price,
      images: doc.images,
      category: doc.category as ProductCategory,
      variants: doc.variants,
      stock: doc.stock,
      featured: doc.featured,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    })
  }

  async findAll(): Promise<ProductEntity[]> {
    const docs = await ProductModel.find({ deletedAt: null }).sort({ createdAt: -1 })
    return docs.map((doc) => this.toEntity(doc))
  }

  async findById(id: string): Promise<Nullable<ProductEntity>> {
    const doc = await ProductModel.findOne({ _id: id, deletedAt: null })
    return doc ? this.toEntity(doc) : null
  }

  async findBySlug(slug: string): Promise<Nullable<ProductEntity>> {
    const doc = await ProductModel.findOne({ slug, deletedAt: null })
    return doc ? this.toEntity(doc) : null
  }

  async findFeatured(): Promise<ProductEntity[]> {
    const docs = await ProductModel.find({ featured: true, deletedAt: null })
    return docs.map((doc) => this.toEntity(doc))
  }

  async create(product: ProductEntity): Promise<ProductEntity> {
    const doc = await ProductModel.create({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      images: product.images,
      category: product.category,
      variants: product.variants,
      stock: product.stock,
      featured: product.featured,
    })
    return this.toEntity(doc)
  }

  async update(product: ProductEntity): Promise<ProductEntity> {
    const json = product.toJSON()
    const doc = await ProductModel.findByIdAndUpdate(
      product.id,
      {
        name: json.name,
        slug: json.slug,
        description: json.description,
        price: json.price,
        images: json.images,
        category: json.category,
        variants: json.variants,
        stock: json.stock,
        featured: json.featured,
        deletedAt: json.deletedAt,
      },
      { new: true }
    )
    return this.toEntity(doc!)
  }

  async delete(id: string): Promise<void> {
    await ProductModel.findByIdAndUpdate(id, { deletedAt: new Date() })
  }
}
```

- [ ] **Step 7: Create product use-cases (all 6)**

File: `server/src/modules/product/application/use-cases/create-product/create-product.use-case.ts`

```typescript
import { IProductRepository } from '../../../domain/repository/product.repository.interface'
import { ProductEntity } from '../../../domain/entity/product.entity'
import { ProductAlreadyExistsError } from '../../../domain/errors/product.error'

interface CreateProductInput {
  name: string
  slug?: string
  description?: string
  price: number
  images?: string[]
  category?: string
  variants?: { name: string; color: string; priceModifier: number }[]
  stock?: number
  featured?: boolean
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: CreateProductInput): Promise<ProductEntity> {
    const product = ProductEntity.create(input)

    const existing = await this.productRepository.findBySlug(product.slug)
    if (existing) {
      throw new ProductAlreadyExistsError(product.slug)
    }

    return this.productRepository.create(product)
  }
}
```

File: `server/src/modules/product/application/use-cases/get-all-products/get-all-products.use-case.ts`

```typescript
import { IProductRepository } from '../../../domain/repository/product.repository.interface'
import { ProductEntity } from '../../../domain/entity/product.entity'

export class GetAllProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(): Promise<ProductEntity[]> {
    return this.productRepository.findAll()
  }
}
```

File: `server/src/modules/product/application/use-cases/get-product-by-slug/get-product-by-slug.use-case.ts`

```typescript
import { IProductRepository } from '../../../domain/repository/product.repository.interface'
import { ProductEntity } from '../../../domain/entity/product.entity'
import { ProductNotFoundError } from '../../../domain/errors/product.error'

export class GetProductBySlugUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(slug: string): Promise<ProductEntity> {
    const product = await this.productRepository.findBySlug(slug)
    if (!product) {
      throw new ProductNotFoundError(slug)
    }
    return product
  }
}
```

File: `server/src/modules/product/application/use-cases/get-featured-products/get-featured-products.use-case.ts`

```typescript
import { IProductRepository } from '../../../domain/repository/product.repository.interface'
import { ProductEntity } from '../../../domain/entity/product.entity'

export class GetFeaturedProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(): Promise<ProductEntity[]> {
    return this.productRepository.findFeatured()
  }
}
```

File: `server/src/modules/product/application/use-cases/update-product/update-product.use-case.ts`

```typescript
import { IProductRepository } from '../../../domain/repository/product.repository.interface'
import { ProductEntity } from '../../../domain/entity/product.entity'
import { ProductNotFoundError } from '../../../domain/errors/product.error'

export class UpdateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string, input: Record<string, unknown>): Promise<ProductEntity> {
    const product = await this.productRepository.findById(id)
    if (!product) {
      throw new ProductNotFoundError(id)
    }
    product.update(input as Partial<ProductEntity>)
    return this.productRepository.update(product)
  }
}
```

File: `server/src/modules/product/application/use-cases/delete-product/delete-product.use-case.ts`

```typescript
import { IProductRepository } from '../../../domain/repository/product.repository.interface'
import { ProductNotFoundError } from '../../../domain/errors/product.error'

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id)
    if (!product) {
      throw new ProductNotFoundError(id)
    }
    product.softDelete()
    await this.productRepository.update(product)
  }
}
```

- [ ] **Step 8: Create product service**

File: `server/src/modules/product/application/services/product.service.ts`

```typescript
import { CreateProductUseCase } from '../use-cases/create-product/create-product.use-case'
import { GetAllProductsUseCase } from '../use-cases/get-all-products/get-all-products.use-case'
import { GetProductBySlugUseCase } from '../use-cases/get-product-by-slug/get-product-by-slug.use-case'
import { GetFeaturedProductsUseCase } from '../use-cases/get-featured-products/get-featured-products.use-case'
import { UpdateProductUseCase } from '../use-cases/update-product/update-product.use-case'
import { DeleteProductUseCase } from '../use-cases/delete-product/delete-product.use-case'

export class ProductService {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getAllProductsUseCase: GetAllProductsUseCase,
    private readonly getProductBySlugUseCase: GetProductBySlugUseCase,
    private readonly getFeaturedProductsUseCase: GetFeaturedProductsUseCase,
    private readonly updateProductUseCase: UpdateProductUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase
  ) {}

  create(input: Parameters<CreateProductUseCase['execute']>[0]) {
    return this.createProductUseCase.execute(input)
  }

  getAll() {
    return this.getAllProductsUseCase.execute()
  }

  getBySlug(slug: string) {
    return this.getProductBySlugUseCase.execute(slug)
  }

  getFeatured() {
    return this.getFeaturedProductsUseCase.execute()
  }

  update(id: string, input: Record<string, unknown>) {
    return this.updateProductUseCase.execute(id, input)
  }

  delete(id: string) {
    return this.deleteProductUseCase.execute(id)
  }
}
```

- [ ] **Step 9: Create product DTOs, controller, module**

File: `server/src/modules/product/presentation/dto/create-product.request.dto.ts`

```typescript
import { AppError } from '@shared/errors/app.error'

export class CreateProductRequestDto {
  public readonly name: string
  public readonly slug?: string
  public readonly description?: string
  public readonly price: number
  public readonly images?: string[]
  public readonly category?: string
  public readonly variants?: { name: string; color: string; priceModifier: number }[]
  public readonly stock?: number
  public readonly featured?: boolean

  constructor(body: Record<string, unknown>) {
    if (!body.name || typeof body.name !== 'string') throw new AppError(400, 'Product name is required')
    if (body.price === undefined || typeof body.price !== 'number' || body.price < 0)
      throw new AppError(400, 'Valid price is required')

    this.name = body.name as string
    this.price = body.price as number
    if (body.slug) this.slug = body.slug as string
    if (body.description) this.description = body.description as string
    if (body.images) this.images = body.images as string[]
    if (body.category) this.category = body.category as string
    if (body.variants) this.variants = body.variants as { name: string; color: string; priceModifier: number }[]
    if (body.stock !== undefined) this.stock = body.stock as number
    if (body.featured !== undefined) this.featured = body.featured as boolean
  }
}
```

File: `server/src/modules/product/presentation/dto/update-product.request.dto.ts`

```typescript
export class UpdateProductRequestDto {
  [key: string]: unknown

  constructor(body: Record<string, unknown>) {
    if (body.name !== undefined) this.name = body.name
    if (body.slug !== undefined) this.slug = body.slug
    if (body.description !== undefined) this.description = body.description
    if (body.price !== undefined) this.price = body.price
    if (body.images !== undefined) this.images = body.images
    if (body.category !== undefined) this.category = body.category
    if (body.variants !== undefined) this.variants = body.variants
    if (body.stock !== undefined) this.stock = body.stock
    if (body.featured !== undefined) this.featured = body.featured
  }
}
```

File: `server/src/modules/product/presentation/dto/product.response.dto.ts`

```typescript
import { ProductEntity } from '../../domain/entity/product.entity'

export class ProductResponseDto {
  public readonly id: string
  public readonly name: string
  public readonly slug: string
  public readonly description: string
  public readonly price: number
  public readonly images: string[]
  public readonly category: string
  public readonly variants: { name: string; color: string; priceModifier: number }[]
  public readonly stock: number
  public readonly featured: boolean
  public readonly createdAt: Date

  constructor(entity: ProductEntity) {
    this.id = entity.id
    this.name = entity.name
    this.slug = entity.slug
    this.description = entity.description
    this.price = entity.price
    this.images = entity.images
    this.category = entity.category
    this.variants = entity.variants
    this.stock = entity.stock
    this.featured = entity.featured
    this.createdAt = entity.createdAt
  }
}
```

File: `server/src/modules/product/presentation/controllers/product.controller.ts`

```typescript
import { Request, Response, NextFunction } from 'express'
import { ProductService } from '../../application/services/product.service'
import { CreateProductRequestDto } from '../dto/create-product.request.dto'
import { UpdateProductRequestDto } from '../dto/update-product.request.dto'
import { ProductResponseDto } from '../dto/product.response.dto'

export class ProductController {
  constructor(private readonly productService: ProductService) {}

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new CreateProductRequestDto(req.body)
      const product = await this.productService.create(dto)
      res.status(201).json({ success: true, data: new ProductResponseDto(product) })
    } catch (error) {
      next(error)
    }
  }

  async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await this.productService.getAll()
      res.status(200).json({ success: true, data: products.map((p) => new ProductResponseDto(p)) })
    } catch (error) {
      next(error)
    }
  }

  async getBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await this.productService.getBySlug(req.params.slug)
      res.status(200).json({ success: true, data: new ProductResponseDto(product) })
    } catch (error) {
      next(error)
    }
  }

  async getFeatured(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const products = await this.productService.getFeatured()
      res.status(200).json({ success: true, data: products.map((p) => new ProductResponseDto(p)) })
    } catch (error) {
      next(error)
    }
  }

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new UpdateProductRequestDto(req.body)
      const product = await this.productService.update(req.params.id, dto)
      res.status(200).json({ success: true, data: new ProductResponseDto(product) })
    } catch (error) {
      next(error)
    }
  }

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await this.productService.delete(req.params.id)
      res.status(200).json({ success: true, data: null })
    } catch (error) {
      next(error)
    }
  }
}
```

File: `server/src/modules/product/product.module.ts`

```typescript
import { Router } from 'express'
import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { createAuthMiddleware, createAdminMiddleware } from '@shared/middlewares/auth.middleware'
import { ProductRepositoryMongooseMongo } from './infrastructure/repository/product.repository.mongoose-mongo'
import { CreateProductUseCase } from './application/use-cases/create-product/create-product.use-case'
import { GetAllProductsUseCase } from './application/use-cases/get-all-products/get-all-products.use-case'
import { GetProductBySlugUseCase } from './application/use-cases/get-product-by-slug/get-product-by-slug.use-case'
import { GetFeaturedProductsUseCase } from './application/use-cases/get-featured-products/get-featured-products.use-case'
import { UpdateProductUseCase } from './application/use-cases/update-product/update-product.use-case'
import { DeleteProductUseCase } from './application/use-cases/delete-product/delete-product.use-case'
import { ProductService } from './application/services/product.service'
import { ProductController } from './presentation/controllers/product.controller'

export function createProductModule(jwtService: JwtServiceSecurity) {
  const repository = new ProductRepositoryMongooseMongo()
  const createUseCase = new CreateProductUseCase(repository)
  const getAllUseCase = new GetAllProductsUseCase(repository)
  const getBySlugUseCase = new GetProductBySlugUseCase(repository)
  const getFeaturedUseCase = new GetFeaturedProductsUseCase(repository)
  const updateUseCase = new UpdateProductUseCase(repository)
  const deleteUseCase = new DeleteProductUseCase(repository)
  const service = new ProductService(
    createUseCase,
    getAllUseCase,
    getBySlugUseCase,
    getFeaturedUseCase,
    updateUseCase,
    deleteUseCase
  )
  const controller = new ProductController(service)

  const authMiddleware = createAuthMiddleware(jwtService)
  const adminMiddleware = createAdminMiddleware()

  const router = Router()
  router.get('/', (req, res, next) => controller.getAll(req, res, next))
  router.get('/featured', (req, res, next) => controller.getFeatured(req, res, next))
  router.get('/:slug', (req, res, next) => controller.getBySlug(req, res, next))
  router.post('/', authMiddleware, adminMiddleware, (req, res, next) => controller.create(req, res, next))
  router.patch('/:id', authMiddleware, adminMiddleware, (req, res, next) => controller.update(req, res, next))
  router.delete('/:id', authMiddleware, adminMiddleware, (req, res, next) => controller.delete(req, res, next))

  return router
}
```

- [ ] **Step 10: Commit**

```bash
git add server/src/modules/product/
git commit -m "feat(product): add complete product module — CRUD with admin protection"
```

---

## Task 9: Cart Module

**Files:**

- Create: all files under `server/src/modules/cart/`

- [ ] **Step 1: Create cart domain (constants, errors, entity, repository interface)**

File: `server/src/modules/cart/domain/constants/cart.constant.ts`

```typescript
export const CartConstant = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 99,
} as const
```

File: `server/src/modules/cart/domain/errors/cart.error.ts`

```typescript
import { AppError } from '@shared/errors/app.error'

export class CartItemNotFoundError extends AppError {
  constructor(id: string) {
    super(404, `Cart item "${id}" not found`)
  }
}
```

File: `server/src/modules/cart/domain/entity/cart-item.entity.ts`

```typescript
export interface CartItemEntityProps {
  id: string
  userId: string
  productId: string
  variantName: Nullable<string>
  quantity: number
  createdAt: Date
  updatedAt: Date
}

export class CartItemEntity {
  private constructor(private readonly props: CartItemEntityProps) {}

  static create(props: Partial<CartItemEntityProps>): CartItemEntity {
    if (!props.userId) throw new Error('User ID is required')
    if (!props.productId) throw new Error('Product ID is required')
    if (!props.quantity || props.quantity < 1) throw new Error('Quantity must be at least 1')

    const now = new Date()

    return new CartItemEntity({
      id: props.id ?? '',
      userId: props.userId,
      productId: props.productId,
      variantName: props.variantName ?? null,
      quantity: props.quantity,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    })
  }

  static fromProps(props: CartItemEntityProps): CartItemEntity {
    return new CartItemEntity(props)
  }

  get id(): string {
    return this.props.id
  }
  get userId(): string {
    return this.props.userId
  }
  get productId(): string {
    return this.props.productId
  }
  get variantName(): Nullable<string> {
    return this.props.variantName
  }
  get quantity(): number {
    return this.props.quantity
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date {
    return this.props.updatedAt
  }

  updateQuantity(quantity: number): this {
    if (quantity < 1) throw new Error('Quantity must be at least 1')
    this.props.quantity = quantity
    this.props.updatedAt = new Date()
    return this
  }

  incrementQuantity(amount: number): this {
    this.props.quantity += amount
    this.props.updatedAt = new Date()
    return this
  }

  toJSON(): CartItemEntityProps {
    return { ...this.props }
  }
}
```

File: `server/src/modules/cart/domain/repository/cart-item.repository.interface.ts`

```typescript
import { CartItemEntity } from '../entity/cart-item.entity'

export interface ICartItemRepository {
  findByUserId(userId: string): Promise<CartItemEntity[]>
  findById(id: string): Promise<Nullable<CartItemEntity>>
  findByUserAndProduct(
    userId: string,
    productId: string,
    variantName: Nullable<string>
  ): Promise<Nullable<CartItemEntity>>
  create(item: CartItemEntity): Promise<CartItemEntity>
  update(item: CartItemEntity): Promise<CartItemEntity>
  delete(id: string): Promise<void>
  deleteByUserId(userId: string): Promise<void>
}
```

- [ ] **Step 2: Create cart infrastructure**

File: `server/src/modules/cart/infrastructure/schema/cart-item.schema.ts`

```typescript
import mongoose, { Schema, Document } from 'mongoose'

export interface CartItemDocument extends Document {
  userId: string
  productId: string
  variantName: string | null
  quantity: number
  createdAt: Date
  updatedAt: Date
}

const cartItemSchema = new Schema<CartItemDocument>(
  {
    userId: { type: String, required: true, index: true },
    productId: { type: String, required: true },
    variantName: { type: String, default: null },
    quantity: { type: Number, required: true, min: 1 },
  },
  { timestamps: true }
)

export const CartItemModel = mongoose.model<CartItemDocument>('CartItem', cartItemSchema)
```

File: `server/src/modules/cart/infrastructure/repository/cart-item.repository.mongoose-mongo.ts`

```typescript
import { ICartItemRepository } from '../../domain/repository/cart-item.repository.interface'
import { CartItemEntity } from '../../domain/entity/cart-item.entity'
import { CartItemModel, CartItemDocument } from '../schema/cart-item.schema'

export class CartItemRepositoryMongooseMongo implements ICartItemRepository {
  private toEntity(doc: CartItemDocument): CartItemEntity {
    return CartItemEntity.fromProps({
      id: doc._id.toString(),
      userId: doc.userId,
      productId: doc.productId,
      variantName: doc.variantName,
      quantity: doc.quantity,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }

  async findByUserId(userId: string): Promise<CartItemEntity[]> {
    const docs = await CartItemModel.find({ userId })
    return docs.map((doc) => this.toEntity(doc))
  }

  async findById(id: string): Promise<Nullable<CartItemEntity>> {
    const doc = await CartItemModel.findById(id)
    return doc ? this.toEntity(doc) : null
  }

  async findByUserAndProduct(
    userId: string,
    productId: string,
    variantName: Nullable<string>
  ): Promise<Nullable<CartItemEntity>> {
    const doc = await CartItemModel.findOne({ userId, productId, variantName })
    return doc ? this.toEntity(doc) : null
  }

  async create(item: CartItemEntity): Promise<CartItemEntity> {
    const doc = await CartItemModel.create({
      userId: item.userId,
      productId: item.productId,
      variantName: item.variantName,
      quantity: item.quantity,
    })
    return this.toEntity(doc)
  }

  async update(item: CartItemEntity): Promise<CartItemEntity> {
    const doc = await CartItemModel.findByIdAndUpdate(item.id, { quantity: item.quantity }, { new: true })
    return this.toEntity(doc!)
  }

  async delete(id: string): Promise<void> {
    await CartItemModel.findByIdAndDelete(id)
  }

  async deleteByUserId(userId: string): Promise<void> {
    await CartItemModel.deleteMany({ userId })
  }
}
```

- [ ] **Step 3: Create cart use-cases, service, controller, DTOs, module**

Files are identical in pattern to product module. Create: `add-to-cart.use-case.ts`, `get-cart.use-case.ts`, `update-cart-item.use-case.ts`, `remove-cart-item.use-case.ts`, `clear-cart.use-case.ts`, `cart.service.ts`, `cart.controller.ts`, `add-to-cart.request.dto.ts`, `update-cart-item.request.dto.ts`, `cart-item.response.dto.ts`, `cart.module.ts`.

Follow exact same layering as product module. Key difference: all cart routes require auth. Add-to-cart checks if product+variant already exists in user's cart and increments quantity instead of duplicating.

See full file content in the codebase after implementation — pattern is identical to product module with `userId` from `req.user!.userId`.

- [ ] **Step 4: Commit**

```bash
git add server/src/modules/cart/
git commit -m "feat(cart): add cart module — add/update/remove items, clear cart"
```

---

## Task 10: Order Module

**Files:**

- Create: all files under `server/src/modules/order/`

- [ ] **Step 1: Create order domain**

File: `server/src/modules/order/domain/constants/order.constant.ts`

```typescript
export const OrderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus]
```

File: `server/src/modules/order/domain/errors/order.error.ts`

```typescript
import { AppError } from '@shared/errors/app.error'

export class OrderNotFoundError extends AppError {
  constructor(id: string) {
    super(404, `Order "${id}" not found`)
  }
}

export class InvalidOrderTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(400, `Cannot transition order from "${from}" to "${to}"`)
  }
}
```

File: `server/src/modules/order/domain/entity/order.entity.ts`

```typescript
import { OrderStatus } from '../constants/order.constant'

export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
}

export interface OrderEntityProps {
  id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  status: OrderStatus
  shippingAddress: string
  createdAt: Date
  updatedAt: Date
}

export class OrderEntity {
  private constructor(private readonly props: OrderEntityProps) {}

  static create(props: Partial<OrderEntityProps>): OrderEntity {
    if (!props.userId) throw new Error('User ID is required')
    if (!props.items || props.items.length === 0) throw new Error('Order must have at least one item')
    if (!props.shippingAddress) throw new Error('Shipping address is required')

    const items = props.items
    const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const now = new Date()

    return new OrderEntity({
      id: props.id ?? '',
      userId: props.userId,
      items,
      totalAmount,
      status: props.status ?? OrderStatus.PENDING,
      shippingAddress: props.shippingAddress,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    })
  }

  static fromProps(props: OrderEntityProps): OrderEntity {
    return new OrderEntity(props)
  }

  get id(): string {
    return this.props.id
  }
  get userId(): string {
    return this.props.userId
  }
  get items(): OrderItem[] {
    return this.props.items
  }
  get totalAmount(): number {
    return this.props.totalAmount
  }
  get status(): OrderStatus {
    return this.props.status
  }
  get shippingAddress(): string {
    return this.props.shippingAddress
  }
  get createdAt(): Date {
    return this.props.createdAt
  }
  get updatedAt(): Date {
    return this.props.updatedAt
  }

  isPending(): boolean {
    return this.props.status === OrderStatus.PENDING
  }
  isConfirmed(): boolean {
    return this.props.status === OrderStatus.CONFIRMED
  }
  isShipped(): boolean {
    return this.props.status === OrderStatus.SHIPPED
  }
  isDelivered(): boolean {
    return this.props.status === OrderStatus.DELIVERED
  }
  isCancelled(): boolean {
    return this.props.status === OrderStatus.CANCELLED
  }

  confirm(): this {
    if (!this.isPending()) throw new Error('Only pending orders can be confirmed')
    this.props.status = OrderStatus.CONFIRMED
    this.props.updatedAt = new Date()
    return this
  }

  ship(): this {
    if (!this.isConfirmed()) throw new Error('Only confirmed orders can be shipped')
    this.props.status = OrderStatus.SHIPPED
    this.props.updatedAt = new Date()
    return this
  }

  deliver(): this {
    if (!this.isShipped()) throw new Error('Only shipped orders can be delivered')
    this.props.status = OrderStatus.DELIVERED
    this.props.updatedAt = new Date()
    return this
  }

  cancel(): this {
    if (this.isDelivered()) throw new Error('Delivered orders cannot be cancelled')
    if (this.isCancelled()) throw new Error('Order is already cancelled')
    this.props.status = OrderStatus.CANCELLED
    this.props.updatedAt = new Date()
    return this
  }

  toJSON(): OrderEntityProps {
    return { ...this.props }
  }
}
```

File: `server/src/modules/order/domain/repository/order.repository.interface.ts`

```typescript
import { OrderEntity } from '../entity/order.entity'

export interface IOrderRepository {
  findAll(): Promise<OrderEntity[]>
  findById(id: string): Promise<Nullable<OrderEntity>>
  findByUserId(userId: string): Promise<OrderEntity[]>
  create(order: OrderEntity): Promise<OrderEntity>
  update(order: OrderEntity): Promise<OrderEntity>
}
```

- [ ] **Step 2: Create order infrastructure, use-cases, service, controller, DTOs, module**

Follow the exact same pattern as product module. Key points:

- `create-order.use-case.ts` receives cart items + shipping address, builds OrderItems, creates order, clears cart
- `get-my-orders.use-case.ts` filters by userId
- `get-all-orders.use-case.ts` for admin
- `update-order-status.use-case.ts` uses entity transition methods (confirm/ship/deliver/cancel)
- All order routes require auth. Admin routes for get-all and update-status.

- [ ] **Step 3: Commit**

```bash
git add server/src/modules/order/
git commit -m "feat(order): add order module — create from cart, status transitions, admin management"
```

---

## Task 11: Main Entry Point + Seed

**Files:**

- Create: `server/src/main.ts`
- Create: `server/src/seed.ts`

- [ ] **Step 1: Create main.ts**

File: `server/src/main.ts`

```typescript
import express, { type Express } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDatabase } from './config/database'
import { loggerMiddleware } from './shared/middlewares/logger.middleware'
import { errorHandlerMiddleware } from './shared/middlewares/error-handler.middleware'
import { createAuthModule } from './modules/auth/auth.module'
import { createUserModule } from './modules/user/user.module'
import { createProductModule } from './modules/product/product.module'
import { createCartModule } from './modules/cart/cart.module'
import { createOrderModule } from './modules/order/order.module'

dotenv.config()

const app: Express = express()
const PORT = process.env.PORT || 3001

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)
app.use(express.json())
app.use(loggerMiddleware)

const { router: authRouter, jwtService, userRepository } = createAuthModule()
app.use('/api/auth', authRouter)
app.use('/api/users', createUserModule(userRepository, jwtService))
app.use('/api/products', createProductModule(jwtService))
app.use('/api/cart', createCartModule(jwtService))
app.use('/api/orders', createOrderModule(jwtService))

app.use(errorHandlerMiddleware)

async function bootstrap(): Promise<void> {
  await connectDatabase(process.env.MONGODB_URI!)
  app.listen(PORT, () => {
    console.log(`PULSE API running on port ${PORT}`)
  })
}

bootstrap().catch(console.error)

export { app }
```

- [ ] **Step 2: Create seed.ts**

File: `server/src/seed.ts`

```typescript
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { connectDatabase } from './config/database'
import { UserModel } from './modules/auth/infrastructure/schema/user.schema'
import { ProductModel } from './modules/product/infrastructure/schema/product.schema'

dotenv.config()

async function seed(): Promise<void> {
  await connectDatabase(process.env.MONGODB_URI!)

  await UserModel.deleteMany({})
  await ProductModel.deleteMany({})

  const hashedPassword = await bcrypt.hash('password123', 10)

  await UserModel.create([
    { email: 'admin@pulse.io', password: hashedPassword, firstName: 'Admin', lastName: 'Pulse', role: 'admin' },
    { email: 'user@pulse.io', password: hashedPassword, firstName: 'Jean', lastName: 'Dupont', role: 'customer' },
  ])

  await ProductModel.create([
    {
      name: 'PULSE Classic',
      slug: 'pulse-classic',
      description: 'Bracelet NFC Event Pass - Design classique, compatible tous events.',
      price: 29.99,
      images: ['/images/pulse-classic.webp'],
      category: 'bracelet',
      variants: [
        { name: 'Noir', color: '#000000', priceModifier: 0 },
        { name: 'Blanc', color: '#FFFFFF', priceModifier: 0 },
        { name: 'Bleu Nuit', color: '#1a1a4e', priceModifier: 5 },
      ],
      stock: 150,
      featured: true,
    },
    {
      name: 'PULSE Pro',
      slug: 'pulse-pro',
      description: 'Bracelet NFC premium - Matériaux résistants, NFC longue portée, gravure personnalisée.',
      price: 49.99,
      images: ['/images/pulse-pro.webp'],
      category: 'bracelet',
      variants: [
        { name: 'Titane', color: '#808080', priceModifier: 0 },
        { name: 'Or Rose', color: '#b76e79', priceModifier: 10 },
      ],
      stock: 75,
      featured: true,
    },
    {
      name: 'Event Pass Standard',
      slug: 'event-pass-standard',
      description: 'Pass événement - Accès général, check-in NFC, networking activé.',
      price: 15.99,
      images: ['/images/pass-standard.webp'],
      category: 'pass',
      variants: [],
      stock: 500,
      featured: false,
    },
    {
      name: 'Event Pass VIP',
      slug: 'event-pass-vip',
      description: 'Pass VIP - Accès toutes zones, backstage, networking prioritaire.',
      price: 39.99,
      images: ['/images/pass-vip.webp'],
      category: 'pass',
      variants: [],
      stock: 100,
      featured: true,
    },
    {
      name: 'Bundle Festival',
      slug: 'bundle-festival',
      description: 'Pack complet : bracelet PULSE Classic + Pass VIP + housse de transport.',
      price: 59.99,
      images: ['/images/bundle-festival.webp'],
      category: 'bundle',
      variants: [
        { name: 'Noir', color: '#000000', priceModifier: 0 },
        { name: 'Blanc', color: '#FFFFFF', priceModifier: 0 },
      ],
      stock: 50,
      featured: true,
    },
  ])

  console.log('Seed complete: 2 users + 5 products')
  await mongoose.disconnect()
}

seed().catch(console.error)
```

- [ ] **Step 3: Commit**

```bash
git add server/src/main.ts server/src/seed.ts
git commit -m "feat: add main entry point and seed script with PULSE products"
```

---

## Task 12: Tests

**Files:**

- Create: `server/src/modules/auth/application/use-cases/register/register.use-case.spec.ts`
- Create: `server/src/modules/auth/application/use-cases/login/login.use-case.spec.ts`
- Create: `server/src/modules/product/domain/entity/product.entity.spec.ts`

- [ ] **Step 1: Create register use-case test**

File: `server/src/modules/auth/application/use-cases/register/register.use-case.spec.ts`

```typescript
import { RegisterUseCase } from './register.use-case'
import { UserAlreadyExistsError } from '../../../domain/errors/auth.error'
import { UserEntity } from '../../../domain/entity/user.entity'
import { IUserRepository } from '../../../domain/repository/user.repository.interface'
import { HashServiceSecurity } from '../../services/security/hash.service-security'
import { JwtServiceSecurity } from '../../services/security/jwt.service-security'

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase
  let mockUserRepository: jest.Mocked<IUserRepository>
  let mockHashService: jest.Mocked<HashServiceSecurity>
  let mockJwtService: jest.Mocked<JwtServiceSecurity>

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    }

    mockHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as unknown as jest.Mocked<HashServiceSecurity>

    mockJwtService = {
      generate: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtServiceSecurity>

    useCase = new RegisterUseCase(mockUserRepository, mockHashService, mockJwtService)
  })

  it('should register a new user and return a token', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)
    mockHashService.hash.mockResolvedValue('hashed-password')
    mockUserRepository.create.mockResolvedValue(
      UserEntity.fromProps({
        id: 'user-1',
        email: 'test@pulse.io',
        password: 'hashed-password',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
    )
    mockJwtService.generate.mockReturnValue('jwt-token-123')

    const result = await useCase.execute({
      email: 'test@pulse.io',
      password: 'password123',
      firstName: 'Jean',
      lastName: 'Dupont',
    })

    expect(result.token).toBe('jwt-token-123')
    expect(result.user.email).toBe('test@pulse.io')
    expect(mockHashService.hash).toHaveBeenCalledWith('password123')
    expect(mockUserRepository.create).toHaveBeenCalled()
  })

  it('should throw UserAlreadyExistsError if email is taken', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(
      UserEntity.fromProps({
        id: 'existing-user',
        email: 'test@pulse.io',
        password: 'hashed',
        firstName: 'Existing',
        lastName: 'User',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
    )

    await expect(
      useCase.execute({ email: 'test@pulse.io', password: 'password123', firstName: 'Jean', lastName: 'Dupont' })
    ).rejects.toThrow(UserAlreadyExistsError)
  })
})
```

- [ ] **Step 2: Create login use-case test**

File: `server/src/modules/auth/application/use-cases/login/login.use-case.spec.ts`

```typescript
import { LoginUseCase } from './login.use-case'
import { InvalidCredentialsError } from '../../../domain/errors/auth.error'
import { UserEntity } from '../../../domain/entity/user.entity'
import { IUserRepository } from '../../../domain/repository/user.repository.interface'
import { HashServiceSecurity } from '../../services/security/hash.service-security'
import { JwtServiceSecurity } from '../../services/security/jwt.service-security'

describe('LoginUseCase', () => {
  let useCase: LoginUseCase
  let mockUserRepository: jest.Mocked<IUserRepository>
  let mockHashService: jest.Mocked<HashServiceSecurity>
  let mockJwtService: jest.Mocked<JwtServiceSecurity>

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    }

    mockHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as unknown as jest.Mocked<HashServiceSecurity>

    mockJwtService = {
      generate: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtServiceSecurity>

    useCase = new LoginUseCase(mockUserRepository, mockHashService, mockJwtService)
  })

  it('should login and return a token for valid credentials', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(
      UserEntity.fromProps({
        id: 'user-1',
        email: 'test@pulse.io',
        password: 'hashed-password',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
    )
    mockHashService.compare.mockResolvedValue(true)
    mockJwtService.generate.mockReturnValue('jwt-token-456')

    const result = await useCase.execute({ email: 'test@pulse.io', password: 'password123' })

    expect(result.token).toBe('jwt-token-456')
    expect(result.user.email).toBe('test@pulse.io')
  })

  it('should throw InvalidCredentialsError if user not found', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)

    await expect(useCase.execute({ email: 'unknown@pulse.io', password: 'password123' })).rejects.toThrow(
      InvalidCredentialsError
    )
  })

  it('should throw InvalidCredentialsError if password is wrong', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(
      UserEntity.fromProps({
        id: 'user-1',
        email: 'test@pulse.io',
        password: 'hashed-password',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
    )
    mockHashService.compare.mockResolvedValue(false)

    await expect(useCase.execute({ email: 'test@pulse.io', password: 'wrong-password' })).rejects.toThrow(
      InvalidCredentialsError
    )
  })
})
```

- [ ] **Step 3: Create product entity test**

File: `server/src/modules/product/domain/entity/product.entity.spec.ts`

```typescript
import { ProductEntity } from './product.entity'

describe('ProductEntity', () => {
  it('should create a product with defaults', () => {
    const product = ProductEntity.create({ name: 'PULSE Classic', price: 29.99 })

    expect(product.name).toBe('PULSE Classic')
    expect(product.price).toBe(29.99)
    expect(product.slug).toBe('pulse-classic')
    expect(product.category).toBe('bracelet')
    expect(product.stock).toBe(0)
    expect(product.featured).toBe(false)
    expect(product.deletedAt).toBeNull()
  })

  it('should throw if name is missing', () => {
    expect(() => ProductEntity.create({ price: 10 })).toThrow('Product name is required')
  })

  it('should decrement stock', () => {
    const product = ProductEntity.create({ name: 'Test', price: 10, stock: 5 })
    product.decrementStock(3)
    expect(product.stock).toBe(2)
  })

  it('should throw on insufficient stock', () => {
    const product = ProductEntity.create({ name: 'Test', price: 10, stock: 2 })
    expect(() => product.decrementStock(5)).toThrow('Insufficient stock')
  })

  it('should soft delete', () => {
    const product = ProductEntity.create({ name: 'Test', price: 10 })
    expect(product.isDeleted()).toBe(false)
    product.softDelete()
    expect(product.isDeleted()).toBe(true)
    expect(product.deletedAt).not.toBeNull()
  })

  it('should update properties', () => {
    const product = ProductEntity.create({ name: 'Old', price: 10 })
    product.update({ name: 'New', price: 20, featured: true })
    expect(product.name).toBe('New')
    expect(product.price).toBe(20)
    expect(product.featured).toBe(true)
  })

  it('should serialize to JSON', () => {
    const product = ProductEntity.create({ name: 'Test', price: 10 })
    const json = product.toJSON()
    expect(json.name).toBe('Test')
    expect(json.price).toBe(10)
  })
})
```

- [ ] **Step 4: Run tests**

```bash
cd server && pnpm test
```

Expected: All 7 tests pass (2 register + 3 login + 7 product entity = 12 tests total, minimum 2 required by subject).

- [ ] **Step 5: Commit**

```bash
git add server/src/modules/auth/application/use-cases/register/register.use-case.spec.ts
git add server/src/modules/auth/application/use-cases/login/login.use-case.spec.ts
git add server/src/modules/product/domain/entity/product.entity.spec.ts
git commit -m "test: add unit tests for register, login use-cases and product entity"
```

---

## Task 13: Verify & Run

- [ ] **Step 1: Install dependencies**

```bash
cd server && pnpm install
```

- [ ] **Step 2: Run tests**

```bash
pnpm test
```

Expected: All tests pass.

- [ ] **Step 3: Seed database**

```bash
pnpm run seed
```

Expected: "Seed complete: 2 users + 5 products"

- [ ] **Step 4: Start server**

```bash
pnpm run dev
```

Expected: "PULSE API running on port 3001" + "Connected to MongoDB"

- [ ] **Step 5: Smoke test API**

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register -H "Content-Type: application/json" -d '{"email":"test@test.com","password":"test123","firstName":"Test","lastName":"User"}'

# Login
curl -X POST http://localhost:3001/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@pulse.io","password":"password123"}'

# Get products (public)
curl http://localhost:3001/api/products

# Get featured (public)
curl http://localhost:3001/api/products/featured
```

- [ ] **Step 6: Final commit**

```bash
git add -A
git commit -m "feat: complete backend e-commerce + auth — PULSE NFC Event Pass API"
```
