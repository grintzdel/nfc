import type { HttpClient } from '@/modules/shared/http/http-client'
import type { IParticipantPort } from '../ports/participant.port'
import type { ParticipantDomainModel } from '../model/participant.domain-model'

export class ParticipantHttpAdapter implements IParticipantPort {
  constructor(private readonly httpClient: HttpClient) {}

  async register(dto: ParticipantDomainModel.RegisterParticipantDto): Promise<ParticipantDomainModel.ParticipantOverviewDto> {
    const result = await this.httpClient.post<ParticipantDomainModel.ParticipantOverviewDto>('/participants', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getMyParticipations(): Promise<ParticipantDomainModel.ParticipantOverviewDto[]> {
    const result = await this.httpClient.get<ParticipantDomainModel.ParticipantOverviewDto[]>('/participants/me')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getByEvent(eventId: string): Promise<ParticipantDomainModel.ParticipantOverviewDto[]> {
    const result = await this.httpClient.get<ParticipantDomainModel.ParticipantOverviewDto[]>(`/participants/event/${eventId}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getPaginatedByEvent(params: {
    eventId: string
    page: number
    limit: number
    search?: string
  }): Promise<ParticipantDomainModel.PaginatedParticipantsDto> {
    const qs = new URLSearchParams({ page: String(params.page), limit: String(params.limit) })
    if (params.search && params.search.trim()) qs.append('search', params.search.trim())
    const result = await this.httpClient.get<ParticipantDomainModel.PaginatedParticipantsDto>(
      `/participants/event/${params.eventId}/paginated?${qs.toString()}`,
    )
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getById(id: string): Promise<ParticipantDomainModel.ParticipantOverviewDto> {
    const result = await this.httpClient.get<ParticipantDomainModel.ParticipantOverviewDto>(`/participants/${id}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async updateProfile(id: string, dto: ParticipantDomainModel.UpdateParticipantProfileDto): Promise<ParticipantDomainModel.ParticipantOverviewDto> {
    const result = await this.httpClient.patch<ParticipantDomainModel.ParticipantOverviewDto>(`/participants/${id}/profile`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async attachBracelet(id: string, dto: ParticipantDomainModel.AttachBraceletDto): Promise<ParticipantDomainModel.ParticipantOverviewDto> {
    const result = await this.httpClient.patch<ParticipantDomainModel.ParticipantOverviewDto>(`/participants/${id}/bracelet`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async unregister(id: string): Promise<void> {
    const result = await this.httpClient.delete(`/participants/${id}`)
    if (result.error) throw new Error(result.error.message)
  }
}
