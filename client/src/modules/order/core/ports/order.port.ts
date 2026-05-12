import type { OrderDomainModel } from '../model/order.domain-model'

export interface IOrderPort {
  create(dto: OrderDomainModel.CreateOrderDto): Promise<OrderDomainModel.OrderOverviewDto>
  getMyOrders(): Promise<OrderDomainModel.OrderOverviewDto[]>
  getById(id: string): Promise<OrderDomainModel.OrderOverviewDto>
}
