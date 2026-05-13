# NFC Public Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the public-facing participant experience: NFC bracelet → public profile page (Linktree-style), public event registration, and a private profile edit page — built on a model extension that replaces `linkedinUrl` with a flexible `links[]` collection.

**Architecture:** Three sequential phases. Phase 1 = model extension (Spec 3 backend + edit page) — unblocks Phases 2 & 3. Phase 2 = public event registration (Spec 1). Phase 3 = NFC public profile (Spec 2). Each phase is independently shippable. Follow project's hexagonal architecture (ports + adapters), TDD strict, no auto-commits, shadcn-vue mandatory for new UI.

**Tech Stack:** Backend = Express + Mongoose + Jest + mongodb-memory-server. Frontend = Vue 3 + TanStack Query + Vue Router + shadcn-vue + Tailwind + vue-sonner + lucide-vue-next. Client tests = Vitest + Playwright (to install).

**No-Commit Policy:** Per project memory, DO NOT run `git commit` automatically. Stop after each phase for user review.

**Plan-style note:** Backend domain logic (entities, use-cases, parsers, schemas) is shown in full because it carries the architectural value. Vue components are described by props/emits/shadcn primitives used — one representative full example is kept per family. The complete code lives in the repo, not in the plan.

---

## File Structure Overview

### Phase 1 — Model Extension (Spec 3)

**Backend — Create:**

- `server/src/modules/participant/domain/constants/profile-link-type.constant.ts` — 7-type whitelist
- `server/src/modules/participant/presentation/dto/profile-link.parser.ts` — shared `parseProfileLinks(raw)` (DRY)
- `server/src/modules/participant/application/use-cases/update-participant-profile/update-participant-profile.use-case.spec.ts` — covers 403 + validation

**Backend — Modify:**

- `server/src/modules/participant/domain/entity/participant.entity.ts` — `linkedinUrl` → `links: ProfileLink[]` + URL/type/count validation
- `server/src/modules/participant/domain/entity/participant.entity.spec.ts` — rewrite cases for `links`
- `server/src/modules/participant/domain/model/participant.domain-model.ts` — DTO shape sync
- `server/src/modules/participant/infrastructure/schema/participant.schema.ts` — Mongoose schema (links subdoc + enum)
- `server/src/modules/participant/presentation/dto/update-participant-profile.request.dto.ts` — use shared parser
- `server/src/modules/participant/presentation/dto/register-participant.request.dto.ts` — use shared parser
- `server/src/modules/participant/__tests__/participant.factory.ts` — `linkedinUrl` → `links: []`
- `server/src/seed.ts` — replace linkedinUrl with seeded links

**Frontend — Create:**

- `client/src/modules/participant/core/constants/profile-link-type.constant.ts`
- `client/src/modules/participant/ui/components/profile-fields-form.vue`
- `client/src/modules/participant/ui/components/profile-links-editor.vue`
- `client/src/modules/participant/ui/components/profile-link-row.vue`
- `client/src/modules/participant/ui/hooks/queries/query/use-get-participant-by-id.ts`
- `client/src/modules/participant/ui/hooks/queries/mutation/use-update-participant-profile.ts`
- `client/src/features/private/participant-profile-edit/participant-profile-edit.page.vue`
- `client/src/pages/me/events/page.vue`

**Frontend — Modify:**

- `client/src/modules/participant/core/model/participant.domain-model.ts`
- `client/src/main.ts` — `/me/events/:participantId` + extend guard for `requiresAuth`
- `client/src/features/public/login/login.page.vue` — honor `?redirect=`
- `client/src/features/public/register/register.page.vue` — honor `?redirect=`

### Phase 2 — Event Public Registration (Spec 1)

**Backend — Create:**

- `get-event-by-slug-public.use-case.ts` + `.spec.ts`

**Backend — Modify:**

- Event repo interface + mock + Mongoose impl: add `findBySlug(slug)`
- Event service + controller: add `getPublicBySlug` method
- `event.module.ts`: wire UC + register **public** route `GET /events/public/:slug` (no auth middleware, declared **before** `/`)

**Frontend — Create:**

- `use-get-event-public-by-slug.ts`
- `event-public-hero.vue`, `event-public-description.vue`, `event-not-available.vue`, `event-registration-form.vue`
- `event-public.page.vue` + `pages/events-public/page.vue`

**Frontend — Modify:**

- Event port + adapter: add `getPublicBySlug(slug)` method
- `main.ts`: add `/events/:slug` route

### Phase 3 — NFC Public Page (Spec 2)

**Frontend — Create (entirely new module):**

- `modules/nfc/core/{model,ports,adapters,errors}/...`
- `modules/nfc/ui/hooks/queries/query/use-get-nfc-by-id.ts`
- `modules/nfc/ui/components/{nfc-profile-hero,nfc-bio-section,nfc-link-card,link-icon,nfc-error-state}.vue`
- `features/public/nfc-profile/nfc-profile.page.vue` + `pages/p/page.vue`

**Frontend — Modify:**

- `dependencies.ts`: add `nfcPort`
- `main.ts`: add `/p/:nfcId` with `noLayout`

> **Backend Spec 2 = 0 changes.** Route `GET /api/nfc/:nfcId` (`server/src/routes/nfc.routes.ts`) already returns the exact shape Spec 2 consumes.

### Test Setup (Phase 0)

- Install: `@playwright/test`, `vitest`, `@vue/test-utils`, `jsdom`
- Install shadcn-vue: `input`, `label`, `textarea`, `select`, `card`, `avatar`
- Configs: `playwright.config.ts`, `vitest.config.ts`
- E2E auth seed: `src/e2e/global-setup.ts` + `fixtures/`

---

## Phase 0: Test Infrastructure + shadcn-vue Setup

### Task 0.1: Install client test dependencies

- [ ] **Step 1: Install dev deps**

```bash
cd client && pnpm add -D @playwright/test vitest @vue/test-utils jsdom @vitest/coverage-v8
```

- [ ] **Step 2: Install Chromium for Playwright**

```bash
cd client && pnpm exec playwright install chromium
```

- [ ] **Step 3: Add test scripts in `client/package.json`**

Add to the `scripts` object:

```json
"test": "vitest run",
"test:watch": "vitest",
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:debug": "playwright test --debug"
```

### Task 0.2: Vitest config

**Files:** Create `client/vitest.config.ts`.

