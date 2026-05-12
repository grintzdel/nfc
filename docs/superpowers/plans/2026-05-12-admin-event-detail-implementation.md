# Admin Event Detail — Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development or superpowers:executing-plans to walk this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Build `/admin/events/:eventId`, the operational hub for an organizer. Header KPI strip + state-machine actions, plus 3 paginated tabs (Participants / Bracelets / Check-ins). 5 new backend endpoints (4 paginated, 1 KPI). No client-side filtering, no client-side joins, no `list.length` for display.

**Tech stack:** Backend = Express + Mongoose + Jest. Frontend = Vue 3 + TanStack Query + shadcn-vue + Tailwind + vue-sonner + lucide-vue-next.

**Plan-style:** Architectural notes + a representative full example per family. No exhaustive code dumps — the repository is the source of truth for the final code.

**No-commit policy:** Do not `git commit` between phases. Stop at each checkpoint for user review.

---

## Phase 0: Infrastructure

### Task 0.1: Install shadcn-vue primitives

- [ ] `cd client && pnpm dlx shadcn-vue@latest add tabs dialog badge`
- [ ] Verify named exports in `src/ui/tabs/index.ts`, `src/ui/dialog/index.ts`, `src/ui/badge/index.ts`
- [ ] `cd client && pnpm build` → PASS

### Task 0.2: Extract `<Pagination>` primitive

**Source:** `client/src/features/admin/events/components/event-table.vue` (or the pagination block currently used there).

- [ ] Locate the existing pagination footer used by `EventTable`
- [ ] Create `client/src/ui/pagination/pagination.vue` with props `page: number`, `totalPages: number`, `total: number` and emit `update:page`
- [ ] Replace the inline pagination in `event-table.vue` with `<Pagination v-bind=… @update:page=… />`
- [ ] `pnpm build` → PASS; manual smoke: `/admin/events` still paginates correctly
- [ ] **Fallback:** if the existing pagination is tightly coupled and extraction risks regressions, keep it inline for now and **duplicate** a minimal `<Pagination>` for the new tables. Note as follow-up.

### Task 0.3: Admin E2E auth seed

- [ ] In `server/src/seed.ts`, ensure an admin user exists: `admin@pulse.demo` / `AdminPulse2026!` with `role: 'admin'`. Idempotent (skip if already there).
- [ ] In `client/src/e2e/fixtures/seed.ts`, add a `signInAdmin()` helper that calls `POST /api/auth/login` with the admin creds and returns the token.
- [ ] In `client/src/e2e/global-setup.ts`, after the baseline user setup, sign in as admin and write `src/e2e/.auth/admin.json` with the token in localStorage (mirror the baseline `user.json` shape).
- [ ] In `client/playwright.config.ts`, add a third project `admin` reading from `admin.json`, `testIgnore: ['src/e2e/smoke/**']`, depends on `setup`.
- [ ] `cd client && pnpm exec playwright test --list` shows the new project; no admin tests yet (Phase 5 adds them).

### Task 0.4: Feature page skeleton + route

- [ ] In `client/src/main.ts`, add route `/admin/events/:eventId` with `meta: { noLayout: true, requiresAdmin: true }`
- [ ] Create `client/src/pages/admin/events/$eventId/page.vue` (3-line wrapper)
- [ ] Create `client/src/features/admin/event-detail/event-detail.page.vue` — minimal: reads `eventId` from route, calls `useGetEventById`, renders `<AdminLayout>` with the event name and 3 empty `<Tabs>`. KPI strip and tab content are placeholder text for now.
- [ ] Manual smoke: log in as admin, hit `/admin/events/<any-seeded-id>` → see the event name in the header. Non-admin → redirected.

- [ ] **CHECKPOINT — Phase 0 complete.** Stop for user review.

---

## Phase 1: Header + Analytics KPI

### Task 1.1: Backend — `GetEventDetailStatsUseCase`

**Module:** analytics. **Files:**
- `application/use-cases/get-event-detail-stats/{use-case.ts, .spec.ts}`
- modify `application/services/analytics.service.ts`, `presentation/controllers/analytics.controller.ts`, `analytics.module.ts`
- modify `presentation/dto/event-detail-stats.response.dto.ts` (new)

**Use-case shape:** constructor takes `eventRepository`, `participantRepository`, `braceletRepository`, `checkInRepository`. Method `execute(eventId)` fetches the event (throws `EventNotFoundError` if missing), then aggregates from the other 3 repos.

