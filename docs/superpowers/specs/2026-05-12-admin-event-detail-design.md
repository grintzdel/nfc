# Admin Event Detail — Design Spec

## Goal

Today the admin can list and edit events but has nowhere to _go_ when they click on one — every interaction is wrapped in a modal. This spec introduces `/admin/events/:eventId`, the operational hub where an organizer manages a single event: participants, bracelets attached to that event, check-in activity, and a per-event KPI strip.

It's the page that turns the current admin from a CRUD into a SaaS dashboard. It consumes 4 backend modules already in place (event, participant, bracelet, check-in) plus the analytics module for KPIs, and introduces 5 new endpoints — 3 paginated lists, 1 helper list, 1 KPI block — to keep all filtering and aggregation server-side.

## Scope

### Frontend

- New route `/admin/events/:eventId` (admin-only, `AdminLayout`)
- Feature page composed of a Header strip + 3 **tabs** (Participants / Bracelets / Check-ins)
- Header with event meta, status badge, KPI strip, and action buttons driven by the **status state machine** (only show the transitions allowed for the current status)
- Each tab contains a **paginated table** with server-side search where applicable (participants: displayName/role; bracelets: nfcId; check-ins: chronological only)
- Tab counters and KPIs come from the new analytics endpoint — **never from `list.length`**
- Existing `/admin/events` page: clicking a row navigates here; **the `EventViewModal` is removed** (the new page replaces it). The "Éditer" modal stays.
- 5 new query hooks + 6 new mutation hooks; 3 new shadcn-vue primitives: **`Tabs`**, **`Dialog`**, **`Badge`**

### Backend (5 new endpoints, no breaking changes)

1. **`GET /participants/event/:eventId/paginated`** — paginated list of participants for an event, with `?page=&limit=&search=`. Each item includes its `bracelet` summary (server-side join, no front-side resolution).
2. **`GET /bracelets/event/:eventId/paginated`** — paginated list of bracelets attached to an event, with `?page=&limit=&search=`. Each item includes its `participant` summary.
3. **`GET /bracelets/available`** — non-paginated list of bracelets with `status='active'` AND `participantId=null`, ready to be attached. Capped at 100 (sufficient for a dialog dropdown; if you have >100 spare active bracelets, the global bracelet admin should be the entry point).
4. **`GET /check-ins/event/:eventId/paginated`** — paginated list of check-ins for an event, ordered by `createdAt DESC`. Each item includes its `participant` summary (resolved server-side via `bracelet → participant`).
5. **`GET /analytics/events/:eventId`** — per-event KPI aggregation block. Cross-module (event × participant × bracelet × check-in).

> **Why paginate now and not later:** the pattern already exists server-side (`GET /events/admin/paginated`) and client-side (`useGetPaginatedEvents`). Doing it now adds ~30% scope but zero new architectural thinking, and avoids a rewrite when an event passes 200 participants.

> **Why server-side joins in the paginated DTOs:** with pagination we can no longer rely on having the full counterpart list in memory to resolve "which participant owns this bracelet" / "which participant did this check-in". Joins move server-side, embedded into each item. Same rule as KPIs: no derivation on the front.

## Out of Scope

- **Inline participant profile edit from admin** — admin sees participants and attaches bracelets, but editing displayName/bio/links stays on `/me/events/:id` (Spec 3).
- **Bracelet creation from this page** — global bracelet admin handles creation.
- **Team tab** — separate spec.
- **CSV export** for participants / check-ins.
- **Live updates / websockets** — manual refresh + `invalidateQueries` on mutations is enough for v1.
- **Sort controls on tables** — v1 has implicit sort (participants by `registeredAt DESC`, bracelets by `createdAt DESC`, check-ins by `createdAt DESC`).

## Dependencies

- Spec 3 — reuses `ParticipantProfileDto`.
- Existing admin layout (`@/ui/layout/admin-layout.vue`).
- Existing pagination component used by `/admin/events` (`EventTable` pagination footer) — extract to a reusable `<Pagination>` primitive if not already (see §6.5).
- Existing hooks: `useGetEventById`, `useUpdateEvent`.
- shadcn-vue primitives already installed: `Card`, `Input`, `Label`, `Select`, `Avatar`. **New install:** `Tabs`, `Dialog`, `Badge`.

