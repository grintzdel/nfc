import { EventEntity } from '../../../domain/entity/event.entity'
import { IEventRepository } from '../../../domain/repository/event.repository.interface'
import { EventNotFoundError, EventNotOwnerError } from '../../../domain/errors/event.error'
import { EventDomainModel } from '../../../domain/model/event.domain-model'

export class UpdateEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}
  async execute(id: string, userId: string, dto: EventDomainModel.UpdateEventDto): Promise<EventEntity> {
    const event = await this.eventRepository.findById(id)
    if (!event || event.isDeleted()) throw new EventNotFoundError(id)
    if (event.ownerId !== userId) throw new EventNotOwnerError()
    event.update(dto)
    return this.eventRepository.update(event)
  }
}
