import { AppError } from '@shared/errors/app.error'

import { ParticipantEntity, ParticipantProfile } from '../../../domain/entity/participant.entity'
import { ParticipantNotFoundError } from '../../../domain/errors/participant.error'
import { IParticipantRepository } from '../../../domain/repository/participant.repository.interface'

export class UpdateParticipantProfileUseCase {
  constructor(private readonly participantRepository: IParticipantRepository) {}

  async execute(
    participantId: string,
    callerUserId: string,
    partial: Partial<ParticipantProfile>
  ): Promise<ParticipantEntity> {
    const participant = await this.participantRepository.findById(participantId)
    if (!participant || participant.isDeleted()) throw new ParticipantNotFoundError(participantId)

    if (participant.userId !== callerUserId) {
      throw new AppError(403, 'Only the participant can update their profile')
    }

    participant.updateProfile(partial)
    return this.participantRepository.update(participant)
  }
}
