import { BraceletEntity } from '../../../domain/entity/bracelet.entity'
import { IBraceletRepository } from '../../../domain/repository/bracelet.repository.interface'
import { OrderEntity } from '@modules/order/domain/entity/order.entity'
import { generateId } from '@shared/utils/generate-id'

export class CreateBraceletFromOrderUseCase {
  constructor(private readonly braceletRepository: IBraceletRepository) {}

  async execute(order: OrderEntity): Promise<BraceletEntity[]> {
    const created: BraceletEntity[] = []
    for (const item of order.items) {
      for (let i = 0; i < item.quantity; i++) {
        const entity = BraceletEntity.create({
          nfcId: generateId(),
          userId: order.userId,
          productId: item.productId,
          orderId: order.id,
        })
        const saved = await this.braceletRepository.create(entity)
        created.push(saved)
      }
    }
    return created
  }
}
