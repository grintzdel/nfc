import type { HttpClient } from '@/modules/shared/http/http-client'
import type { IBraceletPort } from '../ports/bracelet.port'
import type { BraceletDomainModel } from '../model/bracelet.domain-model'

export class BraceletHttpAdapter implements IBraceletPort {
  constructor(private readonly httpClient: HttpClient) {}

  async create(dto: BraceletDomainModel.CreateBraceletDto): Promise<BraceletDomainModel.BraceletOverviewDto> {
    const result = await this.httpClient.post<BraceletDomainModel.BraceletOverviewDto>('/bracelets', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getAll(status?: string): Promise<BraceletDomainModel.BraceletOverviewDto[]> {
    const params = status ? `?status=${status}` : ''
    const result = await this.httpClient.get<BraceletDomainModel.BraceletOverviewDto[]>(`/bracelets${params}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getAvailable(eventId: string): Promise<BraceletDomainModel.BraceletOverviewDto[]> {
    const result = await this.httpClient.get<BraceletDomainModel.BraceletOverviewDto[]>(
      `/bracelets/available?eventId=${encodeURIComponent(eventId)}`,
    )
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getById(id: string): Promise<BraceletDomainModel.BraceletOverviewDto> {
    const result = await this.httpClient.get<BraceletDomainModel.BraceletOverviewDto>(`/bracelets/${id}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async assign(id: string, dto: BraceletDomainModel.AssignBraceletDto): Promise<BraceletDomainModel.BraceletOverviewDto> {
    const result = await this.httpClient.patch<BraceletDomainModel.BraceletOverviewDto>(`/bracelets/${id}/assign`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async disable(id: string): Promise<BraceletDomainModel.BraceletOverviewDto> {
    const result = await this.httpClient.patch<BraceletDomainModel.BraceletOverviewDto>(`/bracelets/${id}/disable`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async delete(id: string): Promise<void> {
    const result = await this.httpClient.delete(`/bracelets/${id}`)
    if (result.error) throw new Error(result.error.message)
  }
}
