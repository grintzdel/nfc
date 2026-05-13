import { OrderStatus } from '../../../domain/constants/order.constant'
import { OrderCannotBeDeletedError, OrderNotFoundError } from '../../../domain/errors/order.error'
import { IOrderRepository } from '../../../domain/repository/order.repository.interface'

export class DeleteOrderUseCase {
  constructor(private readonly orderRepository: IOrderRepository) {}

  async execute(id: string): Promise<void> {
    const order = await this.orderRepository.findById(id)
    if (!order) throw new OrderNotFoundError(id)
    if (order.status === OrderStatus.DELIVERED) throw new OrderCannotBeDeletedError(id)
    await this.orderRepository.delete(id)
  }
}
