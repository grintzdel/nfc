import type { ParticipantEntityProps, ParticipantProfile } from '../entity/participant.entity'

export namespace ParticipantDomainModel {
  export type ParticipantOverviewDto = ParticipantEntityProps
  export type CreateParticipantDto = {
    userId: string
    eventId: string
    profile: ParticipantProfile
  }
  export type UpdateParticipantProfileDto = Partial<ParticipantProfile>
}
