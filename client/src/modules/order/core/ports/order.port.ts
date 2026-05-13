import type { OrderDomainModel, OrderStatus } from '../model/order.domain-model'

export interface IOrderPort {
  create(dto: OrderDomainModel.CreateOrderDto): Promise<OrderDomainModel.OrderOverviewDto>
  getMyOrders(): Promise<OrderDomainModel.OrderOverviewDto[]>
  getById(id: string): Promise<OrderDomainModel.OrderOverviewDto>
  getAllAdmin(): Promise<OrderDomainModel.OrderOverviewDto[]>
  updateStatus(id: string, status: OrderStatus): Promise<OrderDomainModel.OrderOverviewDto>
  update(id: string, dto: OrderDomainModel.UpdateOrderDto): Promise<OrderDomainModel.OrderOverviewDto>
  delete(id: string): Promise<void>
}
