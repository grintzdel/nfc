import { EventNotFoundError, EventNotOwnerError } from '../../../domain/errors/event.error'
import { IEventRepository } from '../../../domain/repository/event.repository.interface'

export class DeleteEventUseCase {
  constructor(private readonly eventRepository: IEventRepository) {}
  async execute(id: string, userId: string): Promise<void> {
    const event = await this.eventRepository.findById(id)
    if (!event || event.isDeleted()) throw new EventNotFoundError(id)
    if (event.ownerId !== userId) throw new EventNotOwnerError()
    await this.eventRepository.softDelete(id)
  }
}
