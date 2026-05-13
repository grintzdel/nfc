import type { HttpClient } from '@/modules/shared/http/http-client'

import type { SupplyOrderDomainModel } from '../model/supply-order.domain-model'
import type { ISupplyOrderPort } from '../ports/supply-order.port'

export class SupplyOrderHttpAdapter implements ISupplyOrderPort {
  constructor(private readonly httpClient: HttpClient) {}

  async create(
    dto: SupplyOrderDomainModel.CreateSupplyOrderDto
  ): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto> {
    const result = await this.httpClient.post<SupplyOrderDomainModel.SupplyOrderOverviewDto>('/supply-orders', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getAll(): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto[]> {
    const result = await this.httpClient.get<SupplyOrderDomainModel.SupplyOrderOverviewDto[]>('/supply-orders')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getById(id: string): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto> {
    const result = await this.httpClient.get<SupplyOrderDomainModel.SupplyOrderOverviewDto>(`/supply-orders/${id}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async markReceived(id: string): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto> {
    const result = await this.httpClient.post<SupplyOrderDomainModel.SupplyOrderOverviewDto>(
      `/supply-orders/${id}/receive`
    )
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async cancel(id: string): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto> {
    const result = await this.httpClient.post<SupplyOrderDomainModel.SupplyOrderOverviewDto>(
      `/supply-orders/${id}/cancel`
    )
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }
}
