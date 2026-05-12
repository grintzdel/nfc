import { SupplyOrderEntity } from '../../../domain/entity/supply-order.entity'
import { ISupplyOrderRepository } from '../../../domain/repository/supply-order.repository.interface'

export class GetAllSupplyOrdersUseCase {
  constructor(private readonly supplyOrderRepository: ISupplyOrderRepository) {}

  async execute(): Promise<SupplyOrderEntity[]> {
    return this.supplyOrderRepository.findAll()
  }
}