- [ ] **Step 1: Write config**

```ts
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.vue.test.ts'],
    exclude: ['src/**/*.test.e2e.ts', 'node_modules/**'],
  },
})
```

### Task 0.3: Playwright config

**Files:** Create `client/playwright.config.ts`.

- [ ] **Step 1: Write config — 3 projects (`setup`, `smoke`, `authenticated`)**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './src',
  testMatch: '**/*.test.e2e.ts',
  timeout: 30_000,
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'list',
  use: { baseURL: 'http://localhost:5173', locale: 'fr-FR', timezoneId: 'Europe/Paris', trace: 'on-first-retry' },
  projects: [
    { name: 'setup', testMatch: 'src/e2e/global-setup.ts' },
    { name: 'smoke', testMatch: 'src/e2e/smoke/**/*.test.e2e.ts', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'authenticated',
      testMatch: 'src/**/*.test.e2e.ts',
      testIgnore: 'src/e2e/smoke/**',
      use: { ...devices['Desktop Chrome'], storageState: 'src/e2e/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
  webServer: {
    command: 'cd .. && pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
```

### Task 0.4: Auth seed for E2E

**Files:** Create `client/src/e2e/global-setup.ts`, `client/src/e2e/fixtures/seed.ts`, `client/src/e2e/fixtures/auth.fixture.ts`, `client/src/e2e/.gitignore` (containing `.auth/`).

- [ ] **Step 1: Seed helper (`fixtures/seed.ts`) — calls `POST /api/auth/register` (idempotent: on 4xx, falls back to `POST /api/auth/login`)**

- [ ] **Step 2: Global setup (`global-setup.ts`) — uses the seed helper, writes `localStorage.token` into `src/e2e/.auth/user.json` via Playwright `storageState`**

The global-setup is the only nontrivial file:

```ts
import { test as setup } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { signUpUser } from './fixtures/seed'

setup('seed baseline user + save auth state', async () => {
  if (process.env.E2E_SKIP_AUTH_SEED === '1') return
  const { token } = await signUpUser({
    firstName: 'E2E',
    lastName: 'User',
    email: 'e2e-baseline@pulse.test',
    password: 'Pulse2026Test!',
  })
  const authDir = resolve(process.cwd(), 'src/e2e/.auth')
  mkdirSync(authDir, { recursive: true })
  writeFileSync(
    resolve(authDir, 'user.json'),
    JSON.stringify({
      cookies: [],
      origins: [{ origin: 'http://localhost:5173', localStorage: [{ name: 'token', value: token }] }],
    })
  )
})
```

- [ ] **Step 3: Fixture re-export (`fixtures/auth.fixture.ts`) — `export { test, expect } from '@playwright/test'` (extension point for later test data fixtures)**

### Task 0.5: Verify test infra

- [ ] **Step 1: `cd client && pnpm test` → "no tests" exits cleanly**
- [ ] **Step 2: `cd client && pnpm exec playwright test --list` → lists 1 setup task**

### Task 0.6: Install shadcn-vue components needed by this plan

- [ ] **Step 1: Install**

```bash
cd client && pnpm dlx shadcn-vue@latest add input label textarea select card avatar
```

- [ ] **Step 2: Sanity check — read one of the index.ts files to confirm the named exports (`Input`, `Label`, etc.) match what the plan imports**

```bash
cd client && cat src/ui/input/index.ts
```

- [ ] **Step 3: `cd client && pnpm build` → PASS**

- [ ] **CHECKPOINT — Phase 0 complete.** Stop for user review.

---

## Phase 1: Model Extension + Profile Edit (Spec 3)

### Task 1.1: Backend — `ProfileLinkType` constant

**Files:** Create `server/src/modules/participant/domain/constants/profile-link-type.constant.ts`.

- [ ] **Step 1: Write the `as const` object + derived type** with values `linkedin | twitter | github | instagram | website | email | custom`.

```ts
export const ProfileLinkType = {
  LINKEDIN: 'linkedin',
  TWITTER: 'twitter',
  GITHUB: 'github',
  INSTAGRAM: 'instagram',
  WEBSITE: 'website',
  EMAIL: 'email',
  CUSTOM: 'custom',
} as const
export type ProfileLinkType = (typeof ProfileLinkType)[keyof typeof ProfileLinkType]
```

### Task 1.2: Backend — Entity test (RED)

**Files:** Modify `server/src/modules/participant/domain/entity/participant.entity.spec.ts`.

Rewrite the spec to cover the new `links[]` field. Cases to assert:

- `create()` with empty `links: []` works; defaults to `[]` when omitted
- `updateProfile({ links: [valid 3-link array] })` accepts
- Each invalid case **throws with a specific message**:
  - `'Invalid link type'` — unknown `type`
  - `'Invalid link URL'` — non-`https?://` URL on non-email; non-`mailto:` URL on email
  - `'Maximum 10 links allowed'` — array length 11
  - `'Custom link requires a label'` — `type: 'custom'` with `label: null`
- `toJSON()` includes `links`
- Keep existing tests for `displayName`/`role`/`bio`/`softDelete`/`attachBracelet`/`checkIn` but **remove** all `linkedinUrl` references

- [ ] **Step 1: Rewrite spec**
- [ ] **Step 2: Run — expect FAIL (entity still has `linkedinUrl`)**

```bash
cd server && pnpm test -- participant.entity.spec
```

### Task 1.3: Backend — Entity implementation (GREEN)

**Files:** Modify `server/src/modules/participant/domain/entity/participant.entity.ts`.

This is the core of Phase 1 — full code below because the validation logic is the contract.

- [ ] **Step 1: Replace entity file**

```ts
import { ProfileLinkType } from '../constants/profile-link-type.constant'

export interface ProfileLink {
  type: ProfileLinkType
  url: string
  label: Nullable<string>
}

export interface ParticipantProfile {
  displayName: string
  role: Nullable<string>
  bio: Nullable<string>
  links: ProfileLink[]
}

export interface ParticipantEntityProps {
  id: string
  userId: string
  eventId: string
  braceletId: Nullable<string>
  profile: ParticipantProfile
  registeredAt: Date
  checkedInAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}

const VALID_LINK_TYPES = Object.values(ProfileLinkType) as string[]
const URL_REGEX = /^https?:\/\/.+/
const MAILTO_REGEX = /^mailto:.+@.+\..+$/
const MAX_LINKS = 10

function validateLink(link: ProfileLink): void {
  if (!VALID_LINK_TYPES.includes(link.type)) throw new Error(`Invalid link type: ${link.type}`)
  if (link.type === ProfileLinkType.EMAIL) {
    if (!MAILTO_REGEX.test(link.url)) throw new Error('Invalid link URL (email must be mailto:)')
  } else if (!URL_REGEX.test(link.url)) {
    throw new Error(`Invalid link URL: ${link.url}`)
  }
  if (link.type === ProfileLinkType.CUSTOM && (!link.label || !link.label.trim())) {
    throw new Error('Custom link requires a label')
  }
}

function validateLinks(links: ProfileLink[]): void {
  if (links.length > MAX_LINKS) throw new Error(`Maximum ${MAX_LINKS} links allowed`)
  for (const link of links) validateLink(link)
}

export class ParticipantEntity {
  private constructor(private readonly props: ParticipantEntityProps) {}

  static create(props: Partial<ParticipantEntityProps>): ParticipantEntity {
    if (!props.userId) throw new Error('userId is required')
    if (!props.eventId) throw new Error('eventId is required')
    if (!props.profile?.displayName) throw new Error('displayName is required')

    const links = props.profile.links ?? []
    validateLinks(links)

    const now = new Date()
    return new ParticipantEntity({
      id: props.id ?? '',
      userId: props.userId,
      eventId: props.eventId,
      braceletId: props.braceletId ?? null,
      profile: {
        displayName: props.profile.displayName,
        role: props.profile.role ?? null,
        bio: props.profile.bio ?? null,
        links,
      },
      registeredAt: props.registeredAt ?? now,
      checkedInAt: props.checkedInAt ?? null,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
      deletedAt: props.deletedAt ?? null,
    })
  }

  static fromProps(props: ParticipantEntityProps): ParticipantEntity {
    return new ParticipantEntity(props)
  }

  get id(): string {
    return this.props.id
  }
  get userId(): string {
    return this.props.userId
  }
  get eventId(): string {
    return this.props.eventId
  }
  get braceletId(): Nullable<string> {
    return this.props.braceletId
  }
  get profile(): ParticipantProfile {
    return { ...this.props.profile, links: [...this.props.profile.links] }
  }
  get registeredAt(): Date {
    return this.props.registeredAt
  }
  get checkedInAt(): Nullable<Date> {
    return this.props.checkedInAt
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

  isDeleted(): boolean {
    return this.props.deletedAt !== null
  }
  hasBracelet(): boolean {
    return this.props.braceletId !== null
  }
  isCheckedIn(): boolean {
    return this.props.checkedInAt !== null
  }

  attachBracelet(braceletId: string): this {
    this.props.braceletId = braceletId
    this.props.updatedAt = new Date()
    return this
  }

  checkIn(): this {
    this.props.checkedInAt = new Date()
    this.props.updatedAt = new Date()
    return this
  }

  updateProfile(partial: Partial<ParticipantProfile>): this {
    if (partial.displayName !== undefined) {
      if (!partial.displayName.trim()) throw new Error('displayName cannot be empty')
      this.props.profile.displayName = partial.displayName
    }
    if (partial.role !== undefined) this.props.profile.role = partial.role
    if (partial.bio !== undefined) this.props.profile.bio = partial.bio
    if (partial.links !== undefined) {
      validateLinks(partial.links)
      this.props.profile.links = [...partial.links]
    }
    this.props.updatedAt = new Date()
    return this
  }

  softDelete(): void {
    if (!this.props.deletedAt) {
      this.props.deletedAt = new Date()
      this.props.updatedAt = new Date()
    }
  }

  toJSON(): ParticipantEntityProps {
    return { ...this.props, profile: { ...this.props.profile, links: [...this.props.profile.links] } }
  }
}
```

- [ ] **Step 2: `cd server && pnpm test -- participant.entity.spec` → PASS**

### Task 1.4: Backend — Shared parser

**Why a shared parser:** `parseProfileLinks` is used by both `UpdateParticipantProfileRequestDto` and `RegisterParticipantRequestDto`. Per project rule, extract.

**Files:** Create `server/src/modules/participant/presentation/dto/profile-link.parser.ts`.

- [ ] **Step 1: Write parser**

```ts
import { AppError } from '@shared/errors/app.error'
import type { ProfileLink } from '../../domain/entity/participant.entity'
import { ProfileLinkType } from '../../domain/constants/profile-link-type.constant'

const VALID_TYPES = Object.values(ProfileLinkType) as string[]

export function parseProfileLinks(raw: unknown): ProfileLink[] {
  if (!Array.isArray(raw)) throw new AppError(400, 'links must be an array')
  return raw.map((item, i) => {
    if (typeof item !== 'object' || item === null) throw new AppError(400, `links[${i}] must be an object`)
    const o = item as Record<string, unknown>
    if (typeof o.type !== 'string' || !VALID_TYPES.includes(o.type)) {
      throw new AppError(400, `links[${i}].type is invalid`)
    }
    if (typeof o.url !== 'string' || !o.url.trim()) throw new AppError(400, `links[${i}].url is required`)
    const label = o.label === undefined || o.label === null ? null : String(o.label)
    return { type: o.type as ProfileLink['type'], url: o.url, label }
  })
}
```

> Type-shape validation lives here (raw HTTP body → typed array). Domain validation (URL format, max-10, custom-needs-label) lives in the entity. Don't duplicate.

### Task 1.5: Backend — Update DTOs to use the parser

**Files:** Modify `update-participant-profile.request.dto.ts` and `register-participant.request.dto.ts`.

- [ ] **Step 1: In `update-participant-profile.request.dto.ts`:** remove the old `linkedinUrl` branch in the constructor. Add `links?: ProfileLink[]` field. In the constructor: `if (body.links !== undefined) this.links = parseProfileLinks(body.links)`. In `toPartialProfile()`: `if (this.links !== undefined) partial.links = this.links`.

- [ ] **Step 2: In `register-participant.request.dto.ts`:** find the profile-parsing block, remove `linkedinUrl`, add `links` using the same parser. Default `profile.links = []` when omitted.

Read the current file first to locate the exact lines:

```bash
cd server && cat src/modules/participant/presentation/dto/register-participant.request.dto.ts
```

### Task 1.6: Backend — Domain model sync

**Files:** Modify `server/src/modules/participant/domain/model/participant.domain-model.ts`.

- [ ] **Step 1: Re-export `ProfileLink` as `ProfileLinkDto` and drop `linkedinUrl` from all DTOs**

```ts
import type { ParticipantEntityProps, ParticipantProfile, ProfileLink } from '../entity/participant.entity'

export namespace ParticipantDomainModel {
  export type ProfileLinkDto = ProfileLink
  export type ParticipantProfileDto = ParticipantProfile
  export type ParticipantOverviewDto = ParticipantEntityProps
  export type CreateParticipantDto = { userId: string; eventId: string; profile: ParticipantProfile }
  export type UpdateParticipantProfileDto = Partial<ParticipantProfile>
}
```

### Task 1.7: Backend — Mongoose schema migration

**Files:** Modify `server/src/modules/participant/infrastructure/schema/participant.schema.ts`.

- [ ] **Step 1: Replace `linkedinUrl` field with a `links` subdoc array**

Key changes:

- Add `profileLinkSchema` with `type` (enum from `ProfileLinkType`), `url` (required string), `label` (string, default null), `_id: false`
- In `profileSchema`: drop `linkedinUrl`, add `links: { type: [profileLinkSchema], default: [] }`

- [ ] **Step 2: Search for any `linkedinUrl` reference in the repo:**

```bash
cd server && grep -rn linkedinUrl src/
```

Replace in `participant.repository.mongoose-mongo.ts` if found (the `toEntity` mapping).

### Task 1.8: Backend — Factory + use-case test

**Files:** Modify `__tests__/participant.factory.ts`. Create `update-participant-profile.use-case.spec.ts`.

- [ ] **Step 1: Factory** — change default profile from `{ ..., linkedinUrl: null }` to `{ ..., links: [] }`.

- [ ] **Step 2: Use-case spec** — assert: 200 when owner; 403 `AppError` when `requesterId !== participant.userId`; `ParticipantNotFoundError` when repo returns null.

(Ownership check already exists in `update-participant-profile.use-case.ts:13` — this test just locks the behavior.)

- [ ] **Step 3: `cd server && pnpm test -- update-participant-profile.use-case.spec` → PASS**

### Task 1.9: Backend — Seed update

**Files:** Modify `server/src/seed.ts`.

- [ ] **Step 1:** Replace every `linkedinUrl: '...'` in seeded participants with a `links: [...]` array. **Required for Spec 2 demo**: one participant must use `nfcId='demo-nfc-001'` (bracelet `active`) on event slug `pulse-demo-2026`, with these 3 links:

```ts
links: [
  { type: 'linkedin', url: 'https://linkedin.com/in/marie-dubois', label: null },
  { type: 'github', url: 'https://github.com/mariedubois', label: null },
  { type: 'custom', url: 'https://calendly.com/marie-dubois', label: 'Calendly' },
],
```

- [ ] **Step 2: `cd .. && pnpm seed` → runs without error**

### Task 1.10: Backend — Full test suite

- [ ] **Step 1: `cd server && pnpm test`**

Expected: all green. If unrelated tests break (likely `register-participant.use-case.spec.ts` if it uses factories), update fixtures to include `links: []`.

### Task 1.11: Frontend — Domain sync (constant + model)

**Files:**

- Create: `client/src/modules/participant/core/constants/profile-link-type.constant.ts` (mirror of server constant)
- Modify: `client/src/modules/participant/core/model/participant.domain-model.ts` — replace `linkedinUrl: string | null` with `links: ProfileLinkDto[]` everywhere; add `ProfileLinkDto` type.

- [ ] **Step 1: Constant** — same `as const` object as server.

- [ ] **Step 2: Domain model**

```ts
import type { ProfileLinkType } from '../constants/profile-link-type.constant'

export namespace ParticipantDomainModel {
  export type ProfileLinkDto = { type: ProfileLinkType; url: string; label: string | null }
  export type ParticipantProfileDto = {
    displayName: string
    role: string | null
    bio: string | null
    links: ProfileLinkDto[]
  }
  export type ParticipantOverviewDto = {
    id: string
    userId: string
    eventId: string
    braceletId: string | null
    profile: ParticipantProfileDto
    registeredAt: string
    checkedInAt: string | null
    createdAt: string
    updatedAt: string
  }
  export type RegisterParticipantDto = {
    eventId: string
    profile: { displayName: string; role?: string | null; bio?: string | null; links?: ProfileLinkDto[] }
  }
  export type UpdateParticipantProfileDto = {
    displayName?: string
    role?: string | null
    bio?: string | null
    links?: ProfileLinkDto[]
  }
  export type AttachBraceletDto = { braceletId: string }
}
```

- [ ] **Step 3: `cd client && pnpm build` → PASS** (HTTP adapter should compile unchanged; if it references `linkedinUrl`, remove)

### Task 1.12: Frontend — Hooks

**Files:** Create `use-get-participant-by-id.ts` (query) and `use-update-participant-profile.ts` (mutation) under `client/src/modules/participant/ui/hooks/queries/`.

- Both follow the existing project pattern (`use-get-event-by-id.ts`, `use-create-event.ts`).
- Query key: `['participants', id]`.
- Mutation invalidates `['participants', id]` and `['participants', 'me']` on success.
- Use `useDependencies()` to access `participantPort`.

### Task 1.13: Frontend — Components (shadcn-vue)

3 components, all under `client/src/modules/participant/ui/components/`.

**`profile-link-row.vue`** — props `link: ProfileLinkDto`, emits `update | remove`. Uses `Select` (link type), `Input` (URL), conditional `Input` for label (only when `type === 'custom'`), `Button variant="outline" size="icon"` with `Trash2` icon for remove.

**`profile-links-editor.vue`** — `v-model: ProfileLinkDto[]`. Lists `<ProfileLinkRow>` per item. `Button variant="outline" class="border-dashed"` to add a new link (default `type: WEBSITE`, empty url). Disable add at 10 links.

**`profile-fields-form.vue`** — `v-model: { displayName, role, bio }`. Three field groups with shadcn-vue `Label` + `Input`/`Textarea`. Bio is a `Textarea` rows="3".

> **Full code for one representative example** — `profile-link-row.vue` (the other two follow the same shadcn-vue pattern):

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import { Input } from '@/ui/input'
import { Button } from '@/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/ui/select'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'
import { ProfileLinkType } from '@/modules/participant/core/constants/profile-link-type.constant'

type Link = ParticipantDomainModel.ProfileLinkDto
const props = defineProps<{ link: Link }>()
const emit = defineEmits<{ update: [Link]; remove: [] }>()
const isCustom = computed(() => props.link.type === ProfileLinkType.CUSTOM)
const linkTypes = Object.values(ProfileLinkType)

function update<K extends keyof Link>(field: K, value: Link[K]): void {
  emit('update', { ...props.link, [field]: value })
}
</script>

<template>
  <div class="flex items-start gap-2">
    <Select :model-value="link.type" @update:model-value="(v) => update('type', v as Link['type'])">
      <SelectTrigger class="w-36"><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem v-for="t in linkTypes" :key="t" :value="t">{{ t }}</SelectItem>
      </SelectContent>
    </Select>
    <Input
      :model-value="link.url"
      placeholder="https://..."
      class="flex-1"
      @update:model-value="(v) => update('url', String(v))"
    />
    <Input
      v-if="isCustom"
      :model-value="link.label ?? ''"
      placeholder="Label"
      class="w-32"
      @update:model-value="(v) => update('label', String(v) || null)"
    />
    <Button type="button" variant="outline" size="icon" aria-label="Supprimer" @click="emit('remove')">
      <Trash2 class="h-4 w-4" />
    </Button>
  </div>
</template>
```

> If shadcn-vue's `Select` exports differ in your install, read `src/ui/select/index.ts` to find the canonical names.

### Task 1.14: Frontend — Route + guard + redirect

**Files:** Modify `client/src/main.ts` and `login.page.vue` / `register.page.vue`.

- [ ] **Step 1: In `main.ts`** — add route `/me/events/:participantId` with `meta: { requiresAuth: true }`. Update the guard:

```ts
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAdmin) {
    if (!token) return { path: '/login', query: { redirect: to.fullPath } }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'admin') return '/' // was '/login' — loops for authed non-admin
    } catch {
      return '/login'
    }
  }
  if (to.meta.requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})
