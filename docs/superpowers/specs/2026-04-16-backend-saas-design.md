# PULSE SaaS Backend — Design Spec

**Date:** 2026-04-16
**Status:** Draft — awaiting user review before plan generation
**Related plan:** `docs/superpowers/plans/2026-04-15-backend-ecommerce-auth.md` (e-commerce + auth, completed)

---

## Goal

Build the 7 SaaS backend modules for PULSE's Event Pass platform:

1. `event` — events management (organizer creates events, defines dates/capacity/zones)
2. `bracelet` — activated NFC bracelets linked to user + event, with full state machine
3. `participant` — registration of a user to an event via a bracelet
4. `check-in` — NFC scan log with interaction types (check-in / networking / vote / cashless)
5. `team` — multi-organizer membership per event
6. `analytics` — aggregation module feeding the admin dashboard (8 use-cases)
7. `supply-order` — supplier replenishment orders (bracelet inventory)

Plus:

- Bridge between e-commerce `order` and SaaS `bracelet` (auto-creation on order confirmation + manual admin creation)
- Public NFC simulation endpoints (`GET /api/nfc/:nfcId` and `POST /api/check-ins`)
- Env var `BRACELET_MAX_CAPACITY` for stock ceiling

---

## Context

**Current backend state:** `auth`, `user`, `product`, `cart`, `order` modules complete. Clean Architecture, Express + Mongoose, JWT auth, entity pattern with private constructor / readonly `props` / factory methods / business methods returning `this`.

**What the SaaS side powers:**

- **Admin dashboard** (Pencil refs: `ZG9oI` Dashboard Admin, `YLysT` Événements, `iO7Hg` Bracelets) — KPI cards, charts, next event card, stock card, tables with filters
- **NFC experience** for participants — `GET /api/nfc/:nfcId` renders a public profile when a bracelet is tapped against a phone
- **Organizer flows** — check-in scans during events, cashless payments, networking taps

**Why `analytics` has no entity:** it's a pure **aggregation read-side** module. Every use-case reads from the other modules' repositories (event, bracelet, participant, order, check-in, supply-order) and composes a response DTO. No state of its own.

---

## Architecture

Follows the existing Clean Architecture pattern (same as `order`, `product`, `cart`):

```
modules/<name>/
├── <name>.module.ts                    # factory + router wiring
├── __tests__/
│   ├── <name>.factory.ts
│   └── <name>.repository.mock.ts
├── domain/                              # pure business logic
│   ├── entity/<name>.entity.ts
│   ├── constants/<name>.constant.ts
│   ├── errors/<name>.error.ts
│   ├── model/<name>.domain-model.ts    # namespace with DTOs
│   └── repository/<name>.repository.interface.ts
├── application/
│   ├── services/<name>.service.ts      # facade over use-cases
│   └── use-cases/
│       └── <action>/
│           ├── <action>.use-case.ts
│           └── <action>.use-case.spec.ts
├── infrastructure/
│   ├── schema/<name>.schema.ts         # Mongoose schema
│   └── repository/<name>.repository.mongoose-mongo.ts
└── presentation/
    ├── controllers/<name>.controller.ts
    └── dto/<action>.request.dto.ts + <name>.response.dto.ts
```

**Exceptions for `analytics`:** no `entity/`, no `repository/`. It consumes other modules' repository interfaces via its `module.ts` wiring. Use-cases receive the needed repos via constructor DI.

**DI style:** manual, via `createXxxModule(deps)` factories. Each module exports `{ router, repository, service }` when another module needs one of them (the e-commerce plan established this pattern: `cart.module.ts` exports `cartItemRepository`, `product.module.ts` exports `productRepository` so `order.module.ts` can consume them).

---

## Module 1 — `event`

### Purpose

Organizers create and manage events. An event has a location, dates, capacity, and a status that drives the dashboard tabs (Tous / À venir / En cours / Terminés / Brouillons).

### `EventEntity`

```
EventEntityProps {
  id: string
  name: string
  slug: string                     // auto from name if omitted
  description: string
  venueName: string
  venueAddress: string
  startsAt: Date                   // date + start time
  endsAt: Date                     // date + end time
  capacity: number                 // max participants (used for fillRate)
  status: EventStatus              // see below
  ownerId: string                  // userId of the creator (used to filter organizer view)
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}
```

