import { TeamMemberEntity } from '../../../domain/entity/team-member.entity'
import { ITeamMemberRepository } from '../../../domain/repository/team-member.repository.interface'
import { TeamMemberNotFoundError, TeamMemberNotAuthorizedError } from '../../../domain/errors/team.error'

export class AcceptInvitationUseCase {
  constructor(private readonly teamMemberRepository: ITeamMemberRepository) {}

  async execute(teamMemberId: string, callerUserId: string): Promise<TeamMemberEntity> {
    const member = await this.teamMemberRepository.findById(teamMemberId)
    if (!member || member.isDeleted()) throw new TeamMemberNotFoundError(teamMemberId)

    if (member.userId !== callerUserId) {
      throw new TeamMemberNotAuthorizedError('Only the invitee can accept this invitation')
    }

    member.accept()
    return this.teamMemberRepository.update(member)
  }
}
