import { SupplyOrderEntity } from '../../../domain/entity/supply-order.entity'
import { SupplyOrderNotFoundError } from '../../../domain/errors/supply-order.error'
import { ISupplyOrderRepository } from '../../../domain/repository/supply-order.repository.interface'

export class CancelSupplyOrderUseCase {
  constructor(private readonly supplyOrderRepository: ISupplyOrderRepository) {}

  async execute(id: string): Promise<SupplyOrderEntity> {
    const entity = await this.supplyOrderRepository.findById(id)
    if (!entity) throw new SupplyOrderNotFoundError(id)
    entity.cancel()
    return this.supplyOrderRepository.update(entity)
  }
}
