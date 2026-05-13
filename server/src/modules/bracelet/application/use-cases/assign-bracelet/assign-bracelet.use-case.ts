import { BraceletEntity } from '../../../domain/entity/bracelet.entity'
import { BraceletNotFoundError } from '../../../domain/errors/bracelet.error'
import { IBraceletRepository } from '../../../domain/repository/bracelet.repository.interface'

export class AssignBraceletUseCase {
  constructor(private readonly braceletRepository: IBraceletRepository) {}

  async execute(id: string, userId: string, eventId: string): Promise<BraceletEntity> {
    const bracelet = await this.braceletRepository.findById(id)
    if (!bracelet || bracelet.isDeleted()) throw new BraceletNotFoundError(id)
    bracelet.assignTo(userId, eventId)
    return this.braceletRepository.update(bracelet)
  }
}
