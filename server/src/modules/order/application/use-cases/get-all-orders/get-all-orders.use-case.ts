import { OrderEntity } from '../../../domain/entity/order.entity'
import { IOrderRepository } from '../../../domain/repository/order.repository.interface'

export class GetAllOrdersUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}
  async execute(): Promise<OrderEntity[]> {
    return this.orderRepository.findAll()
  }
}
