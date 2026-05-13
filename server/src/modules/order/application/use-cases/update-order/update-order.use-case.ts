import { OrderEntity } from '../../../domain/entity/order.entity'
import { OrderNotFoundError } from '../../../domain/errors/order.error'
import { IOrderRepository } from '../../../domain/repository/order.repository.interface'

export interface UpdateOrderInput {
  shippingAddress?: string
}

export class UpdateOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(id: string, input: UpdateOrderInput): Promise<OrderEntity> {
    const order = await this.orderRepository.findById(id)
    if (!order) throw new OrderNotFoundError(id)
    order.update(input)
    return this.orderRepository.update(order)
  }
}
