import { CheckInEntity } from '../../../domain/entity/check-in.entity'
import { ICheckInRepository } from '../../../domain/repository/check-in.repository.interface'

export class GetCheckInsByEventUseCase {
  constructor(private readonly checkInRepository: ICheckInRepository) {}

  async execute(eventId: string): Promise<CheckInEntity[]> {
    return this.checkInRepository.findAllByEventId(eventId)
  }
}
