import { ParticipantEntity } from '../../../domain/entity/participant.entity'
import { IParticipantRepository } from '../../../domain/repository/participant.repository.interface'
import { ParticipantNotFoundError } from '../../../domain/errors/participant.error'

export class GetParticipantByIdUseCase {
  constructor(private readonly participantRepository: IParticipantRepository) {}

  async execute(id: string): Promise<ParticipantEntity> {
    const participant = await this.participantRepository.findById(id)
    if (!participant || participant.isDeleted()) throw new ParticipantNotFoundError(id)
    return participant
  }
}
