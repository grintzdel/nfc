# NFC Public Page — Design Spec

## Goal

When someone scans a participant's NFC bracelet, the device opens `/p/<nfcId>` and displays the participant's profile — a Linktree-like page exposing the participant's identity, bio, and social/professional links, framed by the event context.

This is the visible payoff of the whole product: a single URL that turns a piece of plastic into a networking card.

## Scope

- New frontend module `client/src/modules/nfc/` (port, adapter, hook)
- New public route `/p/:nfcId` (no auth, no app-nav layout)
- New page in `client/src/features/public/nfc-profile/`
- New components: hero, bio section, link card, link-icon resolver, error state
- Seed update so the route is demoable out-of-the-box

## Out of Scope

- Bracelet activation / attachment UI (handled in admin block, later)
- Profile editing (Spec 3)
- Tap analytics / interaction tracking
- Per-event custom branding
- Avatar image upload (v1 uses initials)

## Dependencies

- Requires Spec 3's model extension (`ParticipantProfile.links: ProfileLink[]`). Until that lands, the page can be built against a hardcoded shape but the live data won't include links.

---

## 1. Backend

The endpoint already exists in `server/src/routes/nfc.routes.ts`:
`GET /api/nfc/:nfcId` returns

```jsonc
{
  "success": true,
  "data": {
    "bracelet": { "nfcId": "...", "status": "active" },
    "participant": {
      "id": "...",
      "profile": {
        /* extended with links[] from Spec 3 */
      },
      "checkedInAt": null,
    },
    "event": {
      "id": "...",
      "name": "...",
      "slug": "...",
      "venueName": "...",
      "venueAddress": "...",
      "startsAt": "...",
      "endsAt": "...",
      "status": "upcoming",
    },
  },
}
```

Returns 404 if:

- bracelet not found, soft-deleted, or status === `stock`
- no participant attached to that bracelet
- event not found / soft-deleted

**No backend changes are required for Spec 1 itself.** The model extension lives in Spec 3.

---

## 2. Frontend Module — `modules/nfc/`

### 2.1 Domain model

`client/src/modules/nfc/core/model/nfc.domain-model.ts`:

```ts
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'
import type { EventStatus } from '@/modules/event/core/constants/event-status.constant'

export namespace NfcDomainModel {
  export interface NfcTapResponseDto {
    bracelet: { nfcId: string; status: 'pre_activated' | 'active' | 'disabled' }
    participant: {
      id: string
      profile: ParticipantDomainModel.ParticipantProfileDto
      checkedInAt: string | null
    }
    event: {
      id: string
      name: string
      slug: string
      venueName: string
      venueAddress: string
      startsAt: string
      endsAt: string
      status: EventStatus
    }
  }
}
```

### 2.2 Port

`client/src/modules/nfc/core/ports/nfc.port.ts`:

```ts
export interface INfcPort {
  getByNfcId(nfcId: string): Promise<NfcDomainModel.NfcTapResponseDto>
}
```

### 2.3 HTTP adapter

`client/src/modules/nfc/core/adapters/nfc.adapter.http.ts`:

