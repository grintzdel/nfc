import { AppError } from '@shared/errors/app.error'

import { ParticipantNotFoundError } from '../../../domain/errors/participant.error'
import { IParticipantRepository } from '../../../domain/repository/participant.repository.interface'

export class UnregisterParticipantUseCase {
  constructor(private readonly participantRepository: IParticipantRepository) {}

  async execute(participantId: string, callerUserId: string): Promise<void> {
    const participant = await this.participantRepository.findById(participantId)
    if (!participant || participant.isDeleted()) throw new ParticipantNotFoundError(participantId)

    if (participant.userId !== callerUserId) {
      throw new AppError(403, 'Only the participant can unregister')
    }

    return this.participantRepository.softDelete(participantId)
  }
}
