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
}