- Implements `INfcPort` using `getSharedHttpClient()`
- `GET /nfc/:nfcId`, **no auth header sent** (route is public, but the http client will include the token if present — that's harmless)
- On HTTP 404, throws a typed error `NfcBraceletNotActiveError`

### 2.4 Hook

`client/src/modules/nfc/ui/hooks/queries/query/use-get-nfc-by-id.ts`:

```ts
useQuery({
  queryKey: ['nfc', nfcId],
  queryFn: () => nfcPort.getByNfcId(nfcId),
  retry: false, // 404 = "not activated", retry is useless
})
```

### 2.5 Dependencies wiring

In `client/src/modules/app/core/dependencies.ts`:

- Add `nfcPort: INfcPort` to the `Dependencies` type
- Instantiate `new NfcHttpAdapter(httpClient)` in `createDependencies()`

---

## 3. Routing

In `client/src/main.ts`, add:

```ts
{
  path: '/p/:nfcId',
  name: 'nfc-profile',
  component: () => import('./pages/p/page.vue'),
  meta: { noLayout: true },
}
```

Note: `/p/` (single letter) keeps the printed URL short for what may be encoded on the NFC chip itself.

---

## 4. Page + Components

### 4.1 Page wrapper

`client/src/pages/p/page.vue`:

```vue
<script setup lang="ts">
import NfcProfilePage from '@/features/public/nfc-profile/nfc-profile.page.vue'
</script>
<template><NfcProfilePage /></template>
```

### 4.2 Feature page

`client/src/features/public/nfc-profile/nfc-profile.page.vue`:

- Reads `nfcId` from `useRoute().params`
- Calls `useGetNfcByNfcId(nfcId)`
- Branches on `isLoading` / `isError` / `data`
- Layout: dark background with violet gradient header (visual coherence with `/login`)

### 4.3 Components (in `client/src/modules/nfc/ui/components/`)

| Component              | Role                                                                            |
| ---------------------- | ------------------------------------------------------------------------------- |
| `nfc-profile-hero.vue` | Avatar (initials from `displayName`), `displayName`, `role`, event name + dates |
| `nfc-bio-section.vue`  | Bio paragraph in a styled card; hidden if `bio` is null/empty                   |
| `nfc-link-card.vue`    | Clickable card per link: icon + label + chevron-right                           |
| `link-icon.vue`        | Maps a `ProfileLinkType` to a `lucide-vue-next` icon                            |
| `nfc-error-state.vue`  | 404 state with explanatory copy                                                 |

### 4.4 Link icon mapping

In `link-icon.vue`:

| `type`      | Icon        |
| ----------- | ----------- |
| `linkedin`  | `Linkedin`  |
| `twitter`   | `Twitter`   |
| `github`    | `Github`    |
| `instagram` | `Instagram` |
| `website`   | `Globe`     |
| `email`     | `Mail`      |
| `custom`    | `Link`      |

### 4.5 Link card behavior

- `linkedin/twitter/github/instagram/website/custom` → render as `<a :href="link.url">`, no `target="_blank"` (NFC scan opens a fresh browser tab anyway, keep navigation in-tab)
- `email` → render as `<a :href="'mailto:' + link.url.replace(/^mailto:/, '')">`
- Label resolution: for `custom`, use `link.label`; for known types, use a hardcoded label like `'LinkedIn'`, `'Twitter'`, etc.

### 4.6 Error states

- **404 from API** (bracelet not active / not found): `<NfcErrorState>` with copy: _"Ce bracelet n'est pas activé. Adressez-vous à l'organisateur de l'événement."_
- **Network error**: same component, generic copy: _"Impossible de joindre le serveur. Réessayez dans un instant."_

---

## 5. Seed Update (for demo)

In `server/src/seed.ts`, in addition to existing seed data, guarantee:

- 1 user `participant1@pulse.demo` (firstName: Marie, lastName: Dubois, role `user`)
- 1 event `upcoming` with `slug='pulse-demo-2026'`
- 1 participant attached to that event:
  - displayName: `Marie Dubois`
  - role: `Product Designer @ Pulse`
  - bio: 1–2 sentences
  - links: 3 entries (`linkedin`, `github`, `custom` with label `Calendly`)
- 1 bracelet with `nfcId='demo-nfc-001'`, status `active`, assigned to that participant

End-to-end demo: `pnpm dev` (back+front) → visit `/p/demo-nfc-001` → see Marie's profile with 3 clickable links.

---

## 6. Tests

### 6.1 Frontend E2E (Playwright)

`client/src/features/public/nfc-profile/nfc-profile.test.e2e.ts`:

- **Happy path**: navigate to `/p/demo-nfc-001`, assert hero shows `Marie Dubois`, bio visible, exactly 3 link cards
- **Click link**: click LinkedIn card, assert URL change to LinkedIn (mock or assert href attribute)
- **Error path**: navigate to `/p/non-existent-nfc-id`, assert error message visible

### 6.2 Frontend unit (Vitest)

- `nfc.adapter.http.test.ts`: mock `HttpClient.get`, assert DTO shape returned, assert 404 → `NfcBraceletNotActiveError`
- `link-icon.vue.test.ts`: assert each `type` renders the right icon component

---

## 7. Definition of Done

- `pnpm seed` (root) runs without error and creates the demo data
- `/p/demo-nfc-001` renders Marie's profile with 3 link cards (manual check)
- `/p/foobar` renders the error state
- `cd client && pnpm lint` passes
- All new E2E tests green
- `cd client && pnpm build` (vue-tsc) passes without type errors
