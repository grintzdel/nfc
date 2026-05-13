import { SupplyOrderEntity } from '../domain/entity/supply-order.entity'
import { ISupplyOrderRepository } from '../domain/repository/supply-order.repository.interface'

export class SupplyOrderRepositoryMock implements ISupplyOrderRepository {
  create_result: SupplyOrderEntity | null = null
  create_calledWith: SupplyOrderEntity | null = null
  findById_result: Nullable<SupplyOrderEntity> = null
  findById_calledWith: string | null = null
  findAll_result: SupplyOrderEntity[] = []
  findPending_result: Nullable<SupplyOrderEntity> = null
  update_result: SupplyOrderEntity | null = null
  update_calledWith: SupplyOrderEntity | null = null

  async create(e: SupplyOrderEntity): Promise<SupplyOrderEntity> {
    this.create_calledWith = e
    return this.create_result ?? e
  }
  async findById(id: string): Promise<Nullable<SupplyOrderEntity>> {
    this.findById_calledWith = id
    return this.findById_result
  }
  async findAll(): Promise<SupplyOrderEntity[]> {
    return this.findAll_result
  }
  async findPending(): Promise<Nullable<SupplyOrderEntity>> {
    return this.findPending_result
  }
  async update(e: SupplyOrderEntity): Promise<SupplyOrderEntity> {
    this.update_calledWith = e
    return this.update_result ?? e
  }
}
