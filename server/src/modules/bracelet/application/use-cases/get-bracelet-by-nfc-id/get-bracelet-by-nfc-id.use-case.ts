import { BraceletEntity } from '../../../domain/entity/bracelet.entity'
import { BraceletNotFoundError } from '../../../domain/errors/bracelet.error'
import { IBraceletRepository } from '../../../domain/repository/bracelet.repository.interface'

export class GetBraceletByNfcIdUseCase {
  constructor(private readonly braceletRepository: IBraceletRepository) {}

  async execute(nfcId: string): Promise<BraceletEntity> {
    const bracelet = await this.braceletRepository.findByNfcId(nfcId)
    if (!bracelet || bracelet.isDeleted()) throw new BraceletNotFoundError(nfcId)
    return bracelet
  }
}
