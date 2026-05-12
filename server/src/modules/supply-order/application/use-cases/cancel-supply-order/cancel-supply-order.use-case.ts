import { SupplyOrderEntity } from '../../../domain/entity/supply-order.entity'
import { ISupplyOrderRepository } from '../../../domain/repository/supply-order.repository.interface'
import { SupplyOrderNotFoundError } from '../../../domain/errors/supply-order.error'

export class CancelSupplyOrderUseCase {
  constructor(private readonly supplyOrderRepository: ISupplyOrderRepository) {}

  async execute(id: string): Promise<SupplyOrderEntity> {
    const entity = await this.supplyOrderRepository.findById(id)
    if (!entity) throw new SupplyOrderNotFoundError(id)
    entity.cancel()
    return this.supplyOrderRepository.update(entity)
  }
}