### Constants

```
EventStatus = {
  DRAFT:       'draft',
  UPCOMING:    'upcoming',
  IN_PROGRESS: 'in_progress',
  COMPLETED:   'completed',
  CANCELLED:   'cancelled',
} as const

// "active" in analytics = UPCOMING ∪ IN_PROGRESS (non-draft, non-completed, non-cancelled)
```

### Business methods

- `publish()` → DRAFT → UPCOMING
- `start()` → UPCOMING → IN_PROGRESS
- `complete()` → IN_PROGRESS → COMPLETED
- `cancel()` → any → CANCELLED (except COMPLETED)
- `update(partial)` → updates name/description/venue/dates/capacity (not status, not id)
- `softDelete()`
- `isActive()` → `UPCOMING || IN_PROGRESS` (used by analytics)

### Repository methods

- `create(entity)` / `findById(id)` / `findAll()` / `findAllByOwner(ownerId)` / `update(entity)` / `softDelete(id)`
- `findAllByStatusIn(statuses: EventStatus[])` → used by analytics
- `countByStatusInRange(statuses, from, to)` → used by analytics
- `findNextUpcoming()` → next event where `status === UPCOMING && startsAt > now`, sorted `startsAt ASC`, limit 1
- `countByOwner(ownerId)`

### Routes (`/api/events`)

- `POST /` — create (auth required, any role)
- `GET /` — list my events (auth, filtered by `ownerId = req.user.userId`, or all if admin)
- `GET /:id` — detail (auth)
- `PATCH /:id` — update (auth + owner check)
- `POST /:id/publish` — transition DRAFT → UPCOMING
- `POST /:id/start` — UPCOMING → IN_PROGRESS
- `POST /:id/complete` — IN_PROGRESS → COMPLETED
- `POST /:id/cancel` — → CANCELLED
- `DELETE /:id` — softDelete

---

## Module 2 — `bracelet`

### Purpose

The NFC object **after purchase**. It lives through 4 states: bought (`STOCK`), assigned to a participant (`PRE_ACTIVATED`), tapped for the first time (`ACTIVE`), retired (`DISABLED`). Independent from the e-commerce `ProductEntity` — the product is what you sell, the bracelet is what the user owns.

### `BraceletEntity`

```
BraceletEntityProps {
  id: string
  nfcId: string                          // unique NFC tag ID (UUID-like), indexed
  status: BraceletStatus
  userId: Nullable<string>               // null while in STOCK
  eventId: Nullable<string>              // null while in STOCK
  productId: Nullable<string>            // the e-commerce product it came from (null for manual admin creations)
  orderId: Nullable<string>              // the e-commerce order it came from (null for manual)
  activatedAt: Nullable<Date>            // first tap timestamp — fuels listBraceletsActivationByYear
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}
```

### Constants

```
BraceletStatus = {
  STOCK:         'stock',          // unassigned, counted by getBraceletStockWithStats
  PRE_ACTIVATED: 'pre_activated',  // assigned to user+event, not yet tapped
  ACTIVE:        'active',         // first tap done, activatedAt set
  DISABLED:      'disabled',       // event ended or revoked
} as const
```

### Business methods

- `assignTo(userId, eventId)` → STOCK → PRE_ACTIVATED (throws if not STOCK)
- `activate()` → PRE_ACTIVATED → ACTIVE (sets `activatedAt = now`; throws if not PRE_ACTIVATED)
- `disable()` → any except DISABLED → DISABLED
- `update(partial)` → limited (cannot change id, nfcId, orderId, productId, createdAt)
- `softDelete()`
- `isInStock()` / `isPreActivated()` / `isActive()` / `isDisabled()`

### Repository methods

- `create(entity)` / `findById(id)` / `findByNfcId(nfcId)` / `findAll()` / `update(entity)` / `softDelete(id)`
- `findAllByStatus(status)` / `findAllByEventId(eventId)` / `findAllByUserId(userId)`
- `countByStatus(status)` → used by `getBraceletStockWithStats`
- `countByEventId(eventId)` → used by `getNextEventWithStats` (braceletsOrdered)
- `countByEventIdAndStatus(eventId, status)` → used by `getNextEventWithStats` (braceletsPreActivated)
- `countInRange(from, to)` → used by `getBraceletsCountWithStats` (created this month)
- `countActivationsByMonthInYear(year)` → used by `listBraceletsActivationByYear` (Mongo aggregation `$group` by month of `activatedAt`)

