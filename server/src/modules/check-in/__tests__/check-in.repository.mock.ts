import { ICheckInRepository } from '../domain/repository/check-in.repository.interface'
import { CheckInEntity } from '../domain/entity/check-in.entity'
import { InteractionType } from '../domain/constants/interaction-type.constant'

export class CheckInRepositoryMock implements ICheckInRepository {
  create_result: CheckInEntity | null = null
  create_calledWith: CheckInEntity | null = null
  findById_result: Nullable<CheckInEntity> = null
  findAllByEventId_result: CheckInEntity[] = []
  findAllByBraceletId_result: CheckInEntity[] = []
  countByInteractionType_result: { type: InteractionType; count: number }[] = []
  countByEventIdAndType_result = 0
  countByEventId_result = 0

  async create(e: CheckInEntity): Promise<CheckInEntity> {
    this.create_calledWith = e
    return this.create_result ?? e
  }

  async findById(_id: string): Promise<Nullable<CheckInEntity>> { return this.findById_result }

  async findAllByEventId(_eventId: string): Promise<CheckInEntity[]> { return this.findAllByEventId_result }

  async findAllByBraceletId(_braceletId: string): Promise<CheckInEntity[]> { return this.findAllByBraceletId_result }

  async countByInteractionType(): Promise<{ type: InteractionType; count: number }[]> {
    return this.countByInteractionType_result
  }

  async countByEventIdAndType(_eventId: string, _type: InteractionType): Promise<number> {
    return this.countByEventIdAndType_result
  }

  async countByEventId(_eventId: string): Promise<number> { return this.countByEventId_result }
}
