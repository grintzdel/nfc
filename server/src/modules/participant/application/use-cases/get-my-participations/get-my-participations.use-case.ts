import { ParticipantEntity } from '../../../domain/entity/participant.entity'
import { IParticipantRepository } from '../../../domain/repository/participant.repository.interface'

export class GetMyParticipationsUseCase {
  constructor(private readonly participantRepository: IParticipantRepository) {}

  async execute(userId: string): Promise<ParticipantEntity[]> {
    return this.participantRepository.findAllByUserId(userId)
  }
}