> **Implementation note for `uniqueParticipantsCheckedIn`:** the simplest path is `checkInRepository.findByEventId(eventId)` → map to `braceletId` → resolve via bracelet repo → `Set<participantId>.size`. If perf becomes a concern, add a dedicated repo method later; for v1 the straight approach is fine.

> **`capacityFillRate`:** integer-divide-safe: return `0` when `capacity === 0`.

- [ ] **Write the spec first** (TDD). Cases: all-zeros baseline, populated baseline (seeded), event 404, capacity=0 → fill rate 0, uniqueParticipantsCheckedIn ≤ participantCount.
- [ ] Implement the use-case (RED → GREEN)
- [ ] Wire service + controller + module: `router.get('/events/:eventId', auth, admin, ...)` — declared in the existing analytics module file alongside the other analytics routes
- [ ] Response DTO: serialize the use-case result with ISO dates (`lastCheckInAt`)
- [ ] `cd server && pnpm test -- get-event-detail-stats` → PASS
- [ ] Manual: `curl -H "Authorization: Bearer <admin-token>" http://localhost:3001/api/analytics/events/<id>` returns the block

### Task 1.2: Frontend — analytics port + adapter + hook

- [ ] In `client/src/modules/analytics/core/model/analytics.domain-model.ts`, add `EventDetailStatsDto` type
- [ ] In `analytics.port.ts`, add `getEventDetailStats(eventId): Promise<EventDetailStatsDto>`
- [ ] In `analytics.adapter.http.ts`, implement: `GET /analytics/events/:eventId`, unwrap envelope
- [ ] Adapter unit test: success path + error path
- [ ] Create `client/src/modules/analytics/ui/hooks/queries/query/use-get-event-detail-stats.ts` — `useQuery({ queryKey: ['analytics', 'event', eventId], queryFn: ..., enabled: ... })`

### Task 1.3: Frontend — Status-transition mutations

Decide between 4 hooks vs 1 parameterized hook. Recommended: **1 parameterized** for DRY.

- [ ] Create `client/src/modules/event/ui/hooks/queries/mutation/use-event-status-transition.ts` — takes `action: 'publish' | 'start' | 'complete' | 'cancel'`, posts to `/events/:id/<action>`, invalidates `['events', id]`, `['events']`, `['analytics', 'event', id]`, `['analytics', 'eventPageStats']`
- [ ] Port + adapter methods if not present: `transitionStatus(id, action)`
- [ ] Toast on success ("Événement publié", etc.) + error fallback

### Task 1.4: `<EventDetailHeader>` component

**Path:** `client/src/features/admin/event-detail/components/event-detail-header.vue`

**Architecture notes:**
- Props: `event`, `stats`. Emits: `action`.
- State machine map declared as a `Record<EventStatus, Array<{ action, label, variant }>>` const. Render via `v-for` — keeps the template short and the logic testable.
- KPI strip = 4 shadcn `<Card>` items in a `grid grid-cols-2 md:grid-cols-4 gap-3`.
- Status badge uses a `cva`-style variant map (or a small `getStatusVariant(status)` helper).
- Date range formatted via `Intl.DateTimeFormat('fr-FR')`.

- [ ] Write component
- [ ] Vitest: table-driven test asserting the right action buttons render per status (5 cases)
- [ ] Wire into `event-detail.page.vue`: page calls `useGetEventDetailStats(eventId)`, passes `event` + `stats` to header, handles `@action` by calling the transition mutation

- [ ] **CHECKPOINT — Phase 1 complete.** Header + KPI strip + status actions all work. Tabs are still empty shells. Stop for user review.

---

## Phase 2: Participants tab + attach bracelet

### Task 2.1: Backend — paginated participants by event

**Module:** participant.

