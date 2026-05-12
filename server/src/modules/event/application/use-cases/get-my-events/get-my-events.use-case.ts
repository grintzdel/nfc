import { EventEntity } from '../../../domain/entity/event.entity'
import { IEventRepository } from '../../../domain/repository/event.repository.interface'

export class GetMyEventsUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}
  async execute(userId: string): Promise<EventEntity[]> {
    return this.eventRepository.findAllByOwner(userId)
  }
}
