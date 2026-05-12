import { TeamMemberEntity } from '../../../domain/entity/team-member.entity'
import { ITeamMemberRepository } from '../../../domain/repository/team-member.repository.interface'
import { TeamRole } from '../../../domain/constants/team-role.constant'
import { TeamMemberNotFoundError, TeamMemberNotAuthorizedError } from '../../../domain/errors/team.error'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'
import { EventNotFoundError } from '@modules/event/domain/errors/event.error'

export class ChangeRoleUseCase {
  constructor(
    private readonly teamMemberRepository: ITeamMemberRepository,
    private readonly eventRepository: IEventRepository,
  ) {}

  async execute(teamMemberId: string, callerUserId: string, newRole: TeamRole): Promise<TeamMemberEntity> {
    const member = await this.teamMemberRepository.findById(teamMemberId)
    if (!member || member.isDeleted()) throw new TeamMemberNotFoundError(teamMemberId)

    const event = await this.eventRepository.findById(member.eventId)
    if (!event || event.isDeleted()) throw new EventNotFoundError(member.eventId)

    if (event.ownerId !== callerUserId) {
      throw new TeamMemberNotAuthorizedError('Only the event owner can change roles')
    }

    member.changeRole(newRole)
    return this.teamMemberRepository.update(member)
  }
}
