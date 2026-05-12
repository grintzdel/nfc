import { ParticipantEntity, ParticipantEntityProps } from '../domain/entity/participant.entity'

let counter = 0

export function createParticipantPropsFixture(overrides: Partial<ParticipantEntityProps> = {}): ParticipantEntityProps {
  counter++
  const now = new Date()
  return {
    id: `participant-${counter}`,
    userId: `user-${counter}`,
    eventId: `event-${counter}`,
    braceletId: null,
    profile: { displayName: `Participant ${counter}`, role: null, bio: null, links: [] },
    registeredAt: now,
    checkedInAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  }
}

export function createParticipantFixture(overrides: Partial<ParticipantEntityProps> = {}): ParticipantEntity {
  return ParticipantEntity.fromProps(createParticipantPropsFixture(overrides))
}