- [ ] Repo interface: add `findPaginatedByEventId({ eventId, page, limit, search }): Promise<{ items, total }>` returning participants with their bracelet pre-joined
- [ ] Repo mock: `findPaginatedByEventId_result` / `_calledWith`
- [ ] Mongoose impl: filter `{ eventId, deletedAt: null }`, add `$or` for displayName/role when `search` non-empty (`new RegExp(escapeRegex(search), 'i')`), `.populate('braceletId')` to join the bracelet, `.skip((page-1)*limit).limit(limit)`. Total via `.countDocuments()` with the same filter.
- [ ] Use-case `get-paginated-participants-by-event/use-case.ts + .spec.ts` — clamp `limit` to `[1, 100]`, `page` to `≥1`. Spec cases: returns paginated items with bracelet join, search filters by displayName and role, excludes soft-deleted, total reflects unfiltered-by-page count.
- [ ] Response DTO `paginated-participants.response.dto.ts` — `items` array with each entry including `bracelet: { id, nfcId, status } | null`
- [ ] Service / controller / module wiring: route `router.get('/event/:eventId/paginated', auth, admin, ...)` declared **before** the existing `/event/:eventId` route
- [ ] `cd server && pnpm test -- get-paginated-participants-by-event` → PASS

### Task 2.2: Backend — available bracelets

**Module:** bracelet.

- [ ] Repo interface: `findAvailable(limit = 100): Promise<BraceletEntity[]>` — filter `{ status: 'active', participantId: null, deletedAt: null }`, ordered by `createdAt DESC`, capped
- [ ] Mock, Mongoose impl
- [ ] Use-case `get-available-bracelets/use-case.ts + .spec.ts`. Spec cases: excludes disabled / pre_activated / soft-deleted / already-assigned-active; caps at 100 (assert with 150 fixtures)
- [ ] Service / controller / module wiring: route `router.get('/available', auth, admin, ...)` — declared **before `/:id`** and `/event/...`
- [ ] `cd server && pnpm test -- get-available-bracelets` → PASS

### Task 2.3: Frontend — port + adapter + hooks

- [ ] Participant port: `getPaginatedByEvent({ eventId, page, limit, search }): Promise<PaginatedParticipantsDto>`. Adapter: `GET /participants/event/:eventId/paginated?page=&limit=&search=`. Unit-test adapter.
- [ ] Domain-model: add `PaginatedParticipantsDto` (items include the bracelet summary).
- [ ] Hook `use-get-paginated-participants-by-event.ts` — accepts reactive params, key `['participants', 'event', eventId, 'paginated', page, limit, search]`, `enabled` flag wired to active tab.
- [ ] Bracelet port: `getAvailable(): Promise<BraceletOverviewDto[]>`. Adapter: `GET /bracelets/available`. Unit-test.
- [ ] Hook `use-get-available-bracelets.ts` — `['bracelets', 'available']`.
- [ ] Attach mutation `use-attach-bracelet.ts` (participant module) — `PATCH /participants/:id/bracelet`. Invalidate `['participants', 'event', eventId]` (prefix matches all paged variants), `['bracelets', 'event', eventId]`, `['bracelets', 'available']`, `['analytics', 'event', eventId]`.

### Task 2.4: Components

**`event-detail-participants.vue`** — internal state `page`, `search` refs. Mount the participants hook with these. Renders search input (debounced 300ms — write a tiny `useDebouncedRef` composable in `client/src/modules/shared/ui/hooks/` if not present), table with the columns from spec §4.2, and `<Pagination>` footer. The bracelet column reads from `item.bracelet` (server-embedded) — no client-side resolution. Empty state when `total === 0 && !search`.

**`attach-bracelet-dialog.vue`** — shadcn `Dialog` + `Select` over `availableBracelets` prop (already filtered server-side). Confirm calls the mutation. Empty available list → "Aucun bracelet disponible".

- [ ] Write `event-detail-participants.vue`
- [ ] Write `attach-bracelet-dialog.vue`
- [ ] Vitest unit test for `attach-bracelet-dialog`: confirm disabled w/o selection; emits payload correctly
- [ ] Wire into `event-detail.page.vue`: pass `eventId` + `availableBracelets` query result. The dialog open/close state lives in the participants component (passes the selected participant down).

- [ ] **CHECKPOINT — Phase 2 complete.** Participants tab paginates, searches, and attaches. Stop for user review.

---

## Phase 3: Bracelets tab

### Task 3.1: Backend — paginated bracelets by event

- [ ] Repo: `findPaginatedByEventId({ eventId, page, limit, search }): Promise<{ items, total }>` — filter `{ eventId, deletedAt: null }`, search regex on `nfcId`, `.populate('participantId')`
- [ ] Mock, Mongoose impl
- [ ] Use-case `get-paginated-bracelets-by-event/use-case.ts + .spec.ts` (same shape as 2.1)
- [ ] Response DTO with `participant: { id, displayName } | null` per item
- [ ] Wiring: route `router.get('/event/:eventId/paginated', auth, admin, ...)` declared **before `/:id`** and `/event/...` if a non-paginated variant exists
- [ ] `cd server && pnpm test -- get-paginated-bracelets-by-event` → PASS

