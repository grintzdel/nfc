import { BraceletEntity } from '../../../domain/entity/bracelet.entity'
import { IBraceletRepository } from '../../../domain/repository/bracelet.repository.interface'
import { BraceletNotFoundError } from '../../../domain/errors/bracelet.error'

export class DisableBraceletUseCase {
  constructor(private readonly braceletRepository: IBraceletRepository) {}

  async execute(id: string): Promise<BraceletEntity> {
    const bracelet = await this.braceletRepository.findById(id)
    if (!bracelet || bracelet.isDeleted()) throw new BraceletNotFoundError(id)
    bracelet.disable()
    return this.braceletRepository.update(bracelet)
  }
}