```

- [ ] **Step 2: In `login.page.vue`** — import `useRoute`, replace `router.push(isAdmin() ? '/admin/dashboard' : '/')` with:

```ts
const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : null
router.push(redirect ?? (isAdmin() ? '/admin/dashboard' : '/'))
```

- [ ] **Step 3: Same change in `register.page.vue`** (read it first to locate the post-register push).

### Task 1.15: Frontend — Page wrapper + feature page

**Files:**

- Create: `client/src/pages/me/events/page.vue` — minimal wrapper that imports + renders the feature page
- Create: `client/src/features/private/participant-profile-edit/participant-profile-edit.page.vue`

**Feature page behavior:**

- Read `participantId` from route
- `useGetParticipantById(participantId)` — handle loading / error / success
- Local refs for `fields` (displayName/role/bio) and `links`; `watch(data, …, { immediate: true })` to hydrate on success
- Watch `error` for 403/forbidden → toast + `router.push('/')`
- Validation before save (same rules as backend, surfaced via toast)
- Save = `useUpdateParticipantProfile()` mutation
- Layout: 2 shadcn `Card` sections (Identité / Liens) + `Button` Enregistrer

> Full file isn't included — it's straightforward shadcn-vue composition over `ProfileFieldsForm` + `ProfileLinksEditor` + the mutation hook. Wire it during implementation; if a pattern is unclear, see `event-registration-form.vue` (Task 2.9) for the full shadcn-vue example.

### Task 1.16: Frontend — E2E test

**Files:** Create `client/src/features/private/participant-profile-edit/participant-profile-edit.test.e2e.ts`.

**Cases to cover:**

- Anonymous user → `/me/events/some-id` → redirects to `/login?redirect=…` (URL-encoded path).
- Authenticated baseline user fetches `/api/participants/me`; if list is empty, `test.skip()` with a clear message (seed must populate a participation for E2E coverage).
- Authenticated user edits `displayName`, adds 1 LinkedIn link, saves → toast "Profil mis à jour" visible.

Use Playwright `page.getByRole`, `page.getByLabel`, `page.getByPlaceholder`. Token comes from the `storageState` fixture.

- [ ] **Step 1: Write test, run `pnpm test:e2e --grep "Participant Profile"` — expect PASS or controlled `test.skip`**

### Task 1.17: Frontend — Verify

- [ ] **Step 1: `cd client && pnpm build` → PASS**
- [ ] **Step 2: `cd client && pnpm lint` → PASS**
- [ ] **CHECKPOINT — Phase 1 complete.** Stop for user review.

---

## Phase 2: Event Public Page + Registration (Spec 1)

### Task 2.1: Backend — `findBySlug` on repo interface + mock

**Files:** Modify `event.repository.interface.ts` and `__tests__/event.repository.mock.ts`.

- [ ] **Step 1: Interface** — add `findBySlug(slug: string): Promise<Nullable<EventEntity>>` after `findById`.

- [ ] **Step 2: Mock** — same pattern as `findById_result` / `findById_calledWith`:

```ts
findBySlug_result: Nullable<EventEntity> = null
findBySlug_calledWith: string | null = null
async findBySlug(slug: string): Promise<Nullable<EventEntity>> {
  this.findBySlug_calledWith = slug
  return this.findBySlug_result
}
```

### Task 2.2: Backend — Use-case test (RED)

**Files:** Create `server/src/modules/event/application/use-cases/get-event-by-slug-public/get-event-by-slug-public.use-case.spec.ts`.

**Cases:**

- `status: UPCOMING` → returns event
- `status: IN_PROGRESS` → returns event
- `status: DRAFT` → throws `AppError`
- `status: COMPLETED` → throws `AppError`
- `findBySlug_result = null` → throws `EventNotFoundError`
- soft-deleted event → throws `EventNotFoundError`

Use `createEventFixture({ status })` from `event.factory.ts`.

- [ ] **Step 1: Write spec, run, expect FAIL (use-case doesn't exist yet)**

### Task 2.3: Backend — Use-case (GREEN)

**Files:** Create `server/src/modules/event/application/use-cases/get-event-by-slug-public/get-event-by-slug-public.use-case.ts`.

```ts
import { EventEntity } from '../../../domain/entity/event.entity'
import { IEventRepository } from '../../../domain/repository/event.repository.interface'
import { EventNotFoundError } from '../../../domain/errors/event.error'
import { AppError } from '@shared/errors/app.error'

