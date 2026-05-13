import type { HttpClient } from '@/modules/shared/http/http-client'

import type { EventDomainModel } from '../model/event.domain-model'
import type { IEventPort } from '../ports/event.port'

export class EventHttpAdapter implements IEventPort {
  constructor(private readonly httpClient: HttpClient) {}

  async create(dto: EventDomainModel.CreateEventDto): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.post<EventDomainModel.EventOverviewDto>('/events', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getMyEvents(): Promise<EventDomainModel.EventOverviewDto[]> {
    const result = await this.httpClient.get<EventDomainModel.EventOverviewDto[]>('/events')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getAll(): Promise<EventDomainModel.EventOverviewDto[]> {
    const result = await this.httpClient.get<EventDomainModel.EventOverviewDto[]>('/events/admin')
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getPaginated(params: {
    page: number
    limit: number
    search?: string
    status?: string
  }): Promise<EventDomainModel.PaginatedEventsDto> {
    const query = new URLSearchParams({ page: String(params.page), limit: String(params.limit) })
    if (params.search) query.set('search', params.search)
    if (params.status) query.set('status', params.status)
    const result = await this.httpClient.get<EventDomainModel.PaginatedEventsDto>(
      `/events/admin/paginated?${query.toString()}`
    )
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getById(id: string): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.get<EventDomainModel.EventOverviewDto>(`/events/${id}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getPublicBySlug(slug: string): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.get<EventDomainModel.EventOverviewDto>(`/events/public/${slug}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async update(id: string, dto: EventDomainModel.UpdateEventDto): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.patch<EventDomainModel.EventOverviewDto>(`/events/${id}`, dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async publish(id: string): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.post<EventDomainModel.EventOverviewDto>(`/events/${id}/publish`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async start(id: string): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.post<EventDomainModel.EventOverviewDto>(`/events/${id}/start`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async complete(id: string): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.post<EventDomainModel.EventOverviewDto>(`/events/${id}/complete`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async cancel(id: string): Promise<EventDomainModel.EventOverviewDto> {
    const result = await this.httpClient.post<EventDomainModel.EventOverviewDto>(`/events/${id}/cancel`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async delete(id: string): Promise<void> {
    const result = await this.httpClient.delete(`/events/${id}`)
    if (result.error) throw new Error(result.error.message)
  }
}
