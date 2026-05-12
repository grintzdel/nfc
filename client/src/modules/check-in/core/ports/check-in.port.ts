import type { CheckInDomainModel } from '../model/check-in.domain-model'

export interface ICheckInPort {
  record(dto: CheckInDomainModel.RecordCheckInDto): Promise<CheckInDomainModel.CheckInOverviewDto>
  getByEvent(eventId: string): Promise<CheckInDomainModel.CheckInOverviewDto[]>
}
