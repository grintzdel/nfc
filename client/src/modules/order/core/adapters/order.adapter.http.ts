import type { HttpClient } from '@/modules/shared/http/http-client'
import type { IOrderPort } from '../ports/order.port'
import type { OrderDomainModel, OrderStatus } from '../model/order.domain-model'

export class OrderHttpAdapter implements IOrderPort {
  constructor(private readonly httpClient: HttpClient) {}

  async create(dto: OrderDomainModel.CreateOrderDto): Promise<OrderDomainModel.OrderOverviewDto> {
    const result = await this.httpClient.post<OrderDomainModel.OrderOverviewDto>('/orders', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getMyOrders(): Promise<OrderDomainModel.OrderOverviewDto[]> {
    const result = await this.httpClient.get<OrderDomainModel.OrderOverviewDto[]>('/orders')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getById(id: string): Promise<OrderDomainModel.OrderOverviewDto> {
    const result = await this.httpClient.get<OrderDomainModel.OrderOverviewDto>(`/orders/${id}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getAllAdmin(): Promise<OrderDomainModel.OrderOverviewDto[]> {
    const result = await this.httpClient.get<OrderDomainModel.OrderOverviewDto[]>('/orders/admin')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async updateStatus(id: string, status: OrderStatus): Promise<OrderDomainModel.OrderOverviewDto> {
    const result = await this.httpClient.patch<OrderDomainModel.OrderOverviewDto>(`/orders/${id}/status`, { status })
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }
}
