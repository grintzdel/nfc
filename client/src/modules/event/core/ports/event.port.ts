import type { EventDomainModel } from '../model/event.domain-model'

export interface IEventPort {
  create(dto: EventDomainModel.CreateEventDto): Promise<EventDomainModel.EventOverviewDto>
  getMyEvents(): Promise<EventDomainModel.EventOverviewDto[]>
  getAll(): Promise<EventDomainModel.EventOverviewDto[]>
  getPaginated(params: { page: number; limit: number; search?: string; status?: string }): Promise<EventDomainModel.PaginatedEventsDto>
  getById(id: string): Promise<EventDomainModel.EventOverviewDto>
  update(id: string, dto: EventDomainModel.UpdateEventDto): Promise<EventDomainModel.EventOverviewDto>
  publish(id: string): Promise<EventDomainModel.EventOverviewDto>
  start(id: string): Promise<EventDomainModel.EventOverviewDto>
  complete(id: string): Promise<EventDomainModel.EventOverviewDto>
  cancel(id: string): Promise<EventDomainModel.EventOverviewDto>
  delete(id: string): Promise<void>
}
