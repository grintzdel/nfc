import { EventEntity } from '../../../domain/entity/event.entity'
import { EventNotFoundError } from '../../../domain/errors/event.error'
import { IEventRepository } from '../../../domain/repository/event.repository.interface'

export class GetEventByIdUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}
  async execute(id: string): Promise<EventEntity> {
    const event = await this.eventRepository.findById(id)
    if (!event || event.isDeleted()) throw new EventNotFoundError(id)
    return event
  }
}
