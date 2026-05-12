import { ParticipantEntity } from '../../../domain/entity/participant.entity'
import { IParticipantRepository } from '../../../domain/repository/participant.repository.interface'
import { ParticipantNotFoundError } from '../../../domain/errors/participant.error'
import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { BraceletNotFoundError } from '@modules/bracelet/domain/errors/bracelet.error'
import { AppError } from '@shared/errors/app.error'

export class AttachBraceletUseCase {
  constructor(
    private readonly participantRepository: IParticipantRepository,
    private readonly braceletRepository: IBraceletRepository,
  ) {}

  async execute(participantId: string, braceletId: string): Promise<ParticipantEntity> {
    const participant = await this.participantRepository.findById(participantId)
    if (!participant || participant.isDeleted()) throw new ParticipantNotFoundError(participantId)

    const bracelet = await this.braceletRepository.findById(braceletId)
    if (!bracelet || bracelet.isDeleted()) throw new BraceletNotFoundError(braceletId)

    if (!bracelet.isPreActivated()) {
      throw new AppError(400, 'Bracelet must be in PRE_ACTIVATED state to attach')
    }

    participant.attachBracelet(braceletId)
    return this.participantRepository.update(participant)
  }
}
