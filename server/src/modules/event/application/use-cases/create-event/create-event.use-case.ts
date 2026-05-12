import { EventEntity } from '../../../domain/entity/event.entity'
import { IEventRepository } from '../../../domain/repository/event.repository.interface'
import { EventDomainModel } from '../../../domain/model/event.domain-model'

export class CreateEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}
  async execute(dto: EventDomainModel.CreateEventDto): Promise<EventEntity> {
    const event = EventEntity.create(dto)
    return this.eventRepository.create(event)
  }
}
