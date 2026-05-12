import { ParticipantEntity } from '../../../domain/entity/participant.entity'
import { IParticipantRepository } from '../../../domain/repository/participant.repository.interface'

export class GetParticipantsByEventUseCase {
  constructor(private readonly participantRepository: IParticipantRepository) {}

  async execute(eventId: string): Promise<ParticipantEntity[]> {
    return this.participantRepository.findAllByEventId(eventId)
  }
}
