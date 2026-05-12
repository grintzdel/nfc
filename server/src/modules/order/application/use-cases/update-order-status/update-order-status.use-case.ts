import { IOrderRepository } from '../../../domain/repository/order.repository.interface'
import { OrderEntity } from '../../../domain/entity/order.entity'
import { OrderNotFoundError } from '../../../domain/errors/order.error'
import { OrderStatus } from '../../../domain/constants/order.constant'
import { AppError } from '@shared/errors/app.error'

export type OnOrderConfirmed = (order: OrderEntity) => Promise<void>

export class UpdateOrderStatusUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly onOrderConfirmed?: OnOrderConfirmed,
  ) {}

  async execute(id: string, newStatus: OrderStatus): Promise<OrderEntity> {
    const order = await this.orderRepository.findById(id)
    if (!order) throw new OrderNotFoundError(id)

    const wasPending = order.isPending()

    switch (newStatus) {
      case OrderStatus.CONFIRMED: order.confirm(); break
      case OrderStatus.SHIPPED: order.ship(); break
      case OrderStatus.DELIVERED: order.deliver(); break
      case OrderStatus.CANCELLED: order.cancel(); break
      default: throw new AppError(400, `Invalid status: ${newStatus}`)
    }

    const saved = await this.orderRepository.update(order)

    if (wasPending && newStatus === OrderStatus.CONFIRMED && this.onOrderConfirmed) {
      try {
        await this.onOrderConfirmed(saved)
      } catch (err) {
        console.error('[order→bracelet bridge] failed to create bracelets from order', saved.id, err)
      }
    }

    return saved
  }
}
