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
