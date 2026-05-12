# Frontend SaaS Core Modules — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create 7 frontend core modules (event, bracelet, participant, check-in, team, supply-order, analytics) with domain models, ports, HTTP adapters, and TanStack Query hooks — NO UI/pages.

**Architecture:** Port/Adapter pattern mirroring the existing `product` module. Each module gets `core/model/`, `core/ports/`, `core/adapters/`, `ui/hooks/queries/{query,mutation}/`. All ports wired into `dependencies.ts` via manual DI.

**Tech Stack:** Vue 3, TypeScript, TanStack Vue Query 5.x, shared HttpClient singleton

**Reference pattern:** `client/src/modules/product/` (domain-model → port → adapter.http → hooks)

---

## File Map

### New files per module

Each of the 7 modules creates 3 core files + N hook files:

| Module | core/model | core/ports | core/adapters | hooks (query) | hooks (mutation) |
|--------|-----------|-----------|--------------|---------------|-----------------|
| event | `event.domain-model.ts` | `event.port.ts` | `event.adapter.http.ts` | `use-get-my-events.ts`, `use-get-all-events.ts`, `use-get-event-by-id.ts` | `use-create-event.ts`, `use-update-event.ts`, `use-publish-event.ts`, `use-start-event.ts`, `use-complete-event.ts`, `use-cancel-event.ts`, `use-delete-event.ts` |
| bracelet | `bracelet.domain-model.ts` | `bracelet.port.ts` | `bracelet.adapter.http.ts` | `use-get-all-bracelets.ts`, `use-get-bracelet-by-id.ts` | `use-create-bracelet.ts`, `use-assign-bracelet.ts`, `use-disable-bracelet.ts`, `use-delete-bracelet.ts` |
| participant | `participant.domain-model.ts` | `participant.port.ts` | `participant.adapter.http.ts` | `use-get-my-participations.ts`, `use-get-participants-by-event.ts`, `use-get-participant-by-id.ts` | `use-register-participant.ts`, `use-update-participant-profile.ts`, `use-attach-bracelet.ts`, `use-unregister-participant.ts` |
| check-in | `check-in.domain-model.ts` | `check-in.port.ts` | `check-in.adapter.http.ts` | `use-get-check-ins-by-event.ts` | `use-record-check-in.ts` |
| team | `team.domain-model.ts` | `team.port.ts` | `team.adapter.http.ts` | `use-get-team-by-event.ts`, `use-get-my-memberships.ts` | `use-invite-team-member.ts`, `use-accept-invitation.ts`, `use-change-role.ts`, `use-revoke-team-member.ts` |
| supply-order | `supply-order.domain-model.ts` | `supply-order.port.ts` | `supply-order.adapter.http.ts` | `use-get-all-supply-orders.ts`, `use-get-supply-order-by-id.ts` | `use-create-supply-order.ts`, `use-mark-supply-order-received.ts`, `use-cancel-supply-order.ts` |
| analytics | `analytics.domain-model.ts` | `analytics.port.ts` | `analytics.adapter.http.ts` | `use-get-active-events.ts`, `use-get-next-event.ts`, `use-get-participants-count.ts`, `use-get-bracelets-count.ts`, `use-get-stock.ts`, `use-get-activations.ts`, `use-get-revenue.ts`, `use-get-interactions.ts` | (none) |

### Modified files

- `client/src/modules/app/core/dependencies.ts` — add 7 new ports + adapters

**Total: ~60 new files + 1 modified file**

---

## Task 1: Event Module — Core + Hooks

**Files:**
- Create: `client/src/modules/event/core/model/event.domain-model.ts`
- Create: `client/src/modules/event/core/ports/event.port.ts`
- Create: `client/src/modules/event/core/adapters/event.adapter.http.ts`
- Create: `client/src/modules/event/ui/hooks/queries/query/use-get-my-events.ts`
- Create: `client/src/modules/event/ui/hooks/queries/query/use-get-all-events.ts`
- Create: `client/src/modules/event/ui/hooks/queries/query/use-get-event-by-id.ts`
- Create: `client/src/modules/event/ui/hooks/queries/mutation/use-create-event.ts`
- Create: `client/src/modules/event/ui/hooks/queries/mutation/use-update-event.ts`
- Create: `client/src/modules/event/ui/hooks/queries/mutation/use-publish-event.ts`
- Create: `client/src/modules/event/ui/hooks/queries/mutation/use-start-event.ts`
- Create: `client/src/modules/event/ui/hooks/queries/mutation/use-complete-event.ts`
- Create: `client/src/modules/event/ui/hooks/queries/mutation/use-cancel-event.ts`
- Create: `client/src/modules/event/ui/hooks/queries/mutation/use-delete-event.ts`

- [ ] **Step 1: Create domain model**

```typescript
// client/src/modules/event/core/model/event.domain-model.ts

export const EventStatus = {
  DRAFT: 'draft',
  UPCOMING: 'upcoming',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type EventStatus = (typeof EventStatus)[keyof typeof EventStatus]

export namespace EventDomainModel {
  export type EventOverviewDto = {
    id: string
    name: string
    slug: string
    description: string
    venueName: string
    venueAddress: string
    startsAt: string
    endsAt: string
    capacity: number
    status: EventStatus
    ownerId: string
    createdAt: string
    updatedAt: string
  }

  export type CreateEventDto = {
    name: string
    slug: string
    description: string
    venueName: string
    venueAddress: string
    startsAt: string
    endsAt: string
    capacity: number
  }

  export type UpdateEventDto = Partial<CreateEventDto>
}
```

- [ ] **Step 2: Create port interface**

```typescript
// client/src/modules/event/core/ports/event.port.ts

import type { EventDomainModel } from '../model/event.domain-model'

export interface IEventPort {
  create(dto: EventDomainModel.CreateEventDto): Promise<EventDomainModel.EventOverviewDto>
  getMyEvents(): Promise<EventDomainModel.EventOverviewDto[]>
  getAll(): Promise<EventDomainModel.EventOverviewDto[]>
  getById(id: string): Promise<EventDomainModel.EventOverviewDto>
  update(id: string, dto: EventDomainModel.UpdateEventDto): Promise<EventDomainModel.EventOverviewDto>
  publish(id: string): Promise<EventDomainModel.EventOverviewDto>
  start(id: string): Promise<EventDomainModel.EventOverviewDto>
  complete(id: string): Promise<EventDomainModel.EventOverviewDto>
  cancel(id: string): Promise<EventDomainModel.EventOverviewDto>
  delete(id: string): Promise<void>
}
```

- [ ] **Step 3: Create HTTP adapter**

