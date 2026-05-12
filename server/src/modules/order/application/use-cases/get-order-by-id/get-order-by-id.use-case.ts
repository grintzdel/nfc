import { IOrderRepository } from '../../../domain/repository/order.repository.interface'
import { OrderEntity } from '../../../domain/entity/order.entity'
import { OrderNotFoundError } from '../../../domain/errors/order.error'

export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}
  async execute(id: string): Promise<OrderEntity> {
    const order = await this.orderRepository.findById(id)
    if (!order) throw new OrderNotFoundError(id)
    return order
  }
}