---

## 1. Backend

### 1.1 Shared pagination response shape

Mirror the existing `EventDomainModel.PaginatedEventsDto`:

```ts
PaginatedDto<T> = { items: T[]; total: number; page: number; limit: number; totalPages: number }
```

Each new use-case returns this shape with its own item type. Defaults: `page=1`, `limit=20`, `limit ≤ 100` (clamp server-side to prevent abuse).

### 1.2 Participant module — `GET /participants/event/:eventId/paginated`

**Files:**

- New: `application/use-cases/get-paginated-participants-by-event/{...}.use-case.ts + .spec.ts`
- Modify: `participant.repository.interface.ts` — add `findPaginatedByEventId({ eventId, page, limit, search })` returning `{ items, total }`; the repo also resolves each participant's bracelet (mongoose `populate('braceletId')` or a follow-up `bracelet` lookup)
- Modify: `participant.repository.mongoose-mongo.ts` — implement query: `{ eventId, deletedAt: null, $or: [{ 'profile.displayName': regex }, { 'profile.role': regex }] }` when search is non-empty
- Modify: `__tests__/participant.repository.mock.ts` — add `findPaginatedByEventId_result` / `_calledWith`
- Modify: service / controller / module wiring; new route `router.get('/event/:eventId/paginated', auth, admin, ...)` **before** `/event/:eventId` (the current non-paginated route) to avoid shadowing
- Modify: `presentation/dto/paginated-participants.response.dto.ts` — new response DTO; each item: `ParticipantOverviewDto` + `bracelet: { id, nfcId, status } | null`

**Spec cases:**

- Returns paginated participants for event
- `search` filters by `displayName` (case-insensitive) and `role`
- `page`/`limit` paginate correctly; `total` reflects unfiltered-by-page count
- Each item includes its bracelet (or `null` if none attached)
- Excludes soft-deleted

> **Keep or drop `GET /participants/event/:eventId` (non-paginated)?** Drop it from the public surface only if no other code path uses it. Audit: it's used by check-in flow? If yes, keep it. Otherwise mark as deprecated in this spec.

### 1.3 Bracelet module — `GET /bracelets/event/:eventId/paginated`

**Files:**

- New: `application/use-cases/get-paginated-bracelets-by-event/{...}.use-case.ts + .spec.ts`
- Modify: `bracelet.repository.interface.ts` — add `findPaginatedByEventId({ eventId, page, limit, search })`; resolves `participant` per item
- Modify: `bracelet.repository.mongoose-mongo.ts` — query `{ eventId, deletedAt: null, nfcId: regex }` when search is non-empty
- Modify: `__tests__/bracelet.repository.mock.ts`
- Modify: service / controller / module wiring; route `router.get('/event/:eventId/paginated', auth, admin, ...)` declared **before** `/:id`
- Modify: `paginated-bracelets.response.dto.ts` — item: `BraceletOverviewDto` + `participant: { id, displayName } | null`

**Spec cases:** mirror 1.2 with `nfcId` search.

### 1.4 Bracelet module — `GET /bracelets/available`

Non-paginated. Returns up to 100 bracelets with `{ status: 'active', participantId: null, deletedAt: null }`. Ordered by `createdAt DESC`.

**Spec cases:**

- Returns only active+unassigned bracelets
- Excludes `disabled`, `pre_activated`, soft-deleted, and active+already-assigned
- Caps at 100 (assert behavior with 150 fixtures)

Route: `router.get('/available', auth, admin, ...)` — **before `/:id` and `/event/:eventId/paginated`** in the module file (Express routes are first-match).

### 1.5 Check-in module — `GET /check-ins/event/:eventId/paginated`

**Files:**

- New: `get-paginated-check-ins-by-event/{...}.use-case.ts + .spec.ts`
- Modify: `check-in.repository.interface.ts` — `findPaginatedByEventId({ eventId, page, limit })`; resolves `participant` per item via the bracelet
- Modify: Mongoose repo — query `{ eventId, deletedAt: null }`, `.sort({ createdAt: -1 })`, `.populate({ path: 'braceletId', populate: 'participantId' })`. Map participant into the DTO.
- Modify: mock, service, controller, module wiring; route declared **before** `/event/:eventId` (existing non-paginated route)
- Modify: `paginated-check-ins.response.dto.ts` — item: `CheckInOverviewDto` + `participant: { id, displayName } | null`

