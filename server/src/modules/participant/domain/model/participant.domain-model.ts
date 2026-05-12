import type { ParticipantEntityProps, ParticipantProfile, ProfileLink } from '../entity/participant.entity'

export namespace ParticipantDomainModel {
  export type ProfileLinkDto = ProfileLink
  export type ParticipantProfileDto = ParticipantProfile
  export type ParticipantOverviewDto = ParticipantEntityProps
  export type CreateParticipantDto = { userId: string; eventId: string; profile: ParticipantProfile }
  export type UpdateParticipantProfileDto = Partial<ParticipantProfile>
}
