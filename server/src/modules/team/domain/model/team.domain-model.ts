import type { TeamRole } from '../constants/team-role.constant'

export namespace TeamDomainModel {
  export interface TeamMemberOverviewDto {
    id: string
    userId: string
    eventId: string
    role: TeamRole
    invitedAt: Date
    invitedBy: string
    acceptedAt: Nullable<Date>
    createdAt: Date
    updatedAt: Date
    deletedAt: Nullable<Date>
  }

  export type InviteTeamMemberDto = {
    inviterUserId: string
    eventId: string
    targetUserId: string
    role: TeamRole
  }

  export type ChangeRoleDto = {
    role: TeamRole
  }
}
