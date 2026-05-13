# Participant Profile Edit — Design Spec

## Goal

After a user registers for an event, they need to be able to edit the profile that will be displayed when their NFC bracelet is tapped: display name, role, bio, and an extensible list of social/professional links. This is the data layer behind the page from Spec 1.

This spec also introduces the **model extension** required by Specs 1 and 2: `ParticipantProfile.linkedinUrl` becomes `ParticipantProfile.links: ProfileLink[]`, with an open whitelist of 7 link types.

## Scope

### Backend

- New constant `ProfileLinkType` (`linkedin`, `twitter`, `github`, `instagram`, `website`, `email`, `custom`)
- Extend `ParticipantProfile`: replace `linkedinUrl: string | null` with `links: ProfileLink[]`
- Update Mongoose schema and DTOs
- Update `update-participant-profile.use-case.ts` with ownership check (403 if non-owner)
- Update entity validation (URL format, max 10 links)
- Update unit tests

### Frontend

- New route `/me/events/:participantId` with new `requiresAuth` meta + guard
- New page `participant-profile-edit.page.vue`
- New components: `profile-fields-form.vue`, `profile-links-editor.vue`, `profile-link-row.vue`
- New constant + types mirroring `ProfileLinkType` on the client
- Honor `?redirect=` in `login.page.vue` for round-trip flows
- New mutation hook `use-update-participant-profile`

## Out of Scope

- Drag-and-drop link reordering (links appear in insertion order)
- Avatar / photo upload
- Multi-participation summary screen (one edit page per participation)
- Live preview of the NFC page (deferred to v1.1)

---

## 1. Backend — Model Extension

### 1.1 New constant `profile-link-type.constant.ts`

`server/src/modules/participant/domain/constants/profile-link-type.constant.ts`:

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

### 1.2 Entity changes

`server/src/modules/participant/domain/entity/participant.entity.ts`:

```ts
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
```

- `linkedinUrl` is removed (no production data to migrate — seed is rebuilt)
- `create()` defaults `links: []`
- `updateProfile()` validates `links`:
  - if `partial.links !== undefined`, validate each:
    - `Object.values(ProfileLinkType).includes(link.type)`
    - if `link.type === 'email'`: `url` matches `^mailto:.+@.+\..+$`
    - else: `url` matches `^https?://.+`
    - `label` may be null for known types; required for `custom`
  - if `links.length > 10`, throw `Error('Maximum 10 links allowed')`
- Update `toJSON()` to include `links`

### 1.3 Mongoose schema

`server/src/modules/participant/infrastructure/schema/participant.schema.ts` (or wherever the schema lives):

```ts
const profileLinkSchema = new Schema({
  type: { type: String, enum: Object.values(ProfileLinkType), required: true },
  url: { type: String, required: true },
  label: { type: String, default: null },
}, { _id: false })

// Inside participant schema:
profile: {
  displayName: { type: String, required: true },
  role: { type: String, default: null },
  bio: { type: String, default: null },
  links: { type: [profileLinkSchema], default: [] },
}
```

Remove the existing `linkedinUrl` field.

### 1.4 DTO

`server/src/modules/participant/presentation/dto/update-participant-profile.request.dto.ts` (or wherever the DTO lives):

```ts
class UpdateParticipantProfileRequestDto {
  displayName?: string
  role?: string | null
  bio?: string | null
  links?: ProfileLink[]
}
```

### 1.5 Ownership check in use-case

`update-participant-profile.use-case.ts` must verify the requester owns the participant:

```ts
async execute(participantId: string, requesterId: string, partial: Partial<ParticipantProfile>) {
  const participant = await this.participantRepository.findById(participantId)
  if (!participant || participant.isDeleted()) throw new ParticipantNotFoundError(participantId)
  if (participant.userId !== requesterId) throw new AppError(403, 'Forbidden')
  participant.updateProfile(partial)
  return this.participantRepository.update(participant)
}
```

The controller must pass `req.user.userId` as `requesterId`. **Audit the existing use-case during implementation** — if the ownership check is missing, add it; if it's a query-string trick, remove the trick.

### 1.6 Tests to update

- `participant.entity.spec.ts`: add cases for valid links, invalid URL, invalid type, > 10 links, custom without label
- `update-participant-profile.use-case.spec.ts`: add case for 403 when requesterId mismatches

### 1.7 Seed

Update `server/src/seed.ts` to use `links: [...]` instead of `linkedinUrl: '...'`. See Spec 1 for the demo data.

---

## 2. Frontend

### 2.1 Domain model mirror

`client/src/modules/participant/core/model/participant.domain-model.ts`:

```ts
export namespace ParticipantDomainModel {
  export interface ProfileLinkDto {
    type: ProfileLinkType
    url: string
    label: string | null
  }
  export interface ParticipantProfileDto {
    displayName: string
    role: string | null
    bio: string | null
    links: ProfileLinkDto[]
  }
  // ... existing types updated to use ParticipantProfileDto
}
```

### 2.2 Client-side constant

`client/src/modules/participant/core/constants/profile-link-type.constant.ts`: same shape as the server constant.

### 2.3 Port + adapter updates

`participant.port.ts` already exposes `updateProfile(id, dto)` — only the DTO shape changes (now includes `links`). Adjust the HTTP adapter signature accordingly.

