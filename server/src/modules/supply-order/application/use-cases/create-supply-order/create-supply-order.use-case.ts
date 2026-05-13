import { SupplyOrderEntity } from '../../../domain/entity/supply-order.entity'
import { SupplyOrderDomainModel } from '../../../domain/model/supply-order.domain-model'
import { ISupplyOrderRepository } from '../../../domain/repository/supply-order.repository.interface'

export class CreateSupplyOrderUseCase {
  constructor(private readonly supplyOrderRepository: ISupplyOrderRepository) {}

  async execute(dto: SupplyOrderDomainModel.CreateSupplyOrderDto): Promise<SupplyOrderEntity> {
    const entity = SupplyOrderEntity.create(dto)
    return this.supplyOrderRepository.create(entity)
  }
}
