import { OrderStatus } from '../constants/order.constant'
import { OrderEntity } from '../entity/order.entity'

export interface IOrderRepository {
  findAll(): Promise<OrderEntity[]>
  findById(id: string): Promise<Nullable<OrderEntity>>
  findByUserId(userId: string): Promise<OrderEntity[]>
  create(order: OrderEntity): Promise<OrderEntity>
  update(order: OrderEntity): Promise<OrderEntity>
  delete(id: string): Promise<void>
  sumRevenueInRange(from: Date, to: Date, statuses: OrderStatus[]): Promise<number>
}