### Routes (`/api/bracelets`)

- `POST /` — admin manual creation (body: `{ nfcId, productId? }`)
- `POST /from-order/:orderId` — internal use-case, called by `order` module on confirmation (not a public route, wired via service injection)
- `GET /` — admin list with optional `?status=stock|pre_activated|...`
- `GET /:id` — detail
- `PATCH /:id/assign` — admin assigns to user+event (body: `{ userId, eventId }`)
- `PATCH /:id/disable` — transition to DISABLED
- `DELETE /:id` — softDelete

**Note: `POST /nfc-tap` is NOT in bracelet module.** It lives in the NFC endpoint layer (see "NFC endpoints" section).

---

## Module 3 — `participant`

### Purpose

Binds a `user` to an `event` via a `bracelet`. Distinct from `user`: a user can be a participant in many events (one record per event).

### `ParticipantEntity`

```
ParticipantEntityProps {
  id: string
  userId: string
  eventId: string
  braceletId: Nullable<string>           // may be null if registered but not yet bracelet-assigned
  profile: ParticipantProfile            // public profile displayed on NFC tap
  registeredAt: Date
  checkedInAt: Nullable<Date>            // set on first CHECK_IN interaction
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}

ParticipantProfile {
  displayName: string
  role: Nullable<string>                 // e.g. "Speaker", "VIP", "Attendee"
  linkedinUrl: Nullable<string>
  bio: Nullable<string>                  // short bio shown on NFC tap
}
```

### Business methods

- `attachBracelet(braceletId)` — set braceletId once
- `checkIn()` — set `checkedInAt = now` (called by check-in use-case)
- `updateProfile(partial)` — patch `profile` fields
- `softDelete()`

### Constraints

- Unique `(userId, eventId)` in Mongo (composite index)

### Repository methods

- `create(entity)` / `findById(id)` / `findByUserAndEvent(userId, eventId)` / `findByBraceletId(braceletId)` / `update(entity)` / `softDelete(id)`
- `findAllByEventId(eventId)`
- `countInRange(from, to)` → used by `getParticipantsCountWithStats`
- `countByEventId(eventId)`

### Routes (`/api/participants`)

- `POST /` — register me to an event (auth, body: `{ eventId, profile }`)
- `GET /me` — my participations (auth)
- `GET /event/:eventId` — list participants for an event (auth + owner or admin)
- `GET /:id` — detail
- `PATCH /:id/profile` — update my profile (auth + ownership check)
- `DELETE /:id` — unregister (softDelete)

---

## Module 4 — `check-in`

### Purpose

Append-only log of NFC scan events. Each entry is one tap. Fuels the donut chart, the heatmap, and the per-event real-time stats.

### `CheckInEntity`

```
CheckInEntityProps {
  id: string
  braceletId: string
  eventId: string
  interactionType: InteractionType
  zoneName: Nullable<string>             // e.g. "Entrée principale", "VIP Lounge"
  targetBraceletId: Nullable<string>     // for NETWORKING (bracelet-to-bracelet)
  amount: Nullable<number>               // for CASHLESS (euros)
  metadata: Record<string, unknown>      // free bag
  createdAt: Date
}
```

**No `updatedAt` / `deletedAt` — append-only log.**

### Constants

```
InteractionType = {
  CHECK_IN:   'check_in',      // first tap at event entrance
  NETWORKING: 'networking',    // bracelet-to-bracelet contact
  VOTE:       'vote',          // voting interaction (polls, songs, etc.)
  CASHLESS:   'cashless',      // payment tap (bar, stand)
} as const
```

### Business methods

- `static create(props)` — validates `braceletId`, `eventId`, `interactionType`
- No mutations (append-only)

### Repository methods

- `create(entity)` / `findById(id)`
- `findAllByEventId(eventId)` / `findAllByBraceletId(braceletId)`
- `countByInteractionType()` → aggregation returning `[{ type, count }, ...]` → used by `listInteractionTypesWithStats`
- `countByEventIdAndType(eventId, type)`

