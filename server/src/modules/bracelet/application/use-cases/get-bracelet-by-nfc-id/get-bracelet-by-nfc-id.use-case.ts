import { BraceletEntity } from '../../../domain/entity/bracelet.entity'
import { IBraceletRepository } from '../../../domain/repository/bracelet.repository.interface'
import { BraceletNotFoundError } from '../../../domain/errors/bracelet.error'

export class GetBraceletByNfcIdUseCase {
  constructor(private readonly braceletRepository: IBraceletRepository) {}

  async execute(nfcId: string): Promise<BraceletEntity> {
    const bracelet = await this.braceletRepository.findByNfcId(nfcId)
    if (!bracelet || bracelet.isDeleted()) throw new BraceletNotFoundError(nfcId)
    return bracelet
  }
}
