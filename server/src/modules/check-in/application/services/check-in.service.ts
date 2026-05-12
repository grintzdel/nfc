import { CheckInEntity } from '../../domain/entity/check-in.entity'
import { RecordCheckInUseCase, RecordCheckInInput } from '../use-cases/record-check-in/record-check-in.use-case'
import { GetCheckInsByEventUseCase } from '../use-cases/get-check-ins-by-event/get-check-ins-by-event.use-case'
import { GetPaginatedCheckInsByEventUseCase, CheckInWithParticipant } from '../use-cases/get-paginated-check-ins-by-event/get-paginated-check-ins-by-event.use-case'

export class CheckInService {
  constructor(
    private readonly recordCheckInUseCase: RecordCheckInUseCase,
    private readonly getCheckInsByEventUseCase: GetCheckInsByEventUseCase,
    private readonly getPaginatedByEventUseCase: GetPaginatedCheckInsByEventUseCase,
  ) {}

  recordCheckIn(input: RecordCheckInInput): Promise<CheckInEntity> {
    return this.recordCheckInUseCase.execute(input)
  }

  getByEventId(eventId: string): Promise<CheckInEntity[]> {
    return this.getCheckInsByEventUseCase.execute(eventId)
  }

  getPaginatedByEventId(params: { eventId: string; page: number; limit: number }): Promise<PaginatedResult<CheckInWithParticipant>> {
    return this.getPaginatedByEventUseCase.execute(params)
  }
}