### Routes (`/api/check-ins`)

- `POST /` — record a scan (organizer staff auth, body: `{ nfcId, eventId, interactionType, zoneName?, targetNfcId?, amount?, metadata? }`)
  - Looks up bracelet by `nfcId`, validates status (must be PRE_ACTIVATED or ACTIVE)
  - If status == PRE_ACTIVATED and type == CHECK_IN, **also triggers `bracelet.activate()`** (first tap)
  - If targetNfcId given, resolves to `targetBraceletId`
  - Creates the CheckIn entity
- `GET /event/:eventId` — list check-ins for an event (auth + event owner or admin)

---

## Module 5 — `team`

### Purpose

Multi-organizer support: several users can manage the same event. Role-based (OWNER / MANAGER / STAFF).

### `TeamMemberEntity`

```
TeamMemberEntityProps {
  id: string
  userId: string
  eventId: string
  role: TeamRole
  invitedAt: Date
  invitedBy: string                      // userId of inviter
  acceptedAt: Nullable<Date>             // null while invitation pending
  createdAt: Date
  updatedAt: Date
  deletedAt: Nullable<Date>
}
```

### Constants

```
TeamRole = {
  OWNER:   'owner',     // created the event, full control
  MANAGER: 'manager',   // can edit event, assign bracelets, see analytics
  STAFF:   'staff',     // can scan (check-in) only
} as const
```

### Business methods

- `accept()` — set `acceptedAt = now` (throws if already accepted)
- `changeRole(newRole)` — (not OWNER → OWNER, enforced by service)
- `softDelete()` — revoke membership

### Constraints

- Unique `(userId, eventId)` composite index
- An event always has exactly one OWNER (enforced at service level: `createEvent` auto-creates the OWNER TeamMember)

### Repository methods

- `create(entity)` / `findById(id)` / `findByUserAndEvent(userId, eventId)` / `update(entity)` / `softDelete(id)`
- `findAllByEventId(eventId)` / `findAllByUserId(userId)`
- `findOwnerByEventId(eventId)`

### Routes (`/api/teams`)

- `POST /events/:eventId/invite` — invite a user (auth + event OWNER/MANAGER, body: `{ userId, role }`)
- `GET /events/:eventId` — list team members (auth + member of event)
- `POST /:id/accept` — accept invitation (auth + invitee)
- `PATCH /:id/role` — change role (auth + event OWNER, body: `{ role }`)
- `DELETE /:id` — revoke (auth + event OWNER)

---

## Module 6 — `supply-order`

### Purpose

Mini-module tracking **supplier purchase orders** for bracelet inventory replenishment. **NOT the e-commerce `order`** — this is the admin placing an internal PO to restock.

### `SupplyOrderEntity`

```
SupplyOrderEntityProps {
  id: string
  units: number                          // number of bracelets ordered
  orderedAt: Date
  estimatedDeliveryDate: Date
  status: SupplyOrderStatus
  receivedAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
}
```

### Constants

```
SupplyOrderStatus = {
  PENDING:   'pending',
  RECEIVED:  'received',
  CANCELLED: 'cancelled',
} as const
```

### Business methods

- `markReceived()` → PENDING → RECEIVED, sets `receivedAt = now`
- `cancel()` → PENDING → CANCELLED

### Repository methods

- `create(entity)` / `findById(id)` / `findAll()` / `update(entity)`
- `findPending()` → first `PENDING` sorted by `estimatedDeliveryDate ASC`, limit 1 → used by `getBraceletStockWithStats`

### Routes (`/api/supply-orders`) — admin only

- `POST /` — create PO (body: `{ units, estimatedDeliveryDate }`)
- `GET /` — list all
- `GET /:id` — detail
- `POST /:id/receive` — mark received
- `POST /:id/cancel` — cancel

---

## Module 7 — `analytics`

### Purpose

Read-only aggregation module for the admin dashboard. **No entity, no repository, no Mongo writes.** Only use-cases that inject other modules' repos and compose response DTOs.

### Structure

