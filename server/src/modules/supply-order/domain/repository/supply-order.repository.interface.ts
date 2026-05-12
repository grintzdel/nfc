import { SupplyOrderEntity } from '../entity/supply-order.entity'

export interface ISupplyOrderRepository {
  create(entity: SupplyOrderEntity): Promise<SupplyOrderEntity>
  findById(id: string): Promise<Nullable<SupplyOrderEntity>>
  findAll(): Promise<SupplyOrderEntity[]>
  findPending(): Promise<Nullable<SupplyOrderEntity>>
  update(entity: SupplyOrderEntity): Promise<SupplyOrderEntity>
}