**Spec cases:**

- Paginated, ordered by `createdAt DESC`
- Each item resolves participant via bracelet (null if bracelet has no participant, edge case)
- Excludes check-ins belonging to soft-deleted participants

### 1.6 Analytics module — `GET /analytics/events/:eventId`

**Files:**

- New: `get-event-detail-stats/{...}.use-case.ts + .spec.ts`
- Modify: `analytics.service.ts`, `analytics.controller.ts`, `analytics.module.ts` — wire route + service method

**Use-case:** receives `eventRepository`, `participantRepository`, `braceletRepository`, `checkInRepository`. Returns:

```ts
{
  participantCount: number // participants for this event
  capacity: number // from event
  capacityFillRate: number // participantCount / capacity (0 when capacity=0)
  braceletsAttachedCount: number // bracelets with this eventId
  braceletsActiveCount: number // bracelets attached + status=active
  checkInCount: number // check-ins for this event
  uniqueParticipantsCheckedIn: number // distinct participants reached by ≥1 check-in
  lastCheckInAt: string | null // ISO timestamp of latest check-in
}
```

**Why analytics and not per-module count endpoints:** `capacityFillRate` and `uniqueParticipantsCheckedIn` cross multiple modules. Bundling the simple counts with them keeps the page to **one KPI request** instead of four, and makes the cross-module ownership explicit.

**Spec cases:**

- All-zeros baseline
- Populated baseline (seeded demo event)
- `event` 404 → `EventNotFoundError`
- `capacityFillRate` = 0 when `capacity = 0` (no division-by-zero)
- `uniqueParticipantsCheckedIn` ≤ `participantCount`

### 1.7 Existing endpoints reused (no change)

- `GET /events/:id` — event detail
- `POST /events/:id/{publish,start,complete,cancel}` — status transitions
- `PATCH /participants/:id/bracelet` — attach bracelet
- `PATCH /bracelets/:id/disable` — disable bracelet

---

## 2. Routing

In `client/src/main.ts`:

```ts
{
  path: '/admin/events/:eventId',
  name: 'admin-event-detail',
  component: () => import('./pages/admin/events/$eventId/page.vue'),
  meta: { noLayout: true, requiresAdmin: true },
}
```

Page wrapper at `client/src/pages/admin/events/$eventId/page.vue` (3-line shell). Feature page in `client/src/features/admin/event-detail/event-detail.page.vue`.

---

## 3. Feature Page Structure

```vue
<AdminLayout :title="event.name" :subtitle="formattedDateRange">
  <EventDetailHeader :event :stats @action="handleStatusAction" />
  <Tabs v-model="activeTab" default-value="participants">
    <TabsList>
      <TabsTrigger value="participants">Participants ({{ stats.participantCount }})</TabsTrigger>
      <TabsTrigger value="bracelets">Bracelets ({{ stats.braceletsAttachedCount }})</TabsTrigger>
      <TabsTrigger value="check-ins">Check-ins ({{ stats.checkInCount }})</TabsTrigger>
    </TabsList>
    <TabsContent value="participants"><EventDetailParticipants ... /></TabsContent>
    <TabsContent value="bracelets"><EventDetailBracelets ... /></TabsContent>
    <TabsContent value="check-ins"><EventDetailCheckIns ... /></TabsContent>
  </Tabs>
</AdminLayout>
```

**Page-level state:**