```
modules/analytics/
├── analytics.module.ts
├── domain/
│   ├── model/analytics.domain-model.ts   # namespace with 8 response DTOs
│   └── constants/stock-level.constant.ts # 'low' | 'mid' | 'high' with threshold rules
├── application/
│   ├── services/analytics.service.ts     # facade over 8 use-cases
│   └── use-cases/
│       ├── list-active-events-with-stats/
│       ├── get-participants-count-with-stats/
│       ├── get-bracelets-count-with-stats/
│       ├── get-revenue-with-stats/
│       ├── list-bracelets-activation-by-year/
│       ├── list-interaction-types-with-stats/
│       ├── get-next-event-with-stats/
│       └── get-bracelet-stock-with-stats/
└── presentation/
    ├── controllers/analytics.controller.ts
    └── dto/analytics.response.dto.ts
```

### Shared helper

A tiny pure function `getMonthRange(offsetMonths: number): { from: Date, to: Date }` in `shared/utils/month-range.ts` that returns the calendar month boundaries (offset 0 = current month, -1 = last month). Used by 4 use-cases.

### Use-case 1 — `listActiveEventsWithStats`

- **Reads:** `IEventRepository`
- **Logic:**
  1. `events = eventRepo.findAllByStatusIn([UPCOMING, IN_PROGRESS])`
  2. `currentMonthCount = eventRepo.countByStatusInRange([UPCOMING, IN_PROGRESS], thisMonthFrom, thisMonthTo)`
  3. `lastMonthCount = eventRepo.countByStatusInRange([UPCOMING, IN_PROGRESS], lastMonthFrom, lastMonthTo)`
  4. `diffVsLastMonth = currentMonthCount - lastMonthCount` _(absolute, can be negative)_
- **Response DTO:** `{ events: EventDto[], count: number, diffVsLastMonth: number }`
- **Route:** `GET /api/analytics/events/active`

### Use-case 2 — `getParticipantsCountWithStats`

- **Reads:** `IParticipantRepository`
- **Logic:**
  1. `currentMonth = participantRepo.countInRange(thisMonthFrom, thisMonthTo)`
  2. `lastMonth = participantRepo.countInRange(lastMonthFrom, lastMonthTo)`
  3. `rateVsLastMonth = lastMonth === 0 ? null : ((currentMonth - lastMonth) / lastMonth) * 100`
- **Response DTO:** `{ count: number, rateVsLastMonth: Nullable<number> }`
  _(Nullable to handle zero-division: "no previous data" ≠ "0% growth".)_
- **Route:** `GET /api/analytics/participants/count`

### Use-case 3 — `getBraceletsCountWithStats`

- **Reads:** `IBraceletRepository`
- **Semantics:** "bracelets created this month" (decision Q4=A — counts entries into inventory, not activations or assignments)
- **Logic:** identical to use-case 2 but on `braceletRepo.countInRange()` (filtered by `createdAt`, `deletedAt === null`)
- **Response DTO:** `{ count: number, rateVsLastMonth: Nullable<number> }`
- **Route:** `GET /api/analytics/bracelets/count`

### Use-case 4 — `getRevenueWithStats`

- **Reads:** `IOrderRepository` (e-commerce order module, already exists)
- **Logic:**
  1. `currentMonth = orderRepo.sumRevenueInRange(thisMonthFrom, thisMonthTo, statusFilter = [CONFIRMED, SHIPPED, DELIVERED])`
  2. `lastMonth = orderRepo.sumRevenueInRange(lastMonthFrom, lastMonthTo, statusFilter)`
  3. `rateVsLastMonth = lastMonth === 0 ? null : ((currentMonth - lastMonth) / lastMonth) * 100`
- **Response DTO:** `{ revenue: number, rateVsLastMonth: Nullable<number> }`
- **Route:** `GET /api/analytics/revenue`
- **Note:** requires **adding `sumRevenueInRange(from, to, statuses)` to `IOrderRepository`** (does not exist yet — plan will cover this modification to the existing order module).

### Use-case 5 — `listBraceletsActivationByYear`

- **Reads:** `IBraceletRepository`
- **Logic:** `braceletRepo.countActivationsByMonthInYear(year)` → Mongo `$group` on `{ $month: "$activatedAt" }`, filtered by `$year: year` and `activatedAt != null`
- **Response DTO:** `{ year: number, months: { month: number, monthName: string, activations: number }[] }` (always 12 entries, zero-filled)
- **Route:** `GET /api/analytics/bracelets/activations?year=2026` (year optional, defaults to current year)