export class GetEventBySlugPublicUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}
  async execute(slug: string): Promise<EventEntity> {
    const event = await this.eventRepository.findBySlug(slug)
    if (!event || event.isDeleted()) throw new EventNotFoundError(slug)
    if (!event.isUpcoming() && !event.isInProgress()) throw new AppError(404, 'Event not available')
    return event
  }
}
```

- [ ] **Step 1: Write file, run spec → PASS**

### Task 2.4: Backend — Repository implementation

**Files:** Modify `event.repository.mongoose-mongo.ts`.

- [ ] **Step 1: Add `findBySlug` method**

```ts
async findBySlug(slug: string): Promise<Nullable<EventEntity>> {
  const doc = await EventModel.findOne({ slug, deletedAt: null })
  return doc ? toEntity(doc) : null
}
```

### Task 2.5: Backend — Service + controller + wiring

**Files:** Modify `event.service.ts`, `event.controller.ts`, `event.module.ts`.

- [ ] **Step 1: Service** — add `private readonly getEventBySlugPublicUC` to constructor signature, expose `getPublicBySlug(slug) → this.getEventBySlugPublicUC.execute(slug)`.

- [ ] **Step 2: Controller** — add `getPublicBySlug(req, res, next)` method following the existing controller pattern (try / await service / `res.json({ success: true, data: new EventResponseDto(event) })` / `catch → next(e)`).

- [ ] **Step 3: `event.module.ts`** — instantiate `new GetEventBySlugPublicUseCase(eventRepository)`, pass to `EventService` constructor (positional last). **Register the public route BEFORE auth-protected routes:**

```ts
const router = Router()
router.get('/public/:slug', (req, res, next) => controller.getPublicBySlug(req, res, next))
router.post('/', auth, ...)
// ... rest unchanged
```

- [ ] **Step 4: `cd server && pnpm test` → all green**

### Task 2.6: Backend — Manual verification

- [ ] **Step 1: Start server with seed**

```bash
cd .. && pnpm seed && cd server && pnpm dev
```

- [ ] **Step 2: Curl**

```bash
curl -i http://localhost:3001/api/events/public/pulse-demo-2026
curl -i http://localhost:3001/api/events/public/does-not-exist  # → 404
```

### Task 2.7: Frontend — Port + adapter + hook

**Files:** Modify `event.port.ts`, `event.adapter.http.ts`. Create `use-get-event-public-by-slug.ts`.

- [ ] **Step 1: Port** — add `getPublicBySlug(slug: string): Promise<EventDomainModel.EventOverviewDto>`.
- [ ] **Step 2: Adapter** — implement: `GET /events/public/${slug}`, unwrap envelope, throw on error (same pattern as other methods in the file).
- [ ] **Step 3: Hook** — `useQuery({ queryKey: ['events', 'public', slug], queryFn: …, retry: false })`. Mirror `use-get-event-by-id.ts` style.

### Task 2.8: Frontend — Display components

**Files:** Create under `client/src/modules/event/ui/components/`:

- `event-public-hero.vue` — gradient banner. Props: `name | startsAt | endsAt | city | venueName`. Date range via `Intl.DateTimeFormat('fr-FR', { day, month, year })`. Uses `Calendar` + `MapPin` icons from lucide. Custom gradient is OK here (it's a hero, no shadcn equivalent).
- `event-public-description.vue` — shadcn `Card` with `CardHeader/CardTitle` "À propos" + `CardContent` containing the description text (`whitespace-pre-line`).
- `event-not-available.vue` — centered shadcn `Card` with friendly error copy.

### Task 2.9: Frontend — `<event-registration-form>` (the most complex Vue component in the plan)

**Files:** Create `client/src/modules/event/ui/components/event-registration-form.vue`.

**Behavior:**

- Reads auth state via `useAuth().isAuthenticated()` (verify the hook exists; if not, read `use-auth.ts` and add the method — returns `Boolean(localStorage.getItem('token'))`)
- Branch UI on `isLoggedIn`:
  - **Anonymous**: shows account fields (firstName, lastName, email, password) + `RouterLink` to `/login?redirect=route.fullPath`
  - **Authenticated**: hides account fields
- Always shows profile fields: `displayName` (required) + `role` + `bio` (Textarea) + `<ProfileLinksEditor v-model="profileFields.links">`
- Client-side validation (toast on first failure) mirrors backend rules: email regex, password ≥ 8, URL/mailto regex, ≤ 10 links, custom-needs-label
- On submit:
  - If anonymous → `authPort.register()` → store token in localStorage + `httpClient.setAuthToken()`
  - Always → `participantPort.register({ eventId, profile })`
  - Success → toast + `router.push('/me/events/<id>')`
  - On `ParticipantAlreadyRegisteredError` (string match in message) → fetch `getMyParticipations()`, find matching `eventId`, redirect there

**Full code (representative shadcn-vue pattern — reuse elsewhere):**

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { toast } from 'vue-sonner'
import { Input } from '@/ui/input'
import { Label } from '@/ui/label'
import { Textarea } from '@/ui/textarea'
import { Button } from '@/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import { useAuth } from '@/modules/auth/ui/hooks/use-auth'
import { getSharedHttpClient } from '@/modules/shared/http/http-client'
import ProfileLinksEditor from '@/modules/participant/ui/components/profile-links-editor.vue'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'

const props = defineProps<{ eventId: string }>()
const router = useRouter()
const route = useRoute()
const { authPort, participantPort } = useDependencies()
const { isAuthenticated } = useAuth()

const isLoggedIn = computed(() => isAuthenticated())
const accountFields = ref({ firstName: '', lastName: '', email: '', password: '' })
const profileFields = ref<{
  displayName: string
  role: string | null
  bio: string | null
  links: ParticipantDomainModel.ProfileLinkDto[]
}>({ displayName: '', role: null, bio: null, links: [] })
const isLoading = ref(false)

function validate(): boolean {
  if (!profileFields.value.displayName.trim()) {
    toast.error('Le nom affiché est obligatoire')
    return false
  }
  if (!isLoggedIn.value) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(accountFields.value.email)) {
      toast.error('Email invalide')
      return false
    }
    if (accountFields.value.password.length < 8) {
      toast.error('Mot de passe ≥ 8 caractères')
      return false
    }
    if (!accountFields.value.firstName.trim() || !accountFields.value.lastName.trim()) {
      toast.error('Prénom et nom obligatoires')
      return false
    }
  }
  for (const link of profileFields.value.links) {
    if (link.type === 'email' && !/^mailto:.+@.+\..+$/.test(link.url)) {
      toast.error('Email mailto: requis')
      return false
    }
    if (link.type !== 'email' && !/^https?:\/\/.+/.test(link.url)) {
      toast.error('URL http(s)// requise')
      return false
    }
    if (link.type === 'custom' && (!link.label || !link.label.trim())) {
      toast.error('Custom: label requis')
      return false
    }
  }
  if (profileFields.value.links.length > 10) {
    toast.error('Maximum 10 liens')
    return false
  }
  return true
}

async function handleSubmit(): Promise<void> {
  if (!validate()) return
  isLoading.value = true
  try {
    if (!isLoggedIn.value) {
      const auth = await authPort.register(accountFields.value)
      localStorage.setItem('token', auth.token)
      getSharedHttpClient().setAuthToken(auth.token)
    }
    const participant = await participantPort.register({ eventId: props.eventId, profile: profileFields.value })
    toast.success('Inscription confirmée !')
    router.push(`/me/events/${participant.id}`)
  } catch (e) {
    const message = e instanceof Error ? e.message : ''
    if (message.toLowerCase().includes('already registered')) {
      try {
        const mine = await participantPort.getMyParticipations()
        const existing = mine.find((p) => p.eventId === props.eventId)
        if (existing) {
          toast.info('Vous êtes déjà inscrit')
          router.push(`/me/events/${existing.id}`)
          return
        }
      } catch {
        /* fall through */
      }
    }
    toast.error(message || "Erreur lors de l'inscription")
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-sm uppercase tracking-wider text-muted-foreground">Inscription</CardTitle>
    </CardHeader>
    <CardContent>
      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <template v-if="!isLoggedIn">
          <div class="grid grid-cols-2 gap-3">
            <div class="flex flex-col gap-1.5">
              <Label for="fn">Prénom</Label><Input id="fn" v-model="accountFields.firstName" />
            </div>
            <div class="flex flex-col gap-1.5">
              <Label for="ln">Nom</Label><Input id="ln" v-model="accountFields.lastName" />
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="em">Email</Label><Input id="em" v-model="accountFields.email" type="email" />
          </div>
          <div class="flex flex-col gap-1.5">
            <Label for="pw">Mot de passe</Label
            ><Input id="pw" v-model="accountFields.password" type="password" placeholder="8+ caractères" />
          </div>
          <RouterLink
            :to="{ path: '/login', query: { redirect: route.fullPath } }"
            class="text-xs text-primary hover:underline"
          >
            J'ai déjà un compte
          </RouterLink>
        </template>

        <div class="flex flex-col gap-1.5">
          <Label for="dn">Nom affiché</Label><Input id="dn" v-model="profileFields.displayName" />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="ro">Rôle (optionnel)</Label>
          <Input
            id="ro"
            :model-value="profileFields.role ?? ''"
            @update:model-value="(v) => (profileFields.role = String(v) || null)"
          />
        </div>
        <div class="flex flex-col gap-1.5">
          <Label for="bi">Bio (optionnel)</Label>
          <Textarea
            id="bi"
            :model-value="profileFields.bio ?? ''"
            rows="3"
            @update:model-value="(v) => (profileFields.bio = String(v) || null)"
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label>Liens (optionnel)</Label><ProfileLinksEditor v-model="profileFields.links" />
        </div>

        <Button type="submit" :disabled="isLoading">{{ isLoading ? 'Inscription…' : "S'inscrire" }}</Button>
      </form>
    </CardContent>
  </Card>
</template>
```

