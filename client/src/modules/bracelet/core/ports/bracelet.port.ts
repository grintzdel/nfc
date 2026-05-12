import type { BraceletDomainModel } from '../model/bracelet.domain-model'

export interface IBraceletPort {
  create(dto: BraceletDomainModel.CreateBraceletDto): Promise<BraceletDomainModel.BraceletOverviewDto>
  getAll(status?: string): Promise<BraceletDomainModel.BraceletOverviewDto[]>
  getAvailable(eventId: string): Promise<BraceletDomainModel.BraceletOverviewDto[]>
  getPaginatedByEvent(params: {
    eventId: string
    page: number
    limit: number
    search?: string
  }): Promise<BraceletDomainModel.PaginatedBraceletsDto>
  getPaginated(params: {
    page: number
    limit: number
    status?: string
    search?: string
  }): Promise<BraceletDomainModel.PaginatedAllBraceletsDto>
  getById(id: string): Promise<BraceletDomainModel.BraceletOverviewDto>
  assign(id: string, dto: BraceletDomainModel.AssignBraceletDto): Promise<BraceletDomainModel.BraceletOverviewDto>
  disable(id: string): Promise<BraceletDomainModel.BraceletOverviewDto>
  delete(id: string): Promise<void>
}
