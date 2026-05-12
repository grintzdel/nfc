import { SupplyOrderEntity } from '../../../domain/entity/supply-order.entity'
import { ISupplyOrderRepository } from '../../../domain/repository/supply-order.repository.interface'

export class GetPendingSupplyOrderUseCase {
  constructor(private readonly supplyOrderRepository: ISupplyOrderRepository) {}

  async execute(): Promise<Nullable<SupplyOrderEntity>> {
    return this.supplyOrderRepository.findPending()
  }
}