### Use-case 6 — `listInteractionTypesWithStats`

- **Reads:** `ICheckInRepository`
- **Logic:**
  1. `rows = checkInRepo.countByInteractionType()` → `[{ type, count }, ...]` (all 4 types zero-filled)
  2. `total = sum of counts`
  3. For each: `sharePercent = total === 0 ? 0 : (count / total) * 100`
- **Response DTO:** `{ total: number, types: { type: InteractionType, typeLabel: string, scansCount: number, sharePercent: number }[] }`
- **Route:** `GET /api/analytics/interactions`

### Use-case 7 — `getNextEventWithStats`

- **Reads:** `IEventRepository`, `IBraceletRepository`
- **Logic:**
  1. `event = eventRepo.findNextUpcoming()` (returns `null` if none)
  2. If null → response `{ event: null }`
  3. Else compute:
     - `daysUntil = ceil((event.startsAt - now) / msPerDay)`
     - `braceletsOrdered = braceletRepo.countByEventId(event.id)`
     - `braceletsPreActivated = braceletRepo.countByEventIdAndStatus(event.id, 'pre_activated')`
     - `fillRate = event.capacity === 0 ? 0 : (braceletsOrdered / event.capacity) * 100`
- **Response DTO:** `{ event: { id, name, startsAt, endsAt, daysUntil, braceletsOrdered, braceletsPreActivated, fillRate } | null }`
- **Route:** `GET /api/analytics/events/next`
- **Naming note:** the user initially used `startHour` / `endHour`. We standardize on `startsAt` / `endsAt` (`Date` objects) — the frontend formats display. If the user wants separate hour fields, they can be derived client-side.

### Use-case 8 — `getBraceletStockWithStats`

- **Reads:** `IBraceletRepository`, `ISupplyOrderRepository`
- **Env:** `process.env.BRACELET_MAX_CAPACITY` (default 5000 if unset, logged as warn)
- **Logic:**
  1. `current = braceletRepo.countByStatus('stock')`
  2. `maxCapacity = Number(process.env.BRACELET_MAX_CAPACITY) || 5000`
  3. `fillPercent = maxCapacity === 0 ? 0 : (current / maxCapacity) * 100`
  4. `level = StockLevel.fromFillPercent(fillPercent)` (helper in `stock-level.constant.ts`)
  5. `pending = supplyOrderRepo.findPending()` → may be null
  6. `pendingOrder = pending ? { units: pending.units, estimatedDeliveryDate: pending.estimatedDeliveryDate } : null`
- **Response DTO:** `{ current: number, maxCapacity: number, fillPercent: number, level: StockLevel, pendingOrder: { units: number, estimatedDeliveryDate: Date } | null }`
- **Route:** `GET /api/analytics/bracelets/stock`

### Constants

```
StockLevel = {
  LOW:  'low',
  MID:  'mid',
  HIGH: 'high',
} as const

// Threshold rule (in stock-level.constant.ts):
function fromFillPercent(pct: number): StockLevel {
  if (pct < 45) return StockLevel.LOW
  if (pct <= 55) return StockLevel.MID
  return StockLevel.HIGH
}
```

### Auth on `/api/analytics/*`

All 8 routes require `authMiddleware + adminMiddleware` (or `organizer` role if we split admin/organizer — for MVP: admin only).

---

## Inter-module bridge: `order` → `bracelet`

### Auto-creation on order confirmation

**Requirement (Q2):** when an `order` is confirmed (status PENDING → CONFIRMED) and contains products with `category === 'bracelet'`, automatically create one `BraceletEntity` per unit in `STOCK` status.

### Implementation approach — direct injection, no event bus

YAGNI. A full event bus is overkill for 2 days. Instead:

- `CreateBraceletFromOrderUseCase(braceletRepo)` is created inside `bracelet.module.ts` and **exported**.
- `order.module.ts` accepts an optional callback `onOrderConfirmed?: (order: OrderEntity) => Promise<void>` in its factory signature.
- `main.ts` wires: `const { router: orderRouter } = createOrderModule(..., async (order) => { await createBraceletFromOrderUseCase.execute(order) })`.
- Inside `UpdateOrderStatusUseCase.execute`, when the transition is `confirm()`, call `onOrderConfirmed(order)` **after** `update()`.