```typescript
// client/src/modules/event/core/adapters/event.adapter.http.ts

import type { HttpClient } from '@/modules/shared/http/http-client'
import type { IEventPort } from '../ports/event.port'
import type { EventDomainModel } from '../model/event.domain-model'

export class EventHttpAdapter implements IEventPort {
  constructor(private readonly httpClient: HttpClient) {}

  async create(dto: EventDomainModel.CreateEventDto): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.post<EventDomainModel.EventOverviewDto>('/events', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getMyEvents(): Promise<EventDomainModel.EventOverviewDto[]> {
    const result = await this.httpClient.get<EventDomainModel.EventOverviewDto[]>('/events')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getAll(): Promise<EventDomainModel.EventOverviewDto[]> {
    const result = await this.httpClient.get<EventDomainModel.EventOverviewDto[]>('/events/admin')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getById(id: string): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.get<EventDomainModel.EventOverviewDto>(`/events/${id}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async update(id: string, dto: EventDomainModel.UpdateEventDto): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.patch<EventDomainModel.EventOverviewDto>(`/events/${id}`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async publish(id: string): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.post<EventDomainModel.EventOverviewDto>(`/events/${id}/publish`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async start(id: string): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.post<EventDomainModel.EventOverviewDto>(`/events/${id}/start`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async complete(id: string): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.post<EventDomainModel.EventOverviewDto>(`/events/${id}/complete`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async cancel(id: string): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.post<EventDomainModel.EventOverviewDto>(`/events/${id}/cancel`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async delete(id: string): Promise<void> {
    const result = await this.httpClient.delete(`/events/${id}`)
    if (result.error) throw new Error(result.error.message)
  }
}
```

- [ ] **Step 4: Create query hooks**

```typescript
// client/src/modules/event/ui/hooks/queries/query/use-get-my-events.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetMyEvents() {
  const { eventPort } = useDependencies()

  return useQuery({
    queryKey: ['events', 'my'],
    queryFn: () => eventPort.getMyEvents(),
  })
}
```

```typescript
// client/src/modules/event/ui/hooks/queries/query/use-get-all-events.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetAllEvents() {
  const { eventPort } = useDependencies()

  return useQuery({
    queryKey: ['events', 'all'],
    queryFn: () => eventPort.getAll(),
  })
}
```

```typescript
// client/src/modules/event/ui/hooks/queries/query/use-get-event-by-id.ts

import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetEventById(id: Ref<string>) {
  const { eventPort } = useDependencies()

  return useQuery({
    queryKey: ['events', id],
    queryFn: () => eventPort.getById(id.value),
    enabled: () => !!id.value,
  })
}
```

- [ ] **Step 5: Create mutation hooks**

```typescript
// client/src/modules/event/ui/hooks/queries/mutation/use-create-event.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'

export function useCreateEvent() {
  const { eventPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createEvent'],
    mutationFn: (dto: EventDomainModel.CreateEventDto) => eventPort.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
```

```typescript
// client/src/modules/event/ui/hooks/queries/mutation/use-update-event.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'

export function useUpdateEvent() {
  const { eventPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateEvent'],
    mutationFn: ({ id, dto }: { id: string; dto: EventDomainModel.UpdateEventDto }) => eventPort.update(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
```

```typescript
// client/src/modules/event/ui/hooks/queries/mutation/use-publish-event.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function usePublishEvent() {
  const { eventPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['publishEvent'],
    mutationFn: (id: string) => eventPort.publish(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
```

```typescript
// client/src/modules/event/ui/hooks/queries/mutation/use-start-event.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useStartEvent() {
  const { eventPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['startEvent'],
    mutationFn: (id: string) => eventPort.start(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
```

```typescript
// client/src/modules/event/ui/hooks/queries/mutation/use-complete-event.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useCompleteEvent() {
  const { eventPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['completeEvent'],
    mutationFn: (id: string) => eventPort.complete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
```

```typescript
// client/src/modules/event/ui/hooks/queries/mutation/use-cancel-event.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useCancelEvent() {
  const { eventPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['cancelEvent'],
    mutationFn: (id: string) => eventPort.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
```

```typescript
// client/src/modules/event/ui/hooks/queries/mutation/use-delete-event.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useDeleteEvent() {
  const { eventPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteEvent'],
    mutationFn: (id: string) => eventPort.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd client && npx vue-tsc --noEmit 2>&1 | head -20`
Expected: No errors related to event module files

- [ ] **Step 7: Commit**

```bash
git add client/src/modules/event/
git commit -m "feat(client): add event core module — domain model, port, HTTP adapter, query+mutation hooks"
```

---

## Task 2: Bracelet Module — Core + Hooks

**Files:**
- Create: `client/src/modules/bracelet/core/model/bracelet.domain-model.ts`
- Create: `client/src/modules/bracelet/core/ports/bracelet.port.ts`
- Create: `client/src/modules/bracelet/core/adapters/bracelet.adapter.http.ts`
- Create: `client/src/modules/bracelet/ui/hooks/queries/query/use-get-all-bracelets.ts`
- Create: `client/src/modules/bracelet/ui/hooks/queries/query/use-get-bracelet-by-id.ts`
- Create: `client/src/modules/bracelet/ui/hooks/queries/mutation/use-create-bracelet.ts`
- Create: `client/src/modules/bracelet/ui/hooks/queries/mutation/use-assign-bracelet.ts`
- Create: `client/src/modules/bracelet/ui/hooks/queries/mutation/use-disable-bracelet.ts`
- Create: `client/src/modules/bracelet/ui/hooks/queries/mutation/use-delete-bracelet.ts`

- [ ] **Step 1: Create domain model**

```typescript
// client/src/modules/bracelet/core/model/bracelet.domain-model.ts

export const BraceletStatus = {
  STOCK: 'stock',
  PRE_ACTIVATED: 'pre_activated',
  ACTIVE: 'active',
  DISABLED: 'disabled',
} as const

export type BraceletStatus = (typeof BraceletStatus)[keyof typeof BraceletStatus]

export namespace BraceletDomainModel {
  export type BraceletOverviewDto = {
    id: string
    nfcId: string
    status: BraceletStatus
    userId: string | null
    eventId: string | null
    productId: string | null
    orderId: string | null
    activatedAt: string | null
    createdAt: string
    updatedAt: string
  }

  export type CreateBraceletDto = {
    nfcId: string
    productId?: string
  }

  export type AssignBraceletDto = {
    userId: string
    eventId: string
  }
}
```

- [ ] **Step 2: Create port interface**

```typescript
// client/src/modules/bracelet/core/ports/bracelet.port.ts

import type { BraceletDomainModel } from '../model/bracelet.domain-model'

export interface IBraceletPort {
  create(dto: BraceletDomainModel.CreateBraceletDto): Promise<BraceletDomainModel.BraceletOverviewDto>
  getAll(status?: string): Promise<BraceletDomainModel.BraceletOverviewDto[]>
  getById(id: string): Promise<BraceletDomainModel.BraceletOverviewDto>
  assign(id: string, dto: BraceletDomainModel.AssignBraceletDto): Promise<BraceletDomainModel.BraceletOverviewDto>
  disable(id: string): Promise<BraceletDomainModel.BraceletOverviewDto>
  delete(id: string): Promise<void>
}
```

- [ ] **Step 3: Create HTTP adapter**

```typescript
// client/src/modules/bracelet/core/adapters/bracelet.adapter.http.ts

import type { HttpClient } from '@/modules/shared/http/http-client'
import type { IBraceletPort } from '../ports/bracelet.port'
import type { BraceletDomainModel } from '../model/bracelet.domain-model'

export class BraceletHttpAdapter implements IBraceletPort {
  constructor(private readonly httpClient: HttpClient) {}

  async create(dto: BraceletDomainModel.CreateBraceletDto): Promise<BraceletDomainModel.BraceletOverviewDto> {
    const result = await this.httpClient.post<BraceletDomainModel.BraceletOverviewDto>('/bracelets', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getAll(status?: string): Promise<BraceletDomainModel.BraceletOverviewDto[]> {
    const params = status ? `?status=${status}` : ''
    const result = await this.httpClient.get<BraceletDomainModel.BraceletOverviewDto[]>(`/bracelets${params}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getById(id: string): Promise<BraceletDomainModel.BraceletOverviewDto> {
    const result = await this.httpClient.get<BraceletDomainModel.BraceletOverviewDto>(`/bracelets/${id}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async assign(id: string, dto: BraceletDomainModel.AssignBraceletDto): Promise<BraceletDomainModel.BraceletOverviewDto> {
    const result = await this.httpClient.patch<BraceletDomainModel.BraceletOverviewDto>(`/bracelets/${id}/assign`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async disable(id: string): Promise<BraceletDomainModel.BraceletOverviewDto> {
    const result = await this.httpClient.patch<BraceletDomainModel.BraceletOverviewDto>(`/bracelets/${id}/disable`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async delete(id: string): Promise<void> {
    const result = await this.httpClient.delete(`/bracelets/${id}`)
    if (result.error) throw new Error(result.error.message)
  }
}
```

- [ ] **Step 4: Create query hooks**

```typescript
// client/src/modules/bracelet/ui/hooks/queries/query/use-get-all-bracelets.ts

import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetAllBracelets(status?: Ref<string | undefined>) {
  const { braceletPort } = useDependencies()

  return useQuery({
    queryKey: ['bracelets', status],
    queryFn: () => braceletPort.getAll(status?.value),
  })
}
```

```typescript
// client/src/modules/bracelet/ui/hooks/queries/query/use-get-bracelet-by-id.ts

import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetBraceletById(id: Ref<string>) {
  const { braceletPort } = useDependencies()

  return useQuery({
    queryKey: ['bracelets', id],
    queryFn: () => braceletPort.getById(id.value),
    enabled: () => !!id.value,
  })
}
```

- [ ] **Step 5: Create mutation hooks**

```typescript
// client/src/modules/bracelet/ui/hooks/queries/mutation/use-create-bracelet.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { BraceletDomainModel } from '@/modules/bracelet/core/model/bracelet.domain-model'

export function useCreateBracelet() {
  const { braceletPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createBracelet'],
    mutationFn: (dto: BraceletDomainModel.CreateBraceletDto) => braceletPort.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bracelets'] })
    },
  })
}
```

```typescript
// client/src/modules/bracelet/ui/hooks/queries/mutation/use-assign-bracelet.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { BraceletDomainModel } from '@/modules/bracelet/core/model/bracelet.domain-model'

export function useAssignBracelet() {
  const { braceletPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['assignBracelet'],
    mutationFn: ({ id, dto }: { id: string; dto: BraceletDomainModel.AssignBraceletDto }) => braceletPort.assign(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bracelets'] })
    },
  })
}
```

```typescript
// client/src/modules/bracelet/ui/hooks/queries/mutation/use-disable-bracelet.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useDisableBracelet() {
  const { braceletPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['disableBracelet'],
    mutationFn: (id: string) => braceletPort.disable(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bracelets'] })
    },
  })
}
```

```typescript
// client/src/modules/bracelet/ui/hooks/queries/mutation/use-delete-bracelet.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useDeleteBracelet() {
  const { braceletPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['deleteBracelet'],
    mutationFn: (id: string) => braceletPort.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bracelets'] })
    },
  })
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd client && npx vue-tsc --noEmit 2>&1 | head -20`

- [ ] **Step 7: Commit**

```bash
git add client/src/modules/bracelet/
git commit -m "feat(client): add bracelet core module — domain model, port, HTTP adapter, query+mutation hooks"
```

---

## Task 3: Participant Module — Core + Hooks

**Files:**
- Create: `client/src/modules/participant/core/model/participant.domain-model.ts`
- Create: `client/src/modules/participant/core/ports/participant.port.ts`
- Create: `client/src/modules/participant/core/adapters/participant.adapter.http.ts`
- Create: `client/src/modules/participant/ui/hooks/queries/query/use-get-my-participations.ts`
- Create: `client/src/modules/participant/ui/hooks/queries/query/use-get-participants-by-event.ts`
- Create: `client/src/modules/participant/ui/hooks/queries/query/use-get-participant-by-id.ts`
- Create: `client/src/modules/participant/ui/hooks/queries/mutation/use-register-participant.ts`
- Create: `client/src/modules/participant/ui/hooks/queries/mutation/use-update-participant-profile.ts`
- Create: `client/src/modules/participant/ui/hooks/queries/mutation/use-attach-bracelet.ts`
- Create: `client/src/modules/participant/ui/hooks/queries/mutation/use-unregister-participant.ts`

- [ ] **Step 1: Create domain model**

```typescript
// client/src/modules/participant/core/model/participant.domain-model.ts

export namespace ParticipantDomainModel {
  export type ParticipantProfileDto = {
    displayName: string
    role: string | null
    linkedinUrl: string | null
    bio: string | null
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
    profile: {
      displayName: string
      role?: string
      linkedinUrl?: string
      bio?: string
    }
  }

  export type UpdateParticipantProfileDto = {
    displayName?: string
    role?: string
    linkedinUrl?: string
    bio?: string
  }

  export type AttachBraceletDto = {
    braceletId: string
  }
}
```

- [ ] **Step 2: Create port interface**

```typescript
// client/src/modules/participant/core/ports/participant.port.ts

import type { ParticipantDomainModel } from '../model/participant.domain-model'

export interface IParticipantPort {
  register(dto: ParticipantDomainModel.RegisterParticipantDto): Promise<ParticipantDomainModel.ParticipantOverviewDto>
  getMyParticipations(): Promise<ParticipantDomainModel.ParticipantOverviewDto[]>
  getByEvent(eventId: string): Promise<ParticipantDomainModel.ParticipantOverviewDto[]>
  getById(id: string): Promise<ParticipantDomainModel.ParticipantOverviewDto>
  updateProfile(id: string, dto: ParticipantDomainModel.UpdateParticipantProfileDto): Promise<ParticipantDomainModel.ParticipantOverviewDto>
  attachBracelet(id: string, dto: ParticipantDomainModel.AttachBraceletDto): Promise<ParticipantDomainModel.ParticipantOverviewDto>
  unregister(id: string): Promise<void>
}
```

- [ ] **Step 3: Create HTTP adapter**

```typescript
// client/src/modules/participant/core/adapters/participant.adapter.http.ts

import type { HttpClient } from '@/modules/shared/http/http-client'
import type { IParticipantPort } from '../ports/participant.port'
import type { ParticipantDomainModel } from '../model/participant.domain-model'

export class ParticipantHttpAdapter implements IParticipantPort {
  constructor(private readonly httpClient: HttpClient) {}

  async register(dto: ParticipantDomainModel.RegisterParticipantDto): Promise<ParticipantDomainModel.ParticipantOverviewDto> {
    const result = await this.httpClient.post<ParticipantDomainModel.ParticipantOverviewDto>('/participants', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getMyParticipations(): Promise<ParticipantDomainModel.ParticipantOverviewDto[]> {
    const result = await this.httpClient.get<ParticipantDomainModel.ParticipantOverviewDto[]>('/participants/me')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getByEvent(eventId: string): Promise<ParticipantDomainModel.ParticipantOverviewDto[]> {
    const result = await this.httpClient.get<ParticipantDomainModel.ParticipantOverviewDto[]>(`/participants/event/${eventId}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getById(id: string): Promise<ParticipantDomainModel.ParticipantOverviewDto> {
    const result = await this.httpClient.get<ParticipantDomainModel.ParticipantOverviewDto>(`/participants/${id}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async updateProfile(id: string, dto: ParticipantDomainModel.UpdateParticipantProfileDto): Promise<ParticipantDomainModel.ParticipantOverviewDto> {
    const result = await this.httpClient.patch<ParticipantDomainModel.ParticipantOverviewDto>(`/participants/${id}/profile`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async attachBracelet(id: string, dto: ParticipantDomainModel.AttachBraceletDto): Promise<ParticipantDomainModel.ParticipantOverviewDto> {
    const result = await this.httpClient.patch<ParticipantDomainModel.ParticipantOverviewDto>(`/participants/${id}/bracelet`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async unregister(id: string): Promise<void> {
    const result = await this.httpClient.delete(`/participants/${id}`)
    if (result.error) throw new Error(result.error.message)
  }
}
```

- [ ] **Step 4: Create query hooks**

```typescript
// client/src/modules/participant/ui/hooks/queries/query/use-get-my-participations.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetMyParticipations() {
  const { participantPort } = useDependencies()

  return useQuery({
    queryKey: ['participants', 'my'],
    queryFn: () => participantPort.getMyParticipations(),
  })
}
```

```typescript
// client/src/modules/participant/ui/hooks/queries/query/use-get-participants-by-event.ts

import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetParticipantsByEvent(eventId: Ref<string>) {
  const { participantPort } = useDependencies()

  return useQuery({
    queryKey: ['participants', 'event', eventId],
    queryFn: () => participantPort.getByEvent(eventId.value),
    enabled: () => !!eventId.value,
  })
}
```

```typescript
// client/src/modules/participant/ui/hooks/queries/query/use-get-participant-by-id.ts

import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetParticipantById(id: Ref<string>) {
  const { participantPort } = useDependencies()

  return useQuery({
    queryKey: ['participants', id],
    queryFn: () => participantPort.getById(id.value),
    enabled: () => !!id.value,
  })
}
```

- [ ] **Step 5: Create mutation hooks**

```typescript
// client/src/modules/participant/ui/hooks/queries/mutation/use-register-participant.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'

export function useRegisterParticipant() {
  const { participantPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['registerParticipant'],
    mutationFn: (dto: ParticipantDomainModel.RegisterParticipantDto) => participantPort.register(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
    },
  })
}
```

```typescript
// client/src/modules/participant/ui/hooks/queries/mutation/use-update-participant-profile.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'

export function useUpdateParticipantProfile() {
  const { participantPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['updateParticipantProfile'],
    mutationFn: ({ id, dto }: { id: string; dto: ParticipantDomainModel.UpdateParticipantProfileDto }) =>
      participantPort.updateProfile(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
    },
  })
}
```

```typescript
// client/src/modules/participant/ui/hooks/queries/mutation/use-attach-bracelet.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { ParticipantDomainModel } from '@/modules/participant/core/model/participant.domain-model'

export function useAttachBracelet() {
  const { participantPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['attachBracelet'],
    mutationFn: ({ id, dto }: { id: string; dto: ParticipantDomainModel.AttachBraceletDto }) =>
      participantPort.attachBracelet(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
      queryClient.invalidateQueries({ queryKey: ['bracelets'] })
    },
  })
}
```

```typescript
// client/src/modules/participant/ui/hooks/queries/mutation/use-unregister-participant.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useUnregisterParticipant() {
  const { participantPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['unregisterParticipant'],
    mutationFn: (id: string) => participantPort.unregister(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['participants'] })
    },
  })
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd client && npx vue-tsc --noEmit 2>&1 | head -20`

- [ ] **Step 7: Commit**

```bash
git add client/src/modules/participant/
git commit -m "feat(client): add participant core module — domain model, port, HTTP adapter, query+mutation hooks"
```

---

## Task 4: Check-In Module — Core + Hooks

**Files:**
- Create: `client/src/modules/check-in/core/model/check-in.domain-model.ts`
- Create: `client/src/modules/check-in/core/ports/check-in.port.ts`
- Create: `client/src/modules/check-in/core/adapters/check-in.adapter.http.ts`
- Create: `client/src/modules/check-in/ui/hooks/queries/query/use-get-check-ins-by-event.ts`
- Create: `client/src/modules/check-in/ui/hooks/queries/mutation/use-record-check-in.ts`

- [ ] **Step 1: Create domain model**

```typescript
// client/src/modules/check-in/core/model/check-in.domain-model.ts

export const InteractionType = {
  CHECK_IN: 'check_in',
  NETWORKING: 'networking',
  VOTE: 'vote',
  CASHLESS: 'cashless',
} as const

export type InteractionType = (typeof InteractionType)[keyof typeof InteractionType]

export namespace CheckInDomainModel {
  export type CheckInOverviewDto = {
    id: string
    braceletId: string
    eventId: string
    interactionType: InteractionType
    zoneName: string | null
    targetBraceletId: string | null
    amount: number | null
    metadata: Record<string, unknown>
    createdAt: string
  }

  export type RecordCheckInDto = {
    nfcId: string
    eventId: string
    interactionType: InteractionType
    zoneName?: string
    targetNfcId?: string
    amount?: number
    metadata?: Record<string, unknown>
  }
}
```

- [ ] **Step 2: Create port interface**

```typescript
// client/src/modules/check-in/core/ports/check-in.port.ts

import type { CheckInDomainModel } from '../model/check-in.domain-model'

export interface ICheckInPort {
  record(dto: CheckInDomainModel.RecordCheckInDto): Promise<CheckInDomainModel.CheckInOverviewDto>
  getByEvent(eventId: string): Promise<CheckInDomainModel.CheckInOverviewDto[]>
}
```

- [ ] **Step 3: Create HTTP adapter**

```typescript
// client/src/modules/check-in/core/adapters/check-in.adapter.http.ts

import type { HttpClient } from '@/modules/shared/http/http-client'
import type { ICheckInPort } from '../ports/check-in.port'
import type { CheckInDomainModel } from '../model/check-in.domain-model'

export class CheckInHttpAdapter implements ICheckInPort {
  constructor(private readonly httpClient: HttpClient) {}

  async record(dto: CheckInDomainModel.RecordCheckInDto): Promise<CheckInDomainModel.CheckInOverviewDto> {
    const result = await this.httpClient.post<CheckInDomainModel.CheckInOverviewDto>('/check-ins', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getByEvent(eventId: string): Promise<CheckInDomainModel.CheckInOverviewDto[]> {
    const result = await this.httpClient.get<CheckInDomainModel.CheckInOverviewDto[]>(`/check-ins/event/${eventId}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }
}
```

- [ ] **Step 4: Create query hook**

```typescript
// client/src/modules/check-in/ui/hooks/queries/query/use-get-check-ins-by-event.ts

import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetCheckInsByEvent(eventId: Ref<string>) {
  const { checkInPort } = useDependencies()

  return useQuery({
    queryKey: ['checkIns', 'event', eventId],
    queryFn: () => checkInPort.getByEvent(eventId.value),
    enabled: () => !!eventId.value,
  })
}
```

- [ ] **Step 5: Create mutation hook**

```typescript
// client/src/modules/check-in/ui/hooks/queries/mutation/use-record-check-in.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { CheckInDomainModel } from '@/modules/check-in/core/model/check-in.domain-model'

export function useRecordCheckIn() {
  const { checkInPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['recordCheckIn'],
    mutationFn: (dto: CheckInDomainModel.RecordCheckInDto) => checkInPort.record(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checkIns'] })
    },
  })
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd client && npx vue-tsc --noEmit 2>&1 | head -20`

- [ ] **Step 7: Commit**

```bash
git add client/src/modules/check-in/
git commit -m "feat(client): add check-in core module — domain model, port, HTTP adapter, query+mutation hooks"
```

---

## Task 5: Team Module — Core + Hooks

**Files:**
- Create: `client/src/modules/team/core/model/team.domain-model.ts`
- Create: `client/src/modules/team/core/ports/team.port.ts`
- Create: `client/src/modules/team/core/adapters/team.adapter.http.ts`
- Create: `client/src/modules/team/ui/hooks/queries/query/use-get-team-by-event.ts`
- Create: `client/src/modules/team/ui/hooks/queries/query/use-get-my-memberships.ts`
- Create: `client/src/modules/team/ui/hooks/queries/mutation/use-invite-team-member.ts`
- Create: `client/src/modules/team/ui/hooks/queries/mutation/use-accept-invitation.ts`
- Create: `client/src/modules/team/ui/hooks/queries/mutation/use-change-role.ts`
- Create: `client/src/modules/team/ui/hooks/queries/mutation/use-revoke-team-member.ts`

- [ ] **Step 1: Create domain model**

```typescript
// client/src/modules/team/core/model/team.domain-model.ts

export const TeamRole = {
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const

export type TeamRole = (typeof TeamRole)[keyof typeof TeamRole]

export namespace TeamDomainModel {
  export type TeamMemberOverviewDto = {
    id: string
    userId: string
    eventId: string
    role: TeamRole
    invitedAt: string
    invitedBy: string
    acceptedAt: string | null
    createdAt: string
    updatedAt: string
  }

  export type InviteTeamMemberDto = {
    userId: string
    role: 'manager' | 'staff'
  }

  export type ChangeRoleDto = {
    role: 'manager' | 'staff'
  }
}
```

- [ ] **Step 2: Create port interface**

```typescript
// client/src/modules/team/core/ports/team.port.ts

import type { TeamDomainModel } from '../model/team.domain-model'

export interface ITeamPort {
  invite(eventId: string, dto: TeamDomainModel.InviteTeamMemberDto): Promise<TeamDomainModel.TeamMemberOverviewDto>
  getByEvent(eventId: string): Promise<TeamDomainModel.TeamMemberOverviewDto[]>
  getMyMemberships(): Promise<TeamDomainModel.TeamMemberOverviewDto[]>
  accept(id: string): Promise<TeamDomainModel.TeamMemberOverviewDto>
  changeRole(id: string, dto: TeamDomainModel.ChangeRoleDto): Promise<TeamDomainModel.TeamMemberOverviewDto>
  revoke(id: string): Promise<void>
}
```

- [ ] **Step 3: Create HTTP adapter**

Note: team routes use nested paths — `POST /teams/events/:eventId/invite`, `GET /teams/events/:eventId`, etc.

```typescript
// client/src/modules/team/core/adapters/team.adapter.http.ts

import type { HttpClient } from '@/modules/shared/http/http-client'
import type { ITeamPort } from '../ports/team.port'
import type { TeamDomainModel } from '../model/team.domain-model'

export class TeamHttpAdapter implements ITeamPort {
  constructor(private readonly httpClient: HttpClient) {}

  async invite(eventId: string, dto: TeamDomainModel.InviteTeamMemberDto): Promise<TeamDomainModel.TeamMemberOverviewDto> {
    const result = await this.httpClient.post<TeamDomainModel.TeamMemberOverviewDto>(`/teams/events/${eventId}/invite`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getByEvent(eventId: string): Promise<TeamDomainModel.TeamMemberOverviewDto[]> {
    const result = await this.httpClient.get<TeamDomainModel.TeamMemberOverviewDto[]>(`/teams/events/${eventId}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getMyMemberships(): Promise<TeamDomainModel.TeamMemberOverviewDto[]> {
    const result = await this.httpClient.get<TeamDomainModel.TeamMemberOverviewDto[]>('/teams/me')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async accept(id: string): Promise<TeamDomainModel.TeamMemberOverviewDto> {
    const result = await this.httpClient.post<TeamDomainModel.TeamMemberOverviewDto>(`/teams/${id}/accept`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async changeRole(id: string, dto: TeamDomainModel.ChangeRoleDto): Promise<TeamDomainModel.TeamMemberOverviewDto> {
    const result = await this.httpClient.patch<TeamDomainModel.TeamMemberOverviewDto>(`/teams/${id}/role`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async revoke(id: string): Promise<void> {
    const result = await this.httpClient.delete(`/teams/${id}`)
    if (result.error) throw new Error(result.error.message)
  }
}
```

- [ ] **Step 4: Create query hooks**

```typescript
// client/src/modules/team/ui/hooks/queries/query/use-get-team-by-event.ts

import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetTeamByEvent(eventId: Ref<string>) {
  const { teamPort } = useDependencies()

  return useQuery({
    queryKey: ['team', 'event', eventId],
    queryFn: () => teamPort.getByEvent(eventId.value),
    enabled: () => !!eventId.value,
  })
}
```

```typescript
// client/src/modules/team/ui/hooks/queries/query/use-get-my-memberships.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetMyMemberships() {
  const { teamPort } = useDependencies()

  return useQuery({
    queryKey: ['team', 'my'],
    queryFn: () => teamPort.getMyMemberships(),
  })
}
```

- [ ] **Step 5: Create mutation hooks**

```typescript
// client/src/modules/team/ui/hooks/queries/mutation/use-invite-team-member.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { TeamDomainModel } from '@/modules/team/core/model/team.domain-model'

export function useInviteTeamMember() {
  const { teamPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['inviteTeamMember'],
    mutationFn: ({ eventId, dto }: { eventId: string; dto: TeamDomainModel.InviteTeamMemberDto }) =>
      teamPort.invite(eventId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}
```

```typescript
// client/src/modules/team/ui/hooks/queries/mutation/use-accept-invitation.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useAcceptInvitation() {
  const { teamPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['acceptInvitation'],
    mutationFn: (id: string) => teamPort.accept(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}
```

```typescript
// client/src/modules/team/ui/hooks/queries/mutation/use-change-role.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { TeamDomainModel } from '@/modules/team/core/model/team.domain-model'

export function useChangeRole() {
  const { teamPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['changeRole'],
    mutationFn: ({ id, dto }: { id: string; dto: TeamDomainModel.ChangeRoleDto }) => teamPort.changeRole(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}
```

```typescript
// client/src/modules/team/ui/hooks/queries/mutation/use-revoke-team-member.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useRevokeTeamMember() {
  const { teamPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['revokeTeamMember'],
    mutationFn: (id: string) => teamPort.revoke(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd client && npx vue-tsc --noEmit 2>&1 | head -20`

- [ ] **Step 7: Commit**

```bash
git add client/src/modules/team/
git commit -m "feat(client): add team core module — domain model, port, HTTP adapter, query+mutation hooks"
```

---

## Task 6: Supply-Order Module — Core + Hooks

**Files:**
- Create: `client/src/modules/supply-order/core/model/supply-order.domain-model.ts`
- Create: `client/src/modules/supply-order/core/ports/supply-order.port.ts`
- Create: `client/src/modules/supply-order/core/adapters/supply-order.adapter.http.ts`
- Create: `client/src/modules/supply-order/ui/hooks/queries/query/use-get-all-supply-orders.ts`
- Create: `client/src/modules/supply-order/ui/hooks/queries/query/use-get-supply-order-by-id.ts`
- Create: `client/src/modules/supply-order/ui/hooks/queries/mutation/use-create-supply-order.ts`
- Create: `client/src/modules/supply-order/ui/hooks/queries/mutation/use-mark-supply-order-received.ts`
- Create: `client/src/modules/supply-order/ui/hooks/queries/mutation/use-cancel-supply-order.ts`

- [ ] **Step 1: Create domain model**

```typescript
// client/src/modules/supply-order/core/model/supply-order.domain-model.ts

export const SupplyOrderStatus = {
  PENDING: 'pending',
  RECEIVED: 'received',
  CANCELLED: 'cancelled',
} as const

export type SupplyOrderStatus = (typeof SupplyOrderStatus)[keyof typeof SupplyOrderStatus]

export namespace SupplyOrderDomainModel {
  export type SupplyOrderOverviewDto = {
    id: string
    units: number
    orderedAt: string
    estimatedDeliveryDate: string
    status: SupplyOrderStatus
    receivedAt: string | null
    createdAt: string
    updatedAt: string
  }

  export type CreateSupplyOrderDto = {
    units: number
    estimatedDeliveryDate: string
  }
}
```

- [ ] **Step 2: Create port interface**

```typescript
// client/src/modules/supply-order/core/ports/supply-order.port.ts

import type { SupplyOrderDomainModel } from '../model/supply-order.domain-model'

export interface ISupplyOrderPort {
  create(dto: SupplyOrderDomainModel.CreateSupplyOrderDto): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto>
  getAll(): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto[]>
  getById(id: string): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto>
  markReceived(id: string): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto>
  cancel(id: string): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto>
}
```

- [ ] **Step 3: Create HTTP adapter**

```typescript
// client/src/modules/supply-order/core/adapters/supply-order.adapter.http.ts

import type { HttpClient } from '@/modules/shared/http/http-client'
import type { ISupplyOrderPort } from '../ports/supply-order.port'
import type { SupplyOrderDomainModel } from '../model/supply-order.domain-model'

export class SupplyOrderHttpAdapter implements ISupplyOrderPort {
  constructor(private readonly httpClient: HttpClient) {}

  async create(dto: SupplyOrderDomainModel.CreateSupplyOrderDto): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto> {
    const result = await this.httpClient.post<SupplyOrderDomainModel.SupplyOrderOverviewDto>('/supply-orders', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getAll(): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto[]> {
    const result = await this.httpClient.get<SupplyOrderDomainModel.SupplyOrderOverviewDto[]>('/supply-orders')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getById(id: string): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto> {
    const result = await this.httpClient.get<SupplyOrderDomainModel.SupplyOrderOverviewDto>(`/supply-orders/${id}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async markReceived(id: string): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto> {
    const result = await this.httpClient.post<SupplyOrderDomainModel.SupplyOrderOverviewDto>(`/supply-orders/${id}/receive`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async cancel(id: string): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto> {
    const result = await this.httpClient.post<SupplyOrderDomainModel.SupplyOrderOverviewDto>(`/supply-orders/${id}/cancel`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }
}
```

- [ ] **Step 4: Create query hooks**

```typescript
// client/src/modules/supply-order/ui/hooks/queries/query/use-get-all-supply-orders.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetAllSupplyOrders() {
  const { supplyOrderPort } = useDependencies()

  return useQuery({
    queryKey: ['supplyOrders'],
    queryFn: () => supplyOrderPort.getAll(),
  })
}
```

```typescript
// client/src/modules/supply-order/ui/hooks/queries/query/use-get-supply-order-by-id.ts

import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetSupplyOrderById(id: Ref<string>) {
  const { supplyOrderPort } = useDependencies()

  return useQuery({
    queryKey: ['supplyOrders', id],
    queryFn: () => supplyOrderPort.getById(id.value),
    enabled: () => !!id.value,
  })
}
```

- [ ] **Step 5: Create mutation hooks**

```typescript
// client/src/modules/supply-order/ui/hooks/queries/mutation/use-create-supply-order.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { SupplyOrderDomainModel } from '@/modules/supply-order/core/model/supply-order.domain-model'

export function useCreateSupplyOrder() {
  const { supplyOrderPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['createSupplyOrder'],
    mutationFn: (dto: SupplyOrderDomainModel.CreateSupplyOrderDto) => supplyOrderPort.create(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplyOrders'] })
    },
  })
}
```

```typescript
// client/src/modules/supply-order/ui/hooks/queries/mutation/use-mark-supply-order-received.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useMarkSupplyOrderReceived() {
  const { supplyOrderPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['markSupplyOrderReceived'],
    mutationFn: (id: string) => supplyOrderPort.markReceived(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplyOrders'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}
```

```typescript
// client/src/modules/supply-order/ui/hooks/queries/mutation/use-cancel-supply-order.ts

import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useCancelSupplyOrder() {
  const { supplyOrderPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['cancelSupplyOrder'],
    mutationFn: (id: string) => supplyOrderPort.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplyOrders'] })
      queryClient.invalidateQueries({ queryKey: ['analytics'] })
    },
  })
}
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `cd client && npx vue-tsc --noEmit 2>&1 | head -20`

- [ ] **Step 7: Commit**

```bash
git add client/src/modules/supply-order/
git commit -m "feat(client): add supply-order core module — domain model, port, HTTP adapter, query+mutation hooks"
```

---

## Task 7: Analytics Module — Core + Hooks

**Files:**
- Create: `client/src/modules/analytics/core/model/analytics.domain-model.ts`
- Create: `client/src/modules/analytics/core/ports/analytics.port.ts`
- Create: `client/src/modules/analytics/core/adapters/analytics.adapter.http.ts`
- Create: `client/src/modules/analytics/ui/hooks/queries/query/use-get-active-events.ts`
- Create: `client/src/modules/analytics/ui/hooks/queries/query/use-get-next-event.ts`
- Create: `client/src/modules/analytics/ui/hooks/queries/query/use-get-participants-count.ts`
- Create: `client/src/modules/analytics/ui/hooks/queries/query/use-get-bracelets-count.ts`
- Create: `client/src/modules/analytics/ui/hooks/queries/query/use-get-stock.ts`
- Create: `client/src/modules/analytics/ui/hooks/queries/query/use-get-activations.ts`
- Create: `client/src/modules/analytics/ui/hooks/queries/query/use-get-revenue.ts`
- Create: `client/src/modules/analytics/ui/hooks/queries/query/use-get-interactions.ts`

- [ ] **Step 1: Create domain model**

```typescript
// client/src/modules/analytics/core/model/analytics.domain-model.ts

import type { EventDomainModel } from '@/modules/event/core/model/event.domain-model'
import type { InteractionType } from '@/modules/check-in/core/model/check-in.domain-model'

export const StockLevel = {
  LOW: 'low',
  MID: 'mid',
  HIGH: 'high',
} as const

export type StockLevel = (typeof StockLevel)[keyof typeof StockLevel]

export namespace AnalyticsDomainModel {
  export type ActiveEventsStatsDto = {
    events: EventDomainModel.EventOverviewDto[]
    count: number
    diffVsLastMonth: number
  }

  export type CountWithRateDto = {
    count: number
    rateVsLastMonth: number | null
  }

  export type RevenueWithRateDto = {
    revenue: number
    rateVsLastMonth: number | null
  }

  export type MonthlyActivationDto = {
    month: number
    monthName: string
    activations: number
  }

  export type ActivationsByYearDto = {
    year: number
    months: MonthlyActivationDto[]
  }

  export type InteractionTypeStatDto = {
    type: InteractionType
    typeLabel: string
    scansCount: number
    sharePercent: number
  }

  export type InteractionsStatsDto = {
    total: number
    types: InteractionTypeStatDto[]
  }

  export type NextEventStatsDto = {
    event: {
      id: string
      name: string
      startsAt: string
      endsAt: string
      daysUntil: number
      braceletsOrdered: number
      braceletsPreActivated: number
      fillRate: number
    } | null
  }

  export type BraceletStockStatsDto = {
    current: number
    maxCapacity: number
    fillPercent: number
    level: StockLevel
    pendingOrder: {
      units: number
      estimatedDeliveryDate: string
    } | null
  }
}
```

- [ ] **Step 2: Create port interface**

```typescript
// client/src/modules/analytics/core/ports/analytics.port.ts

import type { AnalyticsDomainModel } from '../model/analytics.domain-model'

export interface IAnalyticsPort {
  getActiveEvents(): Promise<AnalyticsDomainModel.ActiveEventsStatsDto>
  getNextEvent(): Promise<AnalyticsDomainModel.NextEventStatsDto>
  getParticipantsCount(): Promise<AnalyticsDomainModel.CountWithRateDto>
  getBraceletsCount(): Promise<AnalyticsDomainModel.CountWithRateDto>
  getStock(): Promise<AnalyticsDomainModel.BraceletStockStatsDto>
  getActivations(year?: number): Promise<AnalyticsDomainModel.ActivationsByYearDto>
  getRevenue(): Promise<AnalyticsDomainModel.RevenueWithRateDto>
  getInteractions(): Promise<AnalyticsDomainModel.InteractionsStatsDto>
}
```

- [ ] **Step 3: Create HTTP adapter**

```typescript
// client/src/modules/analytics/core/adapters/analytics.adapter.http.ts

import type { HttpClient } from '@/modules/shared/http/http-client'
import type { IAnalyticsPort } from '../ports/analytics.port'
import type { AnalyticsDomainModel } from '../model/analytics.domain-model'

export class AnalyticsHttpAdapter implements IAnalyticsPort {
  constructor(private readonly httpClient: HttpClient) {}

  async getActiveEvents(): Promise<AnalyticsDomainModel.ActiveEventsStatsDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.ActiveEventsStatsDto>('/analytics/events/active')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getNextEvent(): Promise<AnalyticsDomainModel.NextEventStatsDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.NextEventStatsDto>('/analytics/events/next')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getParticipantsCount(): Promise<AnalyticsDomainModel.CountWithRateDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.CountWithRateDto>('/analytics/participants/count')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getBraceletsCount(): Promise<AnalyticsDomainModel.CountWithRateDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.CountWithRateDto>('/analytics/bracelets/count')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getStock(): Promise<AnalyticsDomainModel.BraceletStockStatsDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.BraceletStockStatsDto>('/analytics/bracelets/stock')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getActivations(year?: number): Promise<AnalyticsDomainModel.ActivationsByYearDto> {
    const params = year ? `?year=${year}` : ''
    const result = await this.httpClient.get<AnalyticsDomainModel.ActivationsByYearDto>(`/analytics/bracelets/activations${params}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getRevenue(): Promise<AnalyticsDomainModel.RevenueWithRateDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.RevenueWithRateDto>('/analytics/revenue')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getInteractions(): Promise<AnalyticsDomainModel.InteractionsStatsDto> {
    const result = await this.httpClient.get<AnalyticsDomainModel.InteractionsStatsDto>('/analytics/interactions')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }
}
```

- [ ] **Step 4: Create query hooks**

```typescript
// client/src/modules/analytics/ui/hooks/queries/query/use-get-active-events.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetActiveEvents() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'activeEvents'],
    queryFn: () => analyticsPort.getActiveEvents(),
  })
}
```

```typescript
// client/src/modules/analytics/ui/hooks/queries/query/use-get-next-event.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetNextEvent() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'nextEvent'],
    queryFn: () => analyticsPort.getNextEvent(),
  })
}
```

```typescript
// client/src/modules/analytics/ui/hooks/queries/query/use-get-participants-count.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetParticipantsCount() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'participantsCount'],
    queryFn: () => analyticsPort.getParticipantsCount(),
  })
}
```

```typescript
// client/src/modules/analytics/ui/hooks/queries/query/use-get-bracelets-count.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetBraceletsCount() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'braceletsCount'],
    queryFn: () => analyticsPort.getBraceletsCount(),
  })
}
```

```typescript
// client/src/modules/analytics/ui/hooks/queries/query/use-get-stock.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetStock() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'stock'],
    queryFn: () => analyticsPort.getStock(),
  })
}
```

```typescript
// client/src/modules/analytics/ui/hooks/queries/query/use-get-activations.ts

import type { Ref } from 'vue'
import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetActivations(year?: Ref<number | undefined>) {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'activations', year],
    queryFn: () => analyticsPort.getActivations(year?.value),
  })
}
```

```typescript
// client/src/modules/analytics/ui/hooks/queries/query/use-get-revenue.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetRevenue() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'revenue'],
    queryFn: () => analyticsPort.getRevenue(),
  })
}
```

```typescript
// client/src/modules/analytics/ui/hooks/queries/query/use-get-interactions.ts

import { useQuery } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'

export function useGetInteractions() {
  const { analyticsPort } = useDependencies()

  return useQuery({
    queryKey: ['analytics', 'interactions'],
    queryFn: () => analyticsPort.getInteractions(),
  })
}
```

- [ ] **Step 5: Verify TypeScript compiles**

Run: `cd client && npx vue-tsc --noEmit 2>&1 | head -20`

- [ ] **Step 6: Commit**

```bash
git add client/src/modules/analytics/
git commit -m "feat(client): add analytics core module — domain model, port, HTTP adapter, 8 query hooks"
```

---

## Task 8: Wire All Ports into dependencies.ts

**Files:**
- Modify: `client/src/modules/app/core/dependencies.ts`

- [ ] **Step 1: Update dependencies.ts**

```typescript
// client/src/modules/app/core/dependencies.ts

import type { IProductPort } from '@/modules/product/core/ports/product.port'
import type { IAuthPort } from '@/modules/auth/core/ports/auth.port'
import type { IEventPort } from '@/modules/event/core/ports/event.port'
import type { IBraceletPort } from '@/modules/bracelet/core/ports/bracelet.port'
import type { IParticipantPort } from '@/modules/participant/core/ports/participant.port'
import type { ICheckInPort } from '@/modules/check-in/core/ports/check-in.port'
import type { ITeamPort } from '@/modules/team/core/ports/team.port'
import type { ISupplyOrderPort } from '@/modules/supply-order/core/ports/supply-order.port'
import type { IAnalyticsPort } from '@/modules/analytics/core/ports/analytics.port'
import { getSharedHttpClient } from '@/modules/shared/http/http-client'
import { ProductHttpAdapter } from '@/modules/product/core/adapters/product.adapter.http'
import { AuthHttpAdapter } from '@/modules/auth/core/adapters/auth.adapter.http'
import { EventHttpAdapter } from '@/modules/event/core/adapters/event.adapter.http'
import { BraceletHttpAdapter } from '@/modules/bracelet/core/adapters/bracelet.adapter.http'
import { ParticipantHttpAdapter } from '@/modules/participant/core/adapters/participant.adapter.http'
import { CheckInHttpAdapter } from '@/modules/check-in/core/adapters/check-in.adapter.http'
import { TeamHttpAdapter } from '@/modules/team/core/adapters/team.adapter.http'
import { SupplyOrderHttpAdapter } from '@/modules/supply-order/core/adapters/supply-order.adapter.http'
import { AnalyticsHttpAdapter } from '@/modules/analytics/core/adapters/analytics.adapter.http'

export type Dependencies = {
  productPort: IProductPort
  authPort: IAuthPort
  eventPort: IEventPort
  braceletPort: IBraceletPort
  participantPort: IParticipantPort
  checkInPort: ICheckInPort
  teamPort: ITeamPort
  supplyOrderPort: ISupplyOrderPort
  analyticsPort: IAnalyticsPort
}

export function createDependencies(): Dependencies {
  const httpClient = getSharedHttpClient()

  const token = localStorage.getItem('token')
  if (token) {
    httpClient.setAuthToken(token)
  }

  return {
    productPort: new ProductHttpAdapter(httpClient),
    authPort: new AuthHttpAdapter(),
    eventPort: new EventHttpAdapter(httpClient),
    braceletPort: new BraceletHttpAdapter(httpClient),
    participantPort: new ParticipantHttpAdapter(httpClient),
    checkInPort: new CheckInHttpAdapter(httpClient),
    teamPort: new TeamHttpAdapter(httpClient),
    supplyOrderPort: new SupplyOrderHttpAdapter(httpClient),
    analyticsPort: new AnalyticsHttpAdapter(httpClient),
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles (full project)**

Run: `cd client && npx vue-tsc --noEmit 2>&1 | head -30`
Expected: No errors. All hooks resolve `useDependencies()` correctly.

- [ ] **Step 3: Verify Vite dev build**

Run: `cd client && npx vite build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add client/src/modules/app/core/dependencies.ts
git commit -m "feat(client): wire 7 SaaS ports into dependencies.ts"
```