### Task 2.10: Frontend — Feature page + wrapper + route

**Files:**

- Create `client/src/pages/events-public/page.vue` — wrapper importing the feature page (3 lines).
- Create `client/src/features/public/event-public/event-public.page.vue`.
- Modify `client/src/main.ts` — add `{ path: '/events/:slug', name: 'event-public', component: () => import('./pages/events-public/page.vue') }` (default layout, no auth).

**Feature page behavior:** read `route.params.slug`, call `useGetEventPublicBySlug(slug)`. States:

- `isLoading` → loading card
- `isError || !data` → `<EventNotAvailable />`
- success → `<EventPublicHero />` on top, 2-col grid below with `<EventPublicDescription>` left + `<EventRegistrationForm :event-id="data.id">` right

### Task 2.11: Frontend — E2E test

**Files:** Create `client/src/features/public/event-public/event-public.test.e2e.ts`.

**Cases (anonymous context, fresh `browser.newContext`):**

- `/events/pulse-demo-2026` → hero `<h1>` visible, "À propos" visible, "S'inscrire" button visible
- `/events/does-not-exist` → "n'est pas disponible" text visible

- [ ] **Step 1: `pnpm test:e2e --grep "Event Public"` → PASS**

### Task 2.12: Verify

- [ ] **`cd client && pnpm build && pnpm lint` → PASS**
- [ ] **CHECKPOINT — Phase 2 complete.** Stop for user review.