### Task 3.2: Frontend — port + adapter + hooks

- [ ] Bracelet port + adapter: `getPaginatedByEvent({ eventId, page, limit, search }): Promise<PaginatedBraceletsDto>`. Unit-test adapter.
- [ ] Hook `use-get-paginated-bracelets-by-event.ts` — key `['bracelets', 'event', eventId, 'paginated', ...]`, `enabled` on active tab.
- [ ] Disable mutation `use-disable-bracelet.ts` — `PATCH /bracelets/:id/disable`. Invalidate the paginated list + available + analytics.

### Task 3.3: `event-detail-bracelets.vue`

Same skeleton as 2.4 (page+search refs, debounced search input, paginated table, footer). Columns per spec §4.4. The participant column reads `item.participant?.displayName ?? '—'` — no manual join. Action menu per row: "Désactiver" when `status='active'`.

- [ ] Write component
- [ ] Wire into `event-detail.page.vue`

- [ ] **CHECKPOINT — Phase 3 complete.** Bracelets tab paginates, searches, disables. Stop for user review.

---

## Phase 4: Check-ins tab

### Task 4.1: Backend — paginated check-ins by event

- [ ] Repo: `findPaginatedByEventId({ eventId, page, limit }): Promise<{ items, total }>` — filter `{ eventId, deletedAt: null }`, `.sort({ createdAt: -1 })`, `.populate({ path: 'braceletId', populate: 'participantId' })`. Map participant into the response item.
- [ ] Mock, Mongoose impl
- [ ] Use-case + spec (paginated, ordered by createdAt desc, embedded participant resolved via bracelet — null when no participant)
- [ ] Response DTO `paginated-check-ins.response.dto.ts` with `participant: { id, displayName } | null`
- [ ] Wiring: route declared **before** the existing non-paginated `/event/:eventId` route
- [ ] `cd server && pnpm test -- get-paginated-check-ins-by-event` → PASS

### Task 4.2: Frontend — scaffold check-in module if missing

**Audit:** check whether `client/src/modules/check-in/` has a port + adapter. No UI consumes it today, so it may not exist.

