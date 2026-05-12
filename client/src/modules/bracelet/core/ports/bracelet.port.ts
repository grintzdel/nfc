import type { BraceletDomainModel } from '../model/bracelet.domain-model'

export interface IBraceletPort {
  create(dto: BraceletDomainModel.CreateBraceletDto): Promise<BraceletDomainModel.BraceletOverviewDto>
  getAll(status?: string): Promise<BraceletDomainModel.BraceletOverviewDto[]>
  getById(id: string): Promise<BraceletDomainModel.BraceletOverviewDto>
  assign(id: string, dto: BraceletDomainModel.AssignBraceletDto): Promise<BraceletDomainModel.BraceletOverviewDto>
  disable(id: string): Promise<BraceletDomainModel.BraceletOverviewDto>
  delete(id: string): Promise<void>
}
