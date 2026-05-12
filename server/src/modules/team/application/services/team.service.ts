import { TeamMemberEntity } from '../../domain/entity/team-member.entity'
import { TeamRole } from '../../domain/constants/team-role.constant'
import { InviteTeamMemberUseCase, InviteTeamMemberInput } from '../use-cases/invite-team-member/invite-team-member.use-case'
import { AcceptInvitationUseCase } from '../use-cases/accept-invitation/accept-invitation.use-case'
import { ChangeRoleUseCase } from '../use-cases/change-role/change-role.use-case'
import { RevokeTeamMemberUseCase } from '../use-cases/revoke-team-member/revoke-team-member.use-case'
import { GetTeamMembersByEventUseCase } from '../use-cases/get-team-members-by-event/get-team-members-by-event.use-case'
import { GetMyMembershipsUseCase } from '../use-cases/get-my-memberships/get-my-memberships.use-case'

export class TeamService {
  constructor(
    private readonly inviteTeamMemberUseCase: InviteTeamMemberUseCase,
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
    private readonly changeRoleUseCase: ChangeRoleUseCase,
    private readonly revokeTeamMemberUseCase: RevokeTeamMemberUseCase,
    private readonly getTeamMembersByEventUseCase: GetTeamMembersByEventUseCase,
    private readonly getMyMembershipsUseCase: GetMyMembershipsUseCase,
  ) {}

  invite(input: InviteTeamMemberInput): Promise<TeamMemberEntity> {
    return this.inviteTeamMemberUseCase.execute(input)
  }

  accept(teamMemberId: string, callerUserId: string): Promise<TeamMemberEntity> {
    return this.acceptInvitationUseCase.execute(teamMemberId, callerUserId)
  }

  changeRole(teamMemberId: string, callerUserId: string, newRole: TeamRole): Promise<TeamMemberEntity> {
    return this.changeRoleUseCase.execute(teamMemberId, callerUserId, newRole)
  }

  revoke(teamMemberId: string, callerUserId: string): Promise<void> {
    return this.revokeTeamMemberUseCase.execute(teamMemberId, callerUserId)
  }

  getByEvent(eventId: string): Promise<TeamMemberEntity[]> {
    return this.getTeamMembersByEventUseCase.execute(eventId)
  }

  getMyMemberships(userId: string): Promise<TeamMemberEntity[]> {
    return this.getMyMembershipsUseCase.execute(userId)
  }
}
