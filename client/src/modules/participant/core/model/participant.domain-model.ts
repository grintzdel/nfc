import type { ProfileLinkType } from '../constants/profile-link-type.constant'
import type { BraceletStatus } from '@/modules/bracelet/core/model/bracelet.domain-model'
import type { EventStatus } from '@/modules/event/core/model/event.domain-model'

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
    profile: {
      displayName: string
      role?: string | null
      bio?: string | null
      links?: ProfileLinkDto[]
    }
  }
  export type UpdateParticipantProfileDto = {
    displayName?: string
    role?: string | null
    bio?: string | null
    links?: ProfileLinkDto[]
  }
  export type AttachBraceletDto = { braceletId: string }

  export type BraceletSummaryDto = {
    id: string
    nfcId: string
    status: BraceletStatus
  }
  export type ParticipantWithBraceletDto = ParticipantOverviewDto & {
    bracelet: BraceletSummaryDto | null
  }
  export type PaginatedParticipantsDto = {
    items: ParticipantWithBraceletDto[]
    total: number
    page: number
    limit: number
    totalPages: number
  }

  export type EventSummaryDto = {
    id: string
    name: string
    slug: string
    startsAt: string
    endsAt: string
    venueName: string
    city: string
    status: EventStatus
  }
  export type MyParticipationDto = ParticipantOverviewDto & {
    event: EventSummaryDto | null
  }
  export type PaginatedAllParticipantsDto = {
    items: MyParticipationDto[]
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
