# Event Public Page + Registration — Design Spec

## Goal

Anyone with a shareable link `/events/:slug` can view an event's details and register for it on a single screen. Non-authenticated visitors create their account and their participant profile in one form; authenticated visitors only fill the participant profile. After submission, the user lands on the profile-edit page (Spec 3) and can refine their bio/links.

## Scope

- Backend: new public route `GET /api/events/public/:slug` (no auth)
- Backend: `EventRepository.findBySlug(slug)` method
- Backend: new use-case `get-event-by-slug-public` (filters out draft/completed/cancelled events)
- Frontend: page `/events/:slug` with hero, description, and registration form
- Frontend: registration form that branches on auth state and chains `register` + `registerParticipant` if needed
- Frontend: gracefully handle `ParticipantAlreadyRegisteredError` by redirecting to the existing participation

## Out of Scope

- Pre-payment / ticketing (free registration only in v1)
- Email confirmation / magic link
- Bracelet attachment at registration time
- Capacity check UI (server already enforces capacity in a follow-up scope; v1 lets server decide)
- Social OAuth (Google/Apple buttons remain decorative)

## Dependencies

- Spec 3's model extension (`ParticipantProfile.links: ProfileLink[]`) is needed so the form can collect links
- Reuses `<ProfileLinksEditor>` and `<ProfileLinkRow>` components introduced in Spec 3

---

## 1. Backend

### 1.1 EventRepository — `findBySlug`

Add to `server/src/modules/event/domain/repository/event.repository.interface.ts`:

```ts
findBySlug(slug: string): Promise<EventEntity | null>
```

Implement in `server/src/modules/event/infrastructure/repository/event.repository.mongoose-mongo.ts`:

```ts
async findBySlug(slug: string): Promise<EventEntity | null> {
  const doc = await this.model.findOne({ slug, deletedAt: null }).lean()
  return doc ? this.toEntity(doc) : null
}
```

### 1.2 New use-case `get-event-by-slug-public`

`server/src/modules/event/application/use-cases/get-event-by-slug-public/get-event-by-slug-public.use-case.ts`:

```ts
export class GetEventBySlugPublicUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}

  async execute(slug: string): Promise<EventEntity> {
    const event = await this.eventRepository.findBySlug(slug)
    if (!event || event.isDeleted()) throw new EventNotFoundError(slug)
    if (!event.isUpcoming() && !event.isInProgress()) {
      throw new AppError(404, 'Event not available')
    }
    return event
  }
}
```

### 1.3 Controller method

`EventController.getPublicBySlug(req, res, next)` — wraps the use-case, returns `{ success: true, data: event.toJSON() }`.

### 1.4 Route — public, no auth

In `server/src/modules/event/event.module.ts`, **before** the auth-protected `router.get('/')`:

```ts
router.get('/public/:slug', (req, res, next) => controller.getPublicBySlug(req, res, next))
```

Order matters: this route must be declared before route patterns that could shadow it.

### 1.5 Wiring

In `event.module.ts`, instantiate `GetEventBySlugPublicUseCase` and pass it to the controller alongside existing use-cases.

### 1.6 Existing registration safeguards (no change)

`register-participant.use-case.ts` already throws:

- `EventNotFoundError` if event missing/deleted
- `AppError(400)` if event completed/cancelled
- `ParticipantAlreadyRegisteredError` if same `(userId, eventId)` exists

Front-end relies on these.

---

## 2. Frontend

### 2.1 Module event — port extension

In `client/src/modules/event/core/ports/event.port.ts`:

```ts
getPublicBySlug(slug: string): Promise<EventDomainModel.EventOverviewDto>
```

In `client/src/modules/event/core/adapters/event.adapter.http.ts`, add the method calling `GET /events/public/:slug`. No auth header needed (the route is public).

### 2.2 New query hook

`client/src/modules/event/ui/hooks/queries/query/use-get-event-public-by-slug.ts`:

```ts
useQuery({
  queryKey: ['events', 'public', slug],
  queryFn: () => eventPort.getPublicBySlug(slug),
  retry: false,
})
```

### 2.3 Route

In `client/src/main.ts`:

```ts
{ path: '/events/:slug', name: 'event-public', component: () => import('./pages/events-public/page.vue') }
```

Uses the default layout (`app-nav` visible).

### 2.4 Page wrapper

`client/src/pages/events-public/page.vue`:

```vue
<script setup lang="ts">
import EventPublicPage from '@/features/public/event-public/event-public.page.vue'
</script>
<template><EventPublicPage /></template>
```

### 2.5 Feature page

`client/src/features/public/event-public/event-public.page.vue`:

- Reads `slug` from `useRoute().params`
- Calls `useGetEventPublicBySlug(slug)`
- Renders states: loading / error (event not available) / success
- Success layout: `<EventPublicHero>` (top), 2-column grid below: `<EventPublicDescription>` left, `<EventRegistrationForm>` right

### 2.6 Components

In `client/src/modules/event/ui/components/`:

| Component                      | Role                                                                                               |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| `event-public-hero.vue`        | Cover banner: event name, formatted date range (`Intl.DateTimeFormat('fr-FR')`), city + venue name |
| `event-public-description.vue` | Description rendered in a prose-styled card                                                        |
| `event-not-available.vue`      | Friendly error state shown when API returns 404                                                    |
| `event-registration-form.vue`  | The dual-mode registration form (see 2.7)                                                          |

### 2.7 Form `event-registration-form.vue`

**Imports** `useAuth()` and `useDependencies()`.

**Reactive state**:

```ts
const isLoggedIn = computed(() => isAuthenticated())
const accountFields = ref({ firstName: '', lastName: '', email: '', password: '' }) // ignored when logged in
const profileFields = ref({
  displayName: '',
  role: '',
  bio: '',
  links: [] as ProfileLinkDto[],
})
```

**Always-shown fields**: `displayName` (required), `role`, `bio`, `<ProfileLinksEditor v-model="profileFields.links" />` (component from Spec 3).

**Conditionally shown** (`!isLoggedIn`): `firstName`, `lastName`, `email`, `password`. Plus a small link _"J'ai déjà un compte"_ → `router.push({ path: '/login', query: { redirect: route.fullPath } })`.

**Client-side validation** (before submit):

- email matches a simple regex
- password length ≥ 8
- `displayName.trim()` non-empty
- each link URL matches `^https?://` (or `^mailto:` if `type === 'email'`)
- `links.length <= 10`

If invalid: `toast.error(...)` with the first failing rule, no submit.

### 2.8 Submit flow

```ts
async function handleSubmit() {
  if (!validate()) return
  isLoading.value = true
  try {
    if (!isLoggedIn.value) {
      const auth = await authPort.register(accountFields.value)
      localStorage.setItem('token', auth.token)
      getSharedHttpClient().setAuthToken(auth.token)
    }
    const participant = await participantPort.register({
      eventId: event.value.id,
      profile: profileFields.value,
    })
    toast.success('Inscription confirmee !')
    router.push(`/me/events/${participant.id}`)
  } catch (e) {
    const message = e instanceof Error ? e.message : ''
    const isAlreadyRegistered = message.toLowerCase().includes('already registered')
    if (isAlreadyRegistered) {
      const mine = await participantPort.getMyParticipations()
      const existing = mine.find((p) => p.eventId === event.value.id)
      if (existing) {
        toast.info('Vous etes deja inscrit.')
        router.push(`/me/events/${existing.id}`)
        return
      }
    }
    toast.error(message || "Erreur lors de l'inscription")
  } finally {
    isLoading.value = false
  }
}
```

Note: the backend extracts `userId` from the JWT in the auth middleware, so the frontend never sends `userId` — only `eventId` + `profile`.

Error matching is done on the message string returned by `ParticipantAlreadyRegisteredError` (server-side class). A cleaner approach would be to expose an `error.code` field in the API envelope — out of scope here, but a known follow-up. The `getMyParticipations()` call on the port already exists in `participant.port.ts`.

### 2.9 Edge cases

- **Event `draft` / `completed` / `cancelled`** → backend returns 404 → page shows `<EventNotAvailable />`
- **Network error on submit** → toast, form keeps its state, user retries
- **Account created but participant registration fails** → the user keeps the new account; they can refresh and the form switches to logged-in mode. Acceptable in v1.
- **Already-registered user (anonymous form path)** → only possible if they register a new account with same email; backend's email uniqueness check on register throws first

---

## 3. Tests

### 3.1 Backend unit

`get-event-by-slug-public.use-case.spec.ts`:

- returns event when status `upcoming`
- returns event when status `in_progress`
- throws 404 when status `draft`
- throws 404 when status `completed`
- throws 404 when slug not found
- throws 404 when soft-deleted

### 3.2 Frontend E2E (Playwright)

`client/src/features/public/event-public/event-public-registration.test.e2e.ts`:

- **Anonymous full registration**: visit `/events/pulse-demo-2026`, fill all fields including 1 link, submit → arrives on `/me/events/<id>` with toast
- **Pre-authenticated registration**: authed user visits the page, fills only profile fields, submits → arrives on `/me/events/<id>`
- **Duplicate registration**: authed user who's already a participant submits → redirected to existing participation
- **Unavailable event**: visit `/events/<draft-slug>` → `<EventNotAvailable>` visible

### 3.3 Frontend unit

`event-registration-form.vue.test.ts`:

- Toggles fields when `isAuthenticated()` flips
- Calls `authPort.register` only when anonymous
- Always calls `participantPort.register`

---

## 4. Definition of Done

- `/events/pulse-demo-2026` accessible without login, shows event hero + description
- An anonymous visitor can complete the full form → lands on the edit page (Spec 3)
- An authed user can register with only profile fields → lands on the edit page
- `cd server && pnpm test` passes
- `cd client && pnpm lint` passes
- New E2E tests green
- `cd client && pnpm build` passes