### Business logic in `CreateBraceletFromOrderUseCase`

**Which products generate a bracelet?** All three e-commerce categories (`bracelet`, `pass`, `bundle`) represent a physical NFC object in PULSE. → **Every order item generates one `BraceletEntity` per unit**, regardless of category. No filtering.

1. For each `orderItem` in `order.items`:
2. For `i in 0..item.quantity`:
3. `BraceletEntity.create({ nfcId: generateUuid(), status: STOCK, productId: item.productId, orderId: order.id, userId: order.userId })`
4. `braceletRepo.create(entity)`
5. Error handling: log + continue. The order is already confirmed in DB; we don't want to reverse it. Log-and-continue is acceptable for a school project.

### Manual admin creation

**Route:** `POST /api/bracelets` (admin only, body: `{ nfcId?, productId? }`). If `nfcId` omitted, generate UUID. Status defaults to STOCK. This satisfies the "les deux" answer to Q2.

---

## NFC endpoints

### `GET /api/nfc/:nfcId` — public profile

**Purpose:** participant taps their bracelet against a phone → browser opens the URL → public profile page rendered by the frontend. Backend returns the data.

**Auth:** **none** (public by design — the URL IS the auth, like a shared calendar link)

**Logic:**

1. `bracelet = braceletRepo.findByNfcId(nfcId)` → 404 if not found or `deletedAt !== null`
2. If `bracelet.status === 'stock'` → 404 (not activated, no profile)
3. `participant = participantRepo.findByBraceletId(bracelet.id)` → 404 if none
4. `event = eventRepo.findById(participant.eventId)` → included in response
5. Response: `{ bracelet: { nfcId, status }, participant: { profile }, event: { name, venueName, startsAt, endsAt } }`
6. Also triggers a background `CHECK_IN` entry? — **No for MVP.** Keep it read-only. Staff scans go through `POST /api/check-ins`.

**Location:** new file `src/routes/nfc.routes.ts` wired in `main.ts`, takes `braceletRepo + participantRepo + eventRepo` as deps. Not a full module (no domain, just a thin route handler — YAGNI).

### `POST /api/check-ins` — organizer scan

Already covered in module 4. Auth required (staff minimum).

---

## Updates to existing modules

### `order` module

- **Add method to `IOrderRepository`:** `sumRevenueInRange(from: Date, to: Date, statuses: OrderStatus[]): Promise<number>` — Mongo aggregation `$match + $group { _id: null, sum: { $sum: '$totalAmount' } }`
- **Add callback param to `createOrderModule`:** `(jwtService, cartItemRepo, productRepo, onOrderConfirmed?)`
- **Modify `UpdateOrderStatusUseCase`:** accept optional `onOrderConfirmed` callback, invoke after successful `confirm()` transition

### `product` module

- No changes. `productRepository` already exported, consumed as-is.

### `cart` module

- No changes.

### `user` module

- No changes. `userRepository` is needed by `team` (to validate invited userIds exist) — consume via existing export.

### `shared/`

- **New util:** `shared/utils/month-range.ts`
- **New util:** `shared/utils/generate-id.ts` (wraps `crypto.randomUUID()`, used for nfcId generation)
- **No middleware changes** (existing `authMiddleware`, `adminMiddleware`, `errorHandlerMiddleware`, `loggerMiddleware` suffice)

### `main.ts`

Wires everything. Final order:

```
createAuthModule → exports { router, jwtService, userRepository }
createUserModule(userRepository, jwtService)
createProductModule(jwtService) → exports { router, productRepository }
createCartModule(jwtService) → exports { router, cartItemRepository }
createEventModule(jwtService, userRepository) → exports { router, eventRepository }
createBraceletModule(jwtService, productRepository) → exports { router, braceletRepository, createBraceletFromOrderUseCase }
createSupplyOrderModule(jwtService) → exports { router, supplyOrderRepository }
createParticipantModule(jwtService, eventRepository, braceletRepository) → exports { router, participantRepository }
createCheckInModule(jwtService, braceletRepository, participantRepository) → exports { router, checkInRepository }
createTeamModule(jwtService, userRepository, eventRepository) → exports { router, teamMemberRepository }
createOrderModule(jwtService, cartItemRepository, productRepository, async (order) => createBraceletFromOrderUseCase.execute(order))
createAnalyticsModule(jwtService, { event, bracelet, participant, order, checkIn, supplyOrder }) → exports { router }
createNfcRoutes(braceletRepository, participantRepository, eventRepository)
```

