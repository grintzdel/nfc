import { OrderEntity } from '../entity/order.entity'
import { OrderStatus } from '../constants/order.constant'

export interface IOrderRepository {
  findAll(): Promise<OrderEntity[]>
  findById(id: string): Promise<Nullable<OrderEntity>>
  findByUserId(userId: string): Promise<OrderEntity[]>
  create(order: OrderEntity): Promise<OrderEntity>
  update(order: OrderEntity): Promise<OrderEntity>
  sumRevenueInRange(from: Date, to: Date, statuses: OrderStatus[]): Promise<number>
}