### 2.4 Hooks

Both hooks **already exist** in the codebase:

- `use-get-participant-by-id.ts` — query on `GET /api/participants/:id`
- `use-update-participant-profile.ts` — mutation on `PATCH /api/participants/:id/profile`

Only their **types** need to be updated to match the new `UpdateParticipantProfileDto` (which now includes `links`). Verify on read that they invalidate `['participants', id]` on success and surface errors via toast — adjust if not.

### 2.5 Routing + guard

In `client/src/main.ts`:

```ts
{
  path: '/me/events/:participantId',
  name: 'participant-profile-edit',
  component: () => import('./pages/me/events/page.vue'),
  meta: { requiresAuth: true },
},
```

Extend the guard:

```ts
router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAdmin) {
    if (!token) return { path: '/login', query: { redirect: to.fullPath } }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      if (payload.role !== 'admin') return '/'
    } catch {
      return '/login'
    }
  }
  if (to.meta.requiresAuth && !token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }
})
```

Note: the `requiresAdmin` branch is also tweaked — failed admin check now goes to `/` (not `/login` which would loop for authed-but-non-admin users).

### 2.6 Honor `?redirect=` in login

`login.page.vue`:

```ts
const route = useRoute()
// ... in handleSubmit, after setAuthToken:
const redirect = (route.query.redirect as string | undefined) ?? null
router.push(redirect ?? (isAdmin() ? '/admin/dashboard' : '/'))
```

Same logic in `register.page.vue`.

### 2.7 Page wrapper

`client/src/pages/me/events/page.vue`:

```vue
<script setup lang="ts">
import ParticipantProfileEditPage from '@/features/private/participant-profile-edit/participant-profile-edit.page.vue'
</script>
<template><ParticipantProfileEditPage /></template>
```

### 2.8 Feature page

`client/src/features/private/participant-profile-edit/participant-profile-edit.page.vue`:

- Reads `participantId` from route
- Calls `useGetParticipantById(participantId)`
- If error 403 (`requesterId !== ownerId`) → toast + `router.push('/')`
- Renders `<ProfileFieldsForm v-model="...">` + `<ProfileLinksEditor v-model="...">` + Save button
- Save button calls `useUpdateParticipantProfile().mutate(...)`

### 2.9 Components

`client/src/modules/participant/ui/components/`:

| Component                  | Props                                 | Role                                                                                            |
| -------------------------- | ------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `profile-fields-form.vue`  | `v-model: { displayName, role, bio }` | 3 inputs                                                                                        |
| `profile-links-editor.vue` | `v-model: ProfileLinkDto[]`           | Lists `<ProfileLinkRow>` + "Add" button; disables Add at 10                                     |
| `profile-link-row.vue`     | `link, @update, @remove`              | `<select type>` + `<input url>` + `<input label>` (shown if `type === 'custom'`) + trash button |

**Reusable**: `profile-links-editor.vue` is consumed both here AND in Spec 2's registration form.

### 2.10 Validation (client-side)

In `profile-links-editor.vue`'s parent (or in a small `validateLinks(links)` util in the participant module):

- URL non-empty
- URL matches `^https?://` (or `^mailto:` if type=email)
- For `custom`: label non-empty
- Block save with `toast.error()` if invalid

### 2.11 Live preview (optional, v1.1)

Right column could show `<NfcProfileHero>` + `<NfcLinkCard>` (reused from Spec 1's module) bound to the same reactive state. Skip in v1 unless trivial.

---

## 3. Tests

### 3.1 Backend unit

- `participant.entity.spec.ts`:
  - valid links accepted
  - link with type='invalid_type' rejected
  - link with malformed url rejected
  - link of type=email with non-mailto url rejected
  - more than 10 links rejected
  - custom link without label rejected
- `update-participant-profile.use-case.spec.ts`:
  - 403 when `requesterId !== participant.userId`
  - 200 when owner, links updated correctly

### 3.2 Frontend E2E (Playwright)

`client/src/features/private/participant-profile-edit/participant-profile-edit.test.e2e.ts`:

- Authed as Marie, navigate to `/me/events/<her-participant-id>`, edit displayName, add 1 LinkedIn link, save → success toast, reload preserves changes
- Try to navigate to another participant's edit page → toast error + redirect
- Unauthed user navigates to `/me/events/<id>` → redirected to `/login?redirect=/me/events/<id>`
- After login, redirected back to the edit page

### 3.3 Frontend unit

- `profile-links-editor.vue.test.ts`: add/remove/update works; cannot add an 11th link
- `profile-link-row.vue.test.ts`: label input appears only for `type='custom'`

---

## 4. Definition of Done

- `/me/events/<participant-id>` (as the owner) lets the user edit name/role/bio/links, save, refresh, and observe persistence
- Editing another user's participation returns 403 from the server and a graceful UI redirect
- Unauthed navigation to a `requiresAuth` route redirects to `/login?redirect=...` and the post-login redirect lands back on the original page
- The NFC public page (Spec 1) reflects the latest profile changes after edit (manual end-to-end check)
- `cd server && pnpm test` passes
- `cd client && pnpm lint` passes
- New E2E tests green
- `cd client && pnpm build` passes