- Reads `eventId` from `useRoute().params`
- 2 queries always running: `event`, `stats`
- 3 queries per tab (only the active tab is enabled via `enabled: computed(() => activeTab.value === '...')` to avoid loading data the user hasn't asked for)
- Each tab owns its own `page` + `search` refs (or a `{ page, limit, search }` object) — reset when the user switches tabs is **not** done, so the user can come back to their last position
- Tab badges read from `stats.*Count` — **never from `list.length`**
- Loading: page-level skeleton until `event` resolves; per-tab skeleton thereafter
- Error: if event 404, redirect to `/admin/events` with toast

---

## 4. Section Components

All under `client/src/features/admin/event-detail/components/`.

### 4.1 `event-detail-header.vue`

**Props:** `event: EventOverviewDto`, `stats: EventDetailStatsDto`
**Emits:** `action: 'publish' | 'start' | 'complete' | 'cancel'`

**Renders:**

- Event name (h1), city + venue, date range
- `Badge` for status (color-coded: draft=gray, upcoming=blue, in_progress=green, completed=neutral, cancelled=red)
- KPI strip (4 small cards): Participants `participantCount / capacity` with fill rate %, Bracelets actifs `braceletsActiveCount`, Check-ins `checkInCount`, Dernier check-in `lastCheckInAt` (relative time, "—" if null)
- Action buttons conditional on `event.status`:
  - `draft` → "Publier"
  - `upcoming` → "Démarrer" + "Annuler"
  - `in_progress` → "Clôturer"
  - `completed` / `cancelled` → none
- Small `RouterLink` "Page publique" → `/events/:slug` (new tab)

> **State machine rule:** UI only renders the transitions the backend allows. Backend remains source of truth.

### 4.2 `event-detail-participants.vue`

**Props:** `eventId: string`, `availableBracelets: BraceletOverviewDto[]`
**Internal state:** `page`, `search` refs.
**Hook:** `useGetPaginatedParticipantsByEvent({ eventId, page, limit: 20, search })`.

**Renders:**

- Search `Input` (debounced 300ms, resets `page` to 1 on change)
- Paginated table; columns:
  - Avatar (initials) + displayName + role
  - Registered at (short date)
  - Bracelet: `Badge` from the embedded `bracelet` field — "Non attribué" if `null`, NFC ID clickable → `/p/:nfcId` (new tab) if attached, "Désactivé" if `status='disabled'`
  - Checked-in: green/gray dot
  - Action: `<Button size="sm">Attacher</Button>` when `bracelet === null` → opens `<AttachBraceletDialog>`
- Pagination footer (reused `<Pagination>` primitive)

Empty state (when `total === 0` AND no search): shadcn `Card` "Aucun participant inscrit." + hint _"Lien public : /events/<slug>"_.

### 4.3 `attach-bracelet-dialog.vue`

**Props:** `participant: ParticipantOverviewDto`, `availableBracelets: BraceletOverviewDto[]`, `open: boolean`
**Emits:** `close`, `confirm: { participantId, braceletId }`

shadcn `Dialog` + `Select` over `availableBracelets` (already filtered server-side via `GET /bracelets/available`).

- Confirm disabled when no bracelet selected
- Empty available list → "Aucun bracelet disponible. Créez-en depuis Bracelets > Stock."
- Toast on success; invalidate `['participants', 'event', eventId]`, `['bracelets', 'event', eventId]`, `['bracelets', 'available']`, `['analytics', 'event', eventId]`

### 4.4 `event-detail-bracelets.vue`

**Props:** `eventId: string`
**Internal state:** `page`, `search` refs.
**Hook:** `useGetPaginatedBraceletsByEvent({ eventId, page, limit: 20, search })`.

**Renders:**

- Search `Input` (debounced, on nfcId)
- Paginated table:
  - NFC ID (monospace) — clickable → `/p/:nfcId` (new tab)
  - Status `Badge`
  - Attached participant (from embedded `participant` field — `participant?.displayName ?? '—'`)
  - Created at
  - Action: "Désactiver" when `status='active'`
- Pagination footer

Empty state (no search): "Aucun bracelet attribué à cet événement."

### 4.5 `event-detail-check-ins.vue`

**Props:** `eventId: string`, `stats: EventDetailStatsDto`
**Internal state:** `page` ref (no search).
**Hook:** `useGetPaginatedCheckInsByEvent({ eventId, page, limit: 20 })`.

**Renders:**

- KPI strip (3 cards) from `stats`: Total `checkInCount`, Uniques `uniqueParticipantsCheckedIn`, Dernier `lastCheckInAt`
- Paginated table:
  - Timestamp (relative)
  - Participant (from embedded `participant.displayName`; "—" if null)
  - Interaction type `Badge` (`check_in` | `networking` | `vote` | `cashless`)
- Pagination footer

Empty state: "Aucun check-in enregistré."

---

## 5. Hooks

All under `client/src/modules/<module>/ui/hooks/queries/`.

### 5.1 Query hooks (5)

| Hook                                      | Module      | Route                                        | Params                             | QueryKey                                                               |
| ----------------------------------------- | ----------- | -------------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------- |
| `use-get-paginated-participants-by-event` | participant | `GET /participants/event/:eventId/paginated` | `{ eventId, page, limit, search }` | `['participants', 'event', eventId, 'paginated', page, limit, search]` |
| `use-get-paginated-bracelets-by-event`    | bracelet    | `GET /bracelets/event/:eventId/paginated`    | same                               | `['bracelets', 'event', eventId, 'paginated', ...]`                    |
| `use-get-available-bracelets`             | bracelet    | `GET /bracelets/available`                   | —                                  | `['bracelets', 'available']`                                           |
| `use-get-paginated-check-ins-by-event`    | check-in    | `GET /check-ins/event/:eventId/paginated`    | `{ eventId, page, limit }`         | `['check-ins', 'event', eventId, 'paginated', page, limit]`            |
| `use-get-event-detail-stats`              | analytics   | `GET /analytics/events/:eventId`             | `{ eventId }`                      | `['analytics', 'event', eventId]`                                      |

Refs in `params` are passed by ref (mirror `useGetPaginatedEvents` shape). `enabled` flag wired to active tab for the 3 paginated hooks.

**Audit during implementation:** the check-in client module may not have a port/adapter yet — no UI consumes it today. Scaffold (model, port, adapter.http, hook) following the nfc module shape if missing.

### 5.2 Mutation hooks (6)

| Hook                   | Route                              | Invalidates                                                                                                                                                        |
| ---------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `use-publish-event`    | `POST /events/:id/publish`         | `['events', id]`, `['events']`, `['analytics', 'event', id]`, `['analytics', 'eventPageStats']`                                                                    |
| `use-start-event`      | `POST /events/:id/start`           | same                                                                                                                                                               |
| `use-complete-event`   | `POST /events/:id/complete`        | same                                                                                                                                                               |
| `use-cancel-event`     | `POST /events/:id/cancel`          | same                                                                                                                                                               |
| `use-attach-bracelet`  | `PATCH /participants/:id/bracelet` | `['participants', 'event', eventId, 'paginated']`, `['bracelets', 'event', eventId, 'paginated']`, `['bracelets', 'available']`, `['analytics', 'event', eventId]` |
| `use-disable-bracelet` | `PATCH /bracelets/:id/disable`     | `['bracelets', 'event', eventId, 'paginated']`, `['bracelets', 'available']`, `['analytics', 'event', eventId]`                                                    |

> Status transitions: if a single parameterized `use-event-status-transition(action)` reads cleaner than 4 hooks, prefer it.

> Invalidation matching: TanStack Query matches by key prefix, so `['bracelets', 'event', eventId, 'paginated']` invalidates all `(page, limit, search)` combinations for that event.

---

## 6. Events List Integration + Pagination Primitive

### 6.1 Events list page

In `client/src/features/admin/events/events.page.vue`:

- Remove `EventViewModal` import, `viewOpen`/`viewEventId` state, `handleView` handler, and the `<EventViewModal>` render.
- Row click (and "Voir" action button if separate) → `router.push(\`/admin/events/\${id}\`)`.
- "Éditer" modal stays.
- Delete `event-view-modal.vue` after wiring is removed.

### 6.2 `<Pagination>` primitive

The existing `EventTable` likely has a hardcoded pagination footer. **Extract** it to `client/src/ui/pagination/pagination.vue` so the 3 new tables can reuse it.

**Props:** `page: number`, `totalPages: number`, `total: number`
**Emits:** `update:page: number`

UI: "Précédent" / page numbers / "Suivant" + small "X sur Y résultats" text.

If extraction is non-trivial because of existing coupling, accept duplication for v1 and follow-up the cleanup.

---

## 7. Tests

### 7.1 Backend (server-side)

For each of the 5 new use-cases: `.spec.ts` colocated. Coverage as listed in §1.2–§1.6.

### 7.2 Frontend unit (Vitest)

- `event-detail-header.vue.test.ts` — for each of the 5 statuses, exactly the right action buttons render
- `attach-bracelet-dialog.vue.test.ts` — confirm disabled w/o selection; emits payload correctly
- Adapter tests for the 5 new endpoints (mock `HttpClient.get`, assert URL + query params + DTO shape)

### 7.3 Frontend E2E (Playwright)

`client/src/features/admin/event-detail/event-detail.test.e2e.ts`, run under a new `admin` Playwright project:

- Admin navigates to `/admin/events/<seeded-event-id>`:
  - Header KPI cards show non-zero values from `/analytics/events/:eventId`
  - Participants tab: Marie Dubois visible (page 1); search "marie" filters; pagination navigates if seed has > 20 participants
  - Bracelets tab: `demo-nfc-001` visible; search by nfcId
  - Check-ins tab: KPI strip from analytics; pagination footer present
- Click "Publier" on a `draft` event → status badge flips to "À venir"
- Attach-bracelet dialog: open, pick a bracelet, confirm → row refreshes
- Non-admin → `/`; anonymous → `/login?redirect=/admin/events/<id>`

**Admin auth setup:** extend `src/e2e/global-setup.ts` to sign up an admin via the seed helper, write `src/e2e/.auth/admin.json`, add an `admin` project in `playwright.config.ts`.

---

## 8. Seed Update

In `server/src/seed.ts`, ensure:

- 1 event `upcoming` (`pulse-demo-2026`, already present)
- 1 event `draft` (for E2E "Publier")
- 1 event `in_progress` (for E2E "Clôturer")
- **At least 25 participants** on `pulse-demo-2026` (so pagination is exercised; Marie remains discoverable via search)
- 3+ bracelets: Marie's `demo-nfc-001` (active+attached), `demo-nfc-002` (active+unassigned), `demo-nfc-003` (disabled)
- 5 check-ins on the demo event (so KPI uniqueness > 1)
- 1 admin user (`admin@pulse.demo`) for the E2E `admin` project

---

## 9. Definition of Done

- `/admin/events/:eventId` reachable from `/admin/events` (row click)
- `EventViewModal` removed (file deleted, no dead references)
- Header KPI strip + tab counters sourced from `GET /analytics/events/:eventId` — `grep` in `features/admin/event-detail/` finds **zero** `\.length` on `participants`/`bracelets`/`checkIns` for display purposes
- Status state machine: only allowed transitions render as buttons; clicking transitions and badge updates
- All 3 tabs paginate server-side: changing page triggers a new request; URL unchanged (state held in component) or reflected in query string (implementer's call — recommend query string for shareable links, **out of scope** if it adds friction)
- Search on Participants (displayName/role) and Bracelets (nfcId) hits the server with `?search=` and resets to page 1
- Attach-bracelet dialog consumes `GET /bracelets/available` — no client-side `.filter()` for status/assignment
- Joins (participant↔bracelet, check-in↔participant) come **embedded** in the server response — `grep` finds no manual lookup of `participants.find(p => p.id === bracelet.participantId)` in the feature components
- Non-admin → `/`; anonymous → `/login?redirect=…`
- `cd server && pnpm test` green (5 new use-case specs + repo integration tests)
- `cd client && pnpm build` green
- `cd client && pnpm lint` green
- `cd client && pnpm test` green (3+ new unit specs)
- `cd client && pnpm test:e2e --grep "Admin Event Detail"` green under the `admin` project
- Manual smoke: `pnpm dev`, admin login, full tour of the 3 tabs + search + pagination + a status transition + an attach-bracelet

---

## 10. Known Follow-Ups (deliberately deferred)

1. **Sort controls** on tables (clickable column headers).
2. **Query-string-backed pagination state** so URLs are shareable (`/admin/events/:id?tab=bracelets&page=3&q=demo`). v1 holds state in component for simplicity.
3. **Team tab** — list event organizers with role badges; invite/remove. Needs the team module's admin controller exposed.
4. **Live check-ins** — Server-Sent Events on the Check-ins tab.
5. **CSV export** — participants + check-ins for post-event reporting.
6. **Capacity guard at registration** — `register-participant.use-case` doesn't currently enforce capacity; a follow-up spec adds the check and surfaces it on the public registration page.