---

## Phase 3: NFC Public Page (Spec 2)

### Task 3.1: Frontend — NFC module (core)

**Files:** Create under `client/src/modules/nfc/core/`:

- `model/nfc.domain-model.ts` — `NfcDomainModel.NfcTapResponseDto` (matches the server's response shape: bracelet/participant/event tri-object; participant reuses `ParticipantProfileDto` from the participant module — links flow through here).
- `ports/nfc.port.ts` — `INfcPort.getByNfcId(nfcId): Promise<NfcTapResponseDto>`.
- `errors/nfc.error.ts` — `NfcBraceletNotActiveError extends DomainError` with code `NFC_BRACELET_NOT_ACTIVE`. (Check if a `DomainError` base class exists in `modules/shared/errors/`; if not, create one — `class DomainError extends Error { constructor(message: string, public readonly code: string) { super(message); this.name = this.constructor.name } }`.)
- `adapters/nfc.adapter.http.ts` — `GET /nfc/${nfcId}`, unwrap envelope. **On error with status 404, throw `NfcBraceletNotActiveError`**, else throw `Error(message)`. Read `client/src/modules/shared/types/http.type.ts` to confirm the error field is `status` (vs `statusCode`).

### Task 3.2: Frontend — Wire `nfcPort` into dependencies

**Files:** Modify `client/src/modules/app/core/dependencies.ts`.

- [ ] **Step 1:** Add import, add `nfcPort: INfcPort` to the `Dependencies` type, instantiate `new NfcHttpAdapter(httpClient)` in `createDependencies()`.

### Task 3.3: Frontend — Query hook

**Files:** Create `client/src/modules/nfc/ui/hooks/queries/query/use-get-nfc-by-id.ts`.

`useQuery({ queryKey: ['nfc', nfcId], queryFn: () => nfcPort.getByNfcId(nfcId), retry: false })`. Mirror the existing `useGetEventById` shape.

### Task 3.4: Frontend — Display components

5 components under `client/src/modules/nfc/ui/components/`. All are display-only (no forms), so shadcn-vue is limited to `Card` and `Avatar`.

- **`link-icon.vue`** — props `type: string`. Switch over `ProfileLinkType` → renders the matching lucide icon (`Linkedin` | `Twitter` | `Github` | `Instagram` | `Globe` | `Mail` | fallback `Link`).

- **`nfc-link-card.vue`** — props `link: ProfileLinkDto`. Renders `<a :href="computedHref">` containing `LinkIcon` + label + `ChevronRight`. `href` logic: for `email`, prepend `mailto:` if not already; for others, use `url` as-is. Label resolution: `custom → link.label`, otherwise hardcoded map ("LinkedIn", "Twitter", "GitHub", "Instagram", "Site web", "Email"). Tailwind classes: rounded card, hover violet border, gradient bg.

- **`nfc-profile-hero.vue`** — props `displayName | role | eventName | startsAt | endsAt`. Renders `<Avatar><AvatarFallback>{{ initials }}</AvatarFallback></Avatar>` with gradient bg, plus heading + role + event/date subline. Initials = first letter of each word, up to 2 chars.

- **`nfc-bio-section.vue`** — props `bio: string | null`. Renders shadcn `Card` containing the bio paragraph. Returns empty when bio is null.

- **`nfc-error-state.vue`** — props `variant?: 'not-active' | 'network'`. Renders shadcn `Card` with two copies: "Ce bracelet n'est pas activé / Adressez-vous à l'organisateur" or "Impossible de joindre le serveur / Réessayez dans un instant".

### Task 3.5: Frontend — Feature page + wrapper + route

**Files:**

- Create `client/src/pages/p/page.vue` — wrapper.
- Create `client/src/features/public/nfc-profile/nfc-profile.page.vue` — reads `route.params.nfcId`, calls `useGetNfcByNfcId(nfcId)`, branches loading / `<NfcErrorState :variant="error instanceof NfcBraceletNotActiveError ? 'not-active' : 'network'">` / success layout (hero + bio + N `<NfcLinkCard>` per link). Dark gradient background, max-w-md centered.
- Modify `client/src/main.ts` — add route `{ path: '/p/:nfcId', name: 'nfc-profile', component: () => import('./pages/p/page.vue'), meta: { noLayout: true } }`.

### Task 3.6: Frontend — Unit tests

**Files:**

- `nfc.adapter.http.test.ts` — mock `HttpClient.get`, assert: returns the DTO on success; throws `NfcBraceletNotActiveError` on 404 error response.
- `link-icon.vue.test.ts` — for each `(type, expected lucide component)` pair, mount and assert the right icon is rendered.

- [ ] **Step 1: `cd client && pnpm test` → green**

### Task 3.7: Frontend — E2E test

**Files:** Create `client/src/features/public/nfc-profile/nfc-profile.test.e2e.ts`.

**Cases (anonymous context):**

- `/p/demo-nfc-001` → `getByText('Marie Dubois')` visible; 3 `<a>` link cards visible (LinkedIn / GitHub / Calendly labels).
- `/p/does-not-exist` → "n'est pas activé" text visible.

- [ ] **Step 1: `pnpm test:e2e --grep "NFC Profile"` → PASS** (requires seed)

### Task 3.8: Final verification

- [ ] **Step 1: `cd client && pnpm build && pnpm lint` → PASS**
- [ ] **Step 2: Manual smoke (`cd .. && pnpm dev`):**
  - `http://localhost:5173/p/demo-nfc-001` → Marie's profile with 3 links
  - `http://localhost:5173/events/pulse-demo-2026` → public event page
  - `http://localhost:5173/me/events/<her-participant-id>` (logged in) → edit page

- [ ] **CHECKPOINT — All phases complete.** Inform the user. Do NOT commit.

---

## Definition of Done

- All server tests green (`cd server && pnpm test`)
- All client unit tests green (`cd client && pnpm test`)
- All client E2E tests green (`cd client && pnpm test:e2e`)
- `cd client && pnpm build` green
- `cd client && pnpm lint` green
- Manual smoke: 3 demo URLs above work
- No `git commit` issued by the agent

---

## Self-Review Notes

- **Type consistency:** `ProfileLink { type, url, label }` mirrors across entity / schema / DTO / frontend model. `links: []` is the default empty value across factories and seeds.
- **Shared parser:** `parseProfileLinks` in `server/src/modules/participant/presentation/dto/profile-link.parser.ts`, consumed by both DTOs.
- **shadcn-vue everywhere:** Task 0.6 installs `input | label | textarea | select | card | avatar`. All forms (`profile-link-row`, `profile-links-editor`, `profile-fields-form`, `event-registration-form`, edit page) use them. Display-only components (hero, bio, error states) use `Card` + `Avatar` where appropriate. No raw `<input>`/`<button>`/`<textarea>` with Tailwind classes.
- **Plan style:** backend domain code (entity, parser, use-case, schema) shown in full because it's the architectural value. Vue components described by props/emits/primitives, with `profile-link-row.vue` (Task 1.13) and `event-registration-form.vue` (Task 2.9) as full examples to copy from.
- **Spec coverage:** Spec 1 → Tasks 2.1–2.12. Spec 2 → Tasks 3.1–3.8. Spec 3 → Tasks 1.1–1.17.
- **Out of scope (per specs):** bracelet activation UI, link drag-and-drop, avatar upload, social OAuth, capacity check UI, tap analytics, pre-payment, multi-participation summary, live preview on edit page.
- **Known follow-ups:** expose `error.code` in API envelope (Spec 1 §2.8) for cleaner client-side error matching.
