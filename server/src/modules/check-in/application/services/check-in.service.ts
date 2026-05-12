import { CheckInEntity } from '../../domain/entity/check-in.entity'
import { RecordCheckInUseCase, RecordCheckInInput } from '../use-cases/record-check-in/record-check-in.use-case'
import { GetCheckInsByEventUseCase } from '../use-cases/get-check-ins-by-event/get-check-ins-by-event.use-case'

export class CheckInService {
  constructor(
    private readonly recordCheckInUseCase: RecordCheckInUseCase,
    private readonly getCheckInsByEventUseCase: GetCheckInsByEventUseCase,
  ) {}

  recordCheckIn(input: RecordCheckInInput): Promise<CheckInEntity> {
    return this.recordCheckInUseCase.execute(input)
  }

  getByEventId(eventId: string): Promise<CheckInEntity[]> {
    return this.getCheckInsByEventUseCase.execute(eventId)
  }
}
