import { EventEntity } from '../../domain/entity/event.entity'
import { EventDomainModel } from '../../domain/model/event.domain-model'
import { CreateEventUseCase } from '../use-cases/create-event/create-event.use-case'
import { GetEventByIdUseCase } from '../use-cases/get-event-by-id/get-event-by-id.use-case'
import { GetMyEventsUseCase } from '../use-cases/get-my-events/get-my-events.use-case'
import { GetAllEventsUseCase } from '../use-cases/get-all-events/get-all-events.use-case'
import { UpdateEventUseCase } from '../use-cases/update-event/update-event.use-case'
import { PublishEventUseCase } from '../use-cases/publish-event/publish-event.use-case'
import { StartEventUseCase } from '../use-cases/start-event/start-event.use-case'
import { CompleteEventUseCase } from '../use-cases/complete-event/complete-event.use-case'
import { CancelEventUseCase } from '../use-cases/cancel-event/cancel-event.use-case'
import { DeleteEventUseCase } from '../use-cases/delete-event/delete-event.use-case'
import { ListPaginatedEventsUseCase, PaginatedEventRow } from '../use-cases/list-paginated-events/list-paginated-events.use-case'
import { GetEventBySlugPublicUseCase, PublicEventOverview } from '../use-cases/get-event-by-slug-public/get-event-by-slug-public.use-case'

export class EventService {
  constructor(
    private readonly createEventUseCase: CreateEventUseCase,
    private readonly getEventByIdUseCase: GetEventByIdUseCase,
    private readonly getMyEventsUseCase: GetMyEventsUseCase,
    private readonly getAllEventsUseCase: GetAllEventsUseCase,
    private readonly updateEventUseCase: UpdateEventUseCase,
    private readonly publishEventUseCase: PublishEventUseCase,
    private readonly startEventUseCase: StartEventUseCase,
    private readonly completeEventUseCase: CompleteEventUseCase,
    private readonly cancelEventUseCase: CancelEventUseCase,
    private readonly deleteEventUseCase: DeleteEventUseCase,
    private listPaginatedEventsUseCase: ListPaginatedEventsUseCase | null,
    private getEventBySlugPublicUC: GetEventBySlugPublicUseCase,
  ) {}

  attachListPaginated(uc: ListPaginatedEventsUseCase): void {
    this.listPaginatedEventsUseCase = uc
  }

  attachGetBySlugPublic(uc: GetEventBySlugPublicUseCase): void {
    this.getEventBySlugPublicUC = uc
  }

  create(dto: EventDomainModel.CreateEventDto): Promise<EventEntity> { return this.createEventUseCase.execute(dto) }
  getById(id: string): Promise<EventEntity> { return this.getEventByIdUseCase.execute(id) }
  getMyEvents(userId: string): Promise<EventEntity[]> { return this.getMyEventsUseCase.execute(userId) }
  getAll(): Promise<EventEntity[]> { return this.getAllEventsUseCase.execute() }
  update(id: string, userId: string, dto: EventDomainModel.UpdateEventDto): Promise<EventEntity> { return this.updateEventUseCase.execute(id, userId, dto) }
  publish(id: string, userId: string): Promise<EventEntity> { return this.publishEventUseCase.execute(id, userId) }
  start(id: string, userId: string): Promise<EventEntity> { return this.startEventUseCase.execute(id, userId) }
  complete(id: string, userId: string): Promise<EventEntity> { return this.completeEventUseCase.execute(id, userId) }
  cancel(id: string, userId: string): Promise<EventEntity> { return this.cancelEventUseCase.execute(id, userId) }
  delete(id: string, userId: string): Promise<void> { return this.deleteEventUseCase.execute(id, userId) }
  listPaginated(params: PaginationParams): Promise<PaginatedResult<PaginatedEventRow>> {
    if (!this.listPaginatedEventsUseCase) throw new Error('ListPaginatedEventsUseCase not initialized')
    return this.listPaginatedEventsUseCase.execute(params)
  }

  async getPublicBySlug(slug: string): Promise<PublicEventOverview> {
    return this.getEventBySlugPublicUC.execute(slug)
  }
}
