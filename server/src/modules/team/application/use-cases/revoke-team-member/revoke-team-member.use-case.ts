import { EventNotFoundError } from '@modules/event/domain/errors/event.error'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'

import { TeamMemberNotFoundError, TeamMemberNotAuthorizedError } from '../../../domain/errors/team.error'
import { ITeamMemberRepository } from '../../../domain/repository/team-member.repository.interface'

export class RevokeTeamMemberUseCase {
  constructor(
    private readonly teamMemberRepository: ITeamMemberRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async execute(teamMemberId: string, callerUserId: string): Promise<void> {
    const member = await this.teamMemberRepository.findById(teamMemberId)
    if (!member || member.isDeleted()) throw new TeamMemberNotFoundError(teamMemberId)

    const event = await this.eventRepository.findById(member.eventId)
    if (!event || event.isDeleted()) throw new EventNotFoundError(member.eventId)

    if (event.ownerId !== callerUserId) {
      throw new TeamMemberNotAuthorizedError('Only the event owner can revoke team members')
    }

    await this.teamMemberRepository.softDelete(teamMemberId)
  }
}
