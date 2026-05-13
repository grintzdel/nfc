import { IUserRepository } from '@modules/auth/domain/repository/user.repository.interface'
import { EventNotFoundError } from '@modules/event/domain/errors/event.error'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'
import { AppError } from '@shared/errors/app.error'

import { TeamRole } from '../../../domain/constants/team-role.constant'
import { TeamMemberEntity } from '../../../domain/entity/team-member.entity'
import {
  TeamMemberAlreadyExistsError,
  TeamMemberInvalidRoleError,
  TeamMemberNotAuthorizedError,
} from '../../../domain/errors/team.error'
import { ITeamMemberRepository } from '../../../domain/repository/team-member.repository.interface'

export interface InviteTeamMemberInput {
  inviterUserId: string
  eventId: string
  targetUserId: string
  role: TeamRole
}

export class InviteTeamMemberUseCase {
  constructor(
    private readonly teamMemberRepository: ITeamMemberRepository,
    private readonly eventRepository: IEventRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(input: InviteTeamMemberInput): Promise<TeamMemberEntity> {
    const event = await this.eventRepository.findById(input.eventId)
    if (!event || event.isDeleted()) throw new EventNotFoundError(input.eventId)

    if (event.ownerId !== input.inviterUserId) {
      const inviterMember = await this.teamMemberRepository.findByUserAndEvent(input.inviterUserId, input.eventId)
      const isAcceptedManager =
        inviterMember !== null &&
        !inviterMember.isDeleted() &&
        inviterMember.isAccepted() &&
        inviterMember.role === TeamRole.MANAGER
      if (!isAcceptedManager) {
        throw new TeamMemberNotAuthorizedError('Only event owner or managers can invite')
      }
    }

    if (input.role === TeamRole.OWNER) {
      throw new TeamMemberInvalidRoleError('Cannot invite as OWNER. OWNER is the event creator.')
    }

    const targetUser = await this.userRepository.findById(input.targetUserId)
    if (!targetUser) throw new AppError(404, 'Target user not found')

    const existing = await this.teamMemberRepository.findByUserAndEvent(input.targetUserId, input.eventId)
    if (existing && !existing.isDeleted()) {
      throw new TeamMemberAlreadyExistsError(input.targetUserId, input.eventId)
    }

    const entity = TeamMemberEntity.create({
      userId: input.targetUserId,
      eventId: input.eventId,
      role: input.role,
      invitedBy: input.inviterUserId,
    })

    return this.teamMemberRepository.create(entity)
  }
}
