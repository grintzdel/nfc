import type { SupplyOrderDomainModel } from '../model/supply-order.domain-model'

export interface ISupplyOrderPort {
  create(dto: SupplyOrderDomainModel.CreateSupplyOrderDto): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto>
  getAll(): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto[]>
  getById(id: string): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto>
  markReceived(id: string): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto>
  cancel(id: string): Promise<SupplyOrderDomainModel.SupplyOrderOverviewDto>
}
