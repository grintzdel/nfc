import { IOrderRepository } from '../../../domain/repository/order.repository.interface'
import { OrderEntity } from '../../../domain/entity/order.entity'

export class GetMyOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}
  async execute(userId: string): Promise<OrderEntity[]> { return this.orderRepository.findByUserId(userId) }
}
