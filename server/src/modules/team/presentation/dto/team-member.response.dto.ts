import { TeamMemberEntity } from '../../domain/entity/team-member.entity'
import type { TeamRole } from '../../domain/constants/team-role.constant'

export class TeamMemberResponseDto {
  id: string
  userId: string
  eventId: string
  role: TeamRole
  invitedAt: Date
  invitedBy: string
  acceptedAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date

  constructor(t: TeamMemberEntity) {
    this.id = t.id
    this.userId = t.userId
    this.eventId = t.eventId
    this.role = t.role
    this.invitedAt = t.invitedAt
    this.invitedBy = t.invitedBy
    this.acceptedAt = t.acceptedAt
    this.createdAt = t.createdAt
    this.updatedAt = t.updatedAt
  }
}
