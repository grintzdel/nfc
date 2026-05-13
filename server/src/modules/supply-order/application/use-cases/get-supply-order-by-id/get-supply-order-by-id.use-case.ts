import { SupplyOrderEntity } from '../../../domain/entity/supply-order.entity'
import { SupplyOrderNotFoundError } from '../../../domain/errors/supply-order.error'
import { ISupplyOrderRepository } from '../../../domain/repository/supply-order.repository.interface'

export class GetSupplyOrderByIdUseCase {
  constructor(private readonly supplyOrderRepository: ISupplyOrderRepository) {}

  async execute(id: string): Promise<SupplyOrderEntity> {
    const entity = await this.supplyOrderRepository.findById(id)
    if (!entity) throw new SupplyOrderNotFoundError(id)
    return entity
  }
}
