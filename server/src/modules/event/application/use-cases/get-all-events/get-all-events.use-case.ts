import { EventEntity } from '../../../domain/entity/event.entity'
import { IEventRepository } from '../../../domain/repository/event.repository.interface'

export class GetAllEventsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}
  async execute(): Promise<EventEntity[]> {
    return this.eventRepository.findAll()
  }
}
