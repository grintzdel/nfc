import type { HttpClient } from '@/modules/shared/http/http-client'
import type { ICheckInPort } from '../ports/check-in.port'
import type { CheckInDomainModel } from '../model/check-in.domain-model'

export class CheckInHttpAdapter implements ICheckInPort {
  constructor(private readonly httpClient: HttpClient) {}

  async record(dto: CheckInDomainModel.RecordCheckInDto): Promise<CheckInDomainModel.CheckInOverviewDto> {
    const result = await this.httpClient.post<CheckInDomainModel.CheckInOverviewDto>('/check-ins', dto)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }

  async getByEvent(eventId: string): Promise<CheckInDomainModel.CheckInOverviewDto[]> {
    const result = await this.httpClient.get<CheckInDomainModel.CheckInOverviewDto[]>(`/check-ins/event/${eventId}`)
    if (result.error) throw new Error(result.error.message)
    return result.data.data
  }
}
