import { TeamRole } from '../domain/constants/team-role.constant'
import { TeamMemberEntity, TeamMemberEntityProps } from '../domain/entity/team-member.entity'

let counter = 0

export function createTeamMemberPropsFixture(overrides: Partial<TeamMemberEntityProps> = {}): TeamMemberEntityProps {
  counter++
  const now = new Date()
  return {
    id: `team-member-${counter}`,
    userId: `user-${counter}`,
    eventId: `event-${counter}`,
    role: TeamRole.STAFF,
    invitedAt: now,
    invitedBy: `owner-${counter}`,
    acceptedAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  }
}

export function createTeamMemberFixture(overrides: Partial<TeamMemberEntityProps> = {}): TeamMemberEntity {
  return TeamMemberEntity.fromProps(createTeamMemberPropsFixture(overrides))
}
