import { SupplyOrderEntity } from '../../../domain/entity/supply-order.entity'
import { ISupplyOrderRepository } from '../../../domain/repository/supply-order.repository.interface'
import { SupplyOrderNotFoundError } from '../../../domain/errors/supply-order.error'

export class MarkSupplyOrderReceivedUseCase {
  constructor(private readonly supplyOrderRepository: ISupplyOrderRepository) {}

  async execute(id: string): Promise<SupplyOrderEntity> {
    const entity = await this.supplyOrderRepository.findById(id)
    if (!entity) throw new SupplyOrderNotFoundError(id)
    entity.markReceived()
    return this.supplyOrderRepository.update(entity)
  }
}
