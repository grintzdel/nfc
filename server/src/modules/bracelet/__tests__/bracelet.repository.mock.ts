import { IBraceletRepository } from '../domain/repository/bracelet.repository.interface'
import { BraceletEntity } from '../domain/entity/bracelet.entity'
import { BraceletStatus } from '../domain/constants/bracelet-status.constant'

export class BraceletRepositoryMock implements IBraceletRepository {
  create_result: BraceletEntity | null = null
  create_calledWith: BraceletEntity | null = null
  findById_result: Nullable<BraceletEntity> = null
  findById_calledWith: string | null = null
  findByNfcId_result: Nullable<BraceletEntity> = null
  findByNfcId_calledWith: string | null = null
  findAll_result: BraceletEntity[] = []
  findAllByStatus_result: BraceletEntity[] = []
  findAllByEventId_result: BraceletEntity[] = []
  findAllByUserId_result: BraceletEntity[] = []
  countByStatus_result = 0
  countByEventId_result = 0
  countByEventIdAndStatus_result = 0
  countInRange_result = 0
  countActivationsByMonthInYear_result: { month: number; count: number }[] = []
  update_result: BraceletEntity | null = null
  update_calledWith: BraceletEntity | null = null
  softDelete_calledWith: string | null = null

  // Track all create calls for multi-create tests
  create_calls: BraceletEntity[] = []

  async create(entity: BraceletEntity): Promise<BraceletEntity> {
    this.create_calledWith = entity
    this.create_calls.push(entity)
    return this.create_result ?? entity
  }

  async findById(id: string): Promise<Nullable<BraceletEntity>> {
    this.findById_calledWith = id
    return this.findById_result
  }

  async findByNfcId(nfcId: string): Promise<Nullable<BraceletEntity>> {
    this.findByNfcId_calledWith = nfcId
    return this.findByNfcId_result
  }

  async findAll(): Promise<BraceletEntity[]> { return this.findAll_result }

  async findAllByStatus(_status: BraceletStatus): Promise<BraceletEntity[]> { return this.findAllByStatus_result }

  async findAllByEventId(_eventId: string): Promise<BraceletEntity[]> { return this.findAllByEventId_result }

  async findAllByUserId(_userId: string): Promise<BraceletEntity[]> { return this.findAllByUserId_result }

  async countByStatus(_status: BraceletStatus): Promise<number> { return this.countByStatus_result }

  async countByEventId(_eventId: string): Promise<number> { return this.countByEventId_result }

  async countByEventIdAndStatus(_eventId: string, _status: BraceletStatus): Promise<number> {
    return this.countByEventIdAndStatus_result
  }

  async countInRange(_from: Date, _to: Date): Promise<number> { return this.countInRange_result }

  async countActivationsByMonthInYear(_year: number): Promise<{ month: number; count: number }[]> {
    return this.countActivationsByMonthInYear_result
  }

  async update(entity: BraceletEntity): Promise<BraceletEntity> {
    this.update_calledWith = entity
    return this.update_result ?? entity
  }

  async softDelete(id: string): Promise<void> { this.softDelete_calledWith = id }
}