- [ ] If missing: scaffold `core/{model,ports,adapters}/check-in.*.ts` following the `nfc` module shape (it's the leanest example in the repo). Add `checkInPort` to `dependencies.ts`.
- [ ] Port method: `getPaginatedByEvent({ eventId, page, limit }): Promise<PaginatedCheckInsDto>`. Adapter: `GET /check-ins/event/:eventId/paginated?page=&limit=`. Unit-test.
- [ ] Hook `use-get-paginated-check-ins-by-event.ts` — key `['check-ins', 'event', eventId, 'paginated', page, limit]`, `enabled` on active tab.

### Task 4.3: `event-detail-check-ins.vue`

- [ ] KPI strip (3 cards) from `stats` prop — no derivation
- [ ] Paginated table per spec §4.5 (no search)
- [ ] `<Pagination>` footer
- [ ] Wire into `event-detail.page.vue`

- [ ] **CHECKPOINT — Phase 4 complete.** All 3 tabs functional. Stop for user review.

---

## Phase 5: Integration, seed, E2E, cleanup

### Task 5.1: Wire `/admin/events` → detail page; remove `EventViewModal`

- [ ] In `client/src/features/admin/events/events.page.vue`:
  - Remove `EventViewModal` import + render + `viewOpen`/`viewEventId` state + `handleView` handler + `useGetEventById(viewEventId)` query
  - Replace `@view="handleView"` on `<EventTable>` with `@view="(id) => router.push(\`/admin/events/\${id}\`)"` (and wire a row-click similarly if not already)
- [ ] In `client/src/features/admin/events/components/`, delete `event-view-modal.vue` (and remove from any local index)
- [ ] `pnpm build && pnpm lint` → PASS
- [ ] Manual: from `/admin/events`, click a row → land on `/admin/events/:id`

### Task 5.2: Seed update

In `server/src/seed.ts`:

- [ ] Ensure events:
  - 1 `upcoming` (`pulse-demo-2026`, existing)
  - 1 `draft` (slug `pulse-draft-demo`)
  - 1 `in_progress` (slug `pulse-live-demo`)
- [ ] Generate **≥ 25 participants** on `pulse-demo-2026` (Marie + 24 generated fixtures with varied names). Reuse the existing participant factory pattern; ensure Marie remains discoverable by searching "marie".
- [ ] Bracelets: `demo-nfc-001` (active+attached to Marie), `demo-nfc-002` (active+unassigned), `demo-nfc-003` (disabled). Add a few more attached to the new participants so the Bracelets tab has rows.
- [ ] At least **5 check-ins** on `pulse-demo-2026` across ≥ 2 distinct participants (so `uniqueParticipantsCheckedIn ≥ 2`).
- [ ] Admin user `admin@pulse.demo` (Task 0.3 already added).
- [ ] `cd .. && pnpm seed` → runs without error.

### Task 5.3: E2E tests

**Path:** `client/src/features/admin/event-detail/event-detail.test.e2e.ts`, runs under the `admin` Playwright project.

Test cases (use `getByRole`/`getByText` selectors, see spec §7.3):

- Header shows event name + status badge + non-zero KPI cards
- Participants tab: Marie visible page 1; search "marie" filters; pagination footer present (page nav if total > limit)
- Bracelets tab: `demo-nfc-001` visible; search by partial nfcId
- Check-ins tab: KPI strip visible; pagination footer present
- Click "Publier" on a `draft` event (use `pulse-draft-demo` slug to fetch its ID via API, then navigate to its detail page) → status badge flips to "À venir"
- Attach-bracelet dialog: open from a participant w/o bracelet, select `demo-nfc-002`, confirm → toast + the row's bracelet badge updates

Authorization tests (smoke project, anonymous + non-admin):

- Anonymous `/admin/events/<id>` → redirected to `/login?redirect=...`
- Non-admin user (baseline E2E user) → redirected to `/`

- [ ] Write E2E file
- [ ] `cd client && pnpm test:e2e --grep "Admin Event Detail"` → PASS

### Task 5.4: Final verification

- [ ] `grep -rn "\.length" client/src/features/admin/event-detail/` — confirm zero `participants.length` / `bracelets.length` / `checkIns.length` used for display (tabs counters, KPI strip)
- [ ] `grep -rn "\.find(p =>" client/src/features/admin/event-detail/` — confirm no client-side join (participant↔bracelet etc.)
- [ ] `cd server && pnpm test` → all green
- [ ] `cd client && pnpm test` → all green
- [ ] `cd client && pnpm test:e2e` → all green (smoke + authenticated + admin)
- [ ] `cd client && pnpm build && pnpm lint` → PASS
- [ ] Manual smoke as admin: full tour (header transitions, all 3 tabs, search, pagination, attach, disable)

- [ ] **CHECKPOINT — All phases complete.** Inform the user. Do NOT commit.

---

## Definition of Done

Mirror of spec §9 — all items must hold:

- `/admin/events/:eventId` reachable from `/admin/events`
- `EventViewModal` deleted (file + references)
- KPI strip + tab counters from `/analytics/events/:eventId` only
- Status state machine respected in UI
- All 3 tabs paginate + search server-side
- Joins embedded in server responses (no client `.find()`)
- All test suites green; manual smoke passes

---

## Self-Review Notes

- **Route order matters in Express modules** — `/available`, `/event/:eventId/paginated` etc. must be declared **before** generic `:id` or non-paginated `/event/:eventId` routes to avoid shadowing. Each backend task flags this.
- **Reactive params in TanStack Query hooks** — pass `Ref`s, not plain values, so the query re-fires when page/search changes. Mirror `useGetPaginatedEvents`.
- **Debounced search** — 300ms is the existing project default (used elsewhere?). If no shared `useDebouncedRef` exists, write one in `client/src/modules/shared/ui/hooks/` rather than inlining a `setTimeout` per component.
- **Enabled-on-active-tab** — saves 2 network requests on initial mount. Use `enabled: computed(() => activeTab.value === '<name>')`. The query refires when the user opens the tab.
- **Server-side joins** — Mongoose `.populate()` is the simplest path. If perf bites (N+1 not expected at this scale), revisit with a dedicated aggregation pipeline.
- **Test-driven order** — every backend use-case spec is written **before** the implementation. The repo already follows this rule (see `update-participant-profile.use-case.spec.ts` from Phase 1 of the previous plan).
- **Out of scope reinforced** — no inline profile edit, no team tab, no CSV, no SSE. If a task starts pulling these in, stop and re-scope.
