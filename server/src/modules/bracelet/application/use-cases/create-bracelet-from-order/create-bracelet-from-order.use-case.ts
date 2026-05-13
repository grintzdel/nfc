import { OrderEntity } from '@modules/order/domain/entity/order.entity'
import { generateId } from '@shared/utils/generate-id'

import { BraceletEntity } from '../../../domain/entity/bracelet.entity'
import { IBraceletRepository } from '../../../domain/repository/bracelet.repository.interface'

export class CreateBraceletFromOrderUseCase {
  constructor(private readonly braceletRepository: IBraceletRepository) {}

  async execute(order: OrderEntity): Promise<BraceletEntity[]> {
    const entities = order.items.flatMap((item) =>
      Array.from({ length: item.quantity }, () =>
        BraceletEntity.create({
          nfcId: generateId(),
          userId: order.userId,
          productId: item.productId,
          orderId: order.id,
        })
      )
    )
    return Promise.all(entities.map((entity) => this.braceletRepository.create(entity)))
  }
}
