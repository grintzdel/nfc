import { IBraceletRepository } from '../../domain/repository/bracelet.repository.interface'
import { BraceletEntity } from '../../domain/entity/bracelet.entity'
import { BraceletStatus } from '../../domain/constants/bracelet-status.constant'
import { BraceletModel, BraceletDocument } from '../schema/bracelet.schema'

function toEntity(doc: BraceletDocument): BraceletEntity {
  return BraceletEntity.fromProps({
    id: String(doc._id),
    nfcId: doc.nfcId,
    status: doc.status,
    userId: doc.userId,
    eventId: doc.eventId,
    productId: doc.productId,
    orderId: doc.orderId,
    activatedAt: doc.activatedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt,
  })
}

export class BraceletRepositoryMongooseMongo implements IBraceletRepository {
  async create(entity: BraceletEntity): Promise<BraceletEntity> {
    const { id: _ignored, ...props } = entity.toJSON()
    const doc = await BraceletModel.create(props)
    return toEntity(doc)
  }

  async findById(id: string): Promise<Nullable<BraceletEntity>> {
    const doc = await BraceletModel.findOne({ _id: id, deletedAt: null })
    return doc ? toEntity(doc) : null
  }

  async findByNfcId(nfcId: string): Promise<Nullable<BraceletEntity>> {
    const doc = await BraceletModel.findOne({ nfcId, deletedAt: null })
    return doc ? toEntity(doc) : null
  }

  async findAllByIds(ids: string[]): Promise<BraceletEntity[]> {
    if (ids.length === 0) return []
    const docs = await BraceletModel.find({ _id: { $in: ids }, deletedAt: null })
    return docs.map(toEntity)
  }

  async findAll(): Promise<BraceletEntity[]> {
    const docs = await BraceletModel.find({ deletedAt: null })
    return docs.map(toEntity)
  }

  async findAllByStatus(status: BraceletStatus): Promise<BraceletEntity[]> {
    const docs = await BraceletModel.find({ status, deletedAt: null })
    return docs.map(toEntity)
  }

  async findAllByEventId(eventId: string): Promise<BraceletEntity[]> {
    const docs = await BraceletModel.find({ eventId, deletedAt: null })
    return docs.map(toEntity)
  }

  async findAllByEventIdAndStatus(eventId: string, status: BraceletStatus): Promise<BraceletEntity[]> {
    const docs = await BraceletModel.find({ eventId, status, deletedAt: null })
    return docs.map(toEntity)
  }

  async findPaginatedByEventId(params: {
    eventId: string
    page: number
    limit: number
    search?: string
  }): Promise<PaginatedResult<BraceletEntity>> {
    const { eventId, page, limit, search } = params
    const filter: Record<string, unknown> = { eventId, deletedAt: null }
    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter['nfcId'] = regex
    }
    const [docs, total] = await Promise.all([
      BraceletModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      BraceletModel.countDocuments(filter),
    ])
    return { items: docs.map(toEntity), total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findPaginated(params: {
    page: number
    limit: number
    status?: BraceletStatus
    search?: string
  }): Promise<PaginatedResult<BraceletEntity>> {
    const { page, limit, status, search } = params
    const filter: Record<string, unknown> = { deletedAt: null }
    if (status) filter['status'] = status
    if (search && search.trim()) {
      const regex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
      filter['nfcId'] = regex
    }
    const [docs, total] = await Promise.all([
      BraceletModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      BraceletModel.countDocuments(filter),
    ])
    return { items: docs.map(toEntity), total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async findAllByUserId(userId: string): Promise<BraceletEntity[]> {
    const docs = await BraceletModel.find({ userId, deletedAt: null })
    return docs.map(toEntity)
  }

  async countByStatus(status: BraceletStatus): Promise<number> {
    return BraceletModel.countDocuments({ status, deletedAt: null })
  }

  async countByEventId(eventId: string): Promise<number> {
    return BraceletModel.countDocuments({ eventId, deletedAt: null })
  }

  async countByEventIdAndStatus(eventId: string, status: BraceletStatus): Promise<number> {
    return BraceletModel.countDocuments({ eventId, status, deletedAt: null })
  }

  async countInRange(from: Date, to: Date): Promise<number> {
    return BraceletModel.countDocuments({ createdAt: { $gte: from, $lt: to }, deletedAt: null })
  }

  async countActivationsByMonthInYear(year: number): Promise<{ month: number; count: number }[]> {
    const start = new Date(year, 0, 1)
    const end = new Date(year + 1, 0, 1)
    const rows = await BraceletModel.aggregate<{ _id: number; count: number }>([
      { $match: { activatedAt: { $gte: start, $lt: end, $ne: null }, deletedAt: null } },
      { $group: { _id: { $month: '$activatedAt' }, count: { $sum: 1 } } },
    ])
    const monthMap = new Map(rows.map((r) => [r._id, r.count]))
    return Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: monthMap.get(i + 1) ?? 0 }))
  }

  async update(entity: BraceletEntity): Promise<BraceletEntity> {
    const { nfcId, status, userId, eventId, productId, orderId, activatedAt, deletedAt } = entity.toJSON()
    const doc = await BraceletModel.findByIdAndUpdate(
      entity.id,
      { nfcId, status, userId, eventId, productId, orderId, activatedAt, deletedAt },
      { new: true },
    )
    if (!doc) throw new Error(`Bracelet ${entity.id} not found in DB during update`)
    return toEntity(doc)
  }

  async softDelete(id: string): Promise<void> {
    await BraceletModel.findByIdAndUpdate(id, { deletedAt: new Date() })
  }
}
