import { BraceletEntity } from '../../../domain/entity/bracelet.entity'
import { IBraceletRepository } from '../../../domain/repository/bracelet.repository.interface'
import { BraceletNfcIdAlreadyTakenError } from '../../../domain/errors/bracelet.error'
import { generateId } from '@shared/utils/generate-id'

export interface CreateBraceletInput {
  nfcId?: Nullable<string>
  productId?: Nullable<string>
}

export class CreateBraceletUseCase {
  constructor(private readonly braceletRepository: IBraceletRepository) {}

  async execute(input: CreateBraceletInput): Promise<BraceletEntity> {
    const nfcId = input.nfcId ?? generateId()

    if (input.nfcId) {
      const existing = await this.braceletRepository.findByNfcId(input.nfcId)
      if (existing) throw new BraceletNfcIdAlreadyTakenError(input.nfcId)
    }

    const entity = BraceletEntity.create({
      nfcId,
      productId: input.productId ?? null,
    })
    return this.braceletRepository.create(entity)
  }
}