All mounted under `/api/<domain>`.

---

## Environment configuration

```
# .env additions
BRACELET_MAX_CAPACITY=5000
```

Used only by `getBraceletStockWithStats`. Read via `process.env.BRACELET_MAX_CAPACITY`, fallback to 5000 with `console.warn`.

---

## Testing strategy

Follows the existing `testing-rules.md` conventions:

**Per-module `__tests__/` folder:**

- `<module>.factory.ts` — fixture generators with counter-based unique IDs and `overrides` param
- `<module>.repository.mock.ts` — manual mock implementing the repo interface (properties `findById_result`, `findById_calledWith`, etc.)

**Test files (colocated):**

- Each entity: `<entity>.entity.spec.ts` — factory methods, business methods, state machine transitions, `toJSON`
- Each use-case: `<use-case>.spec.ts` — happy path + edge cases + errors, using mocks
- Each controller: `<name>.controller.spec.ts` — lightweight, mocks the service

**Analytics tests:**

- Each use-case gets its own spec, mocking the injected repos
- Critical edge cases: zero-division (no previous month data), empty result sets, year boundaries
- `StockLevel.fromFillPercent` unit-tested with 6 values: 0, 44.9, 45, 50, 55, 55.1 (boundary coverage)

**Integration tests:** deferred — repository implementations tested via in-memory equivalents if needed for CI. MVP doesn't require integration tests.

**Seed:** extend `src/seed.ts` with:

- 3 events (1 UPCOMING, 1 IN_PROGRESS, 1 COMPLETED)
- 50 bracelets (30 STOCK, 15 PRE_ACTIVATED, 5 ACTIVE with `activatedAt` spread across last 6 months)
- 10 participants attached to the IN_PROGRESS event
- 200 check-ins with mixed interaction types (60% CHECK_IN, 20% NETWORKING, 10% VOTE, 10% CASHLESS)
- 1 pending supply order (500 units, delivery in 2 weeks)

---

## Error handling

Each module defines its own errors extending `AppError`:

- `EventNotFoundError` (404), `EventInvalidStatusTransitionError` (400), `EventNotOwnerError` (403)
- `BraceletNotFoundError` (404), `BraceletInvalidStatusError` (400), `BraceletNfcIdAlreadyTakenError` (409)
- `ParticipantNotFoundError` (404), `ParticipantAlreadyRegisteredError` (409)
- `CheckInInvalidBraceletStateError` (400)
- `TeamMemberNotFoundError` (404), `TeamMemberAlreadyExistsError` (409), `TeamMemberNotAuthorizedError` (403)
- `SupplyOrderNotFoundError` (404), `SupplyOrderInvalidStatusError` (400)
- `AnalyticsNoDataError` — not needed; use-cases return `null` or zeroed responses

Caught by the existing `errorHandlerMiddleware`.

---

## Out of scope (explicit)

To keep the plan tight and the 2-day timing realistic:

- **Notification** and **campaign email** modules — in the sidebar but not built
- **Heatmap / Reports / Statistics** pages — covered by the 8 analytics use-cases, no separate modules
- **Integration tests** against real MongoDB — in-memory repos optional
- **Payment gateway** — `order` remains "simulated confirmed" (already the case)
- **WebSocket / real-time** — dashboard polls REST endpoints
- **Role granularity beyond admin/customer** — we reuse existing roles. Event ownership is enforced at service level.
- **Multi-language** — French strings hardcoded
- **Export / CSV** features from dashboard
- **Search / pagination on large lists** — fetch all + client-side for MVP

---

## Open questions / Non-decisions

None pending. All decisions captured above.

---

## Next step

Invoke `superpowers:writing-plans` to generate the bite-sized task plan at `docs/superpowers/plans/2026-04-16-backend-saas.md`.
