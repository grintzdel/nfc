import { ICheckInRepository } from '../../domain/repository/check-in.repository.interface'
import { CheckInEntity } from '../../domain/entity/check-in.entity'
import { InteractionType } from '../../domain/constants/interaction-type.constant'
import { CheckInModel, CheckInDocument } from '../schema/check-in.schema'

function toEntity(doc: CheckInDocument): CheckInEntity {
  return CheckInEntity.fromProps({
    id: String(doc._id),
    braceletId: doc.braceletId,
    eventId: doc.eventId,
    interactionType: doc.interactionType,
    zoneName: doc.zoneName,
    targetBraceletId: doc.targetBraceletId,
    amount: doc.amount,
    metadata: doc.metadata,
    createdAt: doc.createdAt,
  })
}

export class CheckInRepositoryMongooseMongo implements ICheckInRepository {
  async create(entity: CheckInEntity): Promise<CheckInEntity> {
    const { id: _ignored, ...props } = entity.toJSON()
    const doc = await CheckInModel.create(props)
    return toEntity(doc)
  }

  async findById(id: string): Promise<Nullable<CheckInEntity>> {
    const doc = await CheckInModel.findById(id)
    return doc ? toEntity(doc) : null
  }

  async findAllByEventId(eventId: string): Promise<CheckInEntity[]> {
    const docs = await CheckInModel.find({ eventId })
    return docs.map(toEntity)
  }

  async findAllByBraceletId(braceletId: string): Promise<CheckInEntity[]> {
    const docs = await CheckInModel.find({ braceletId })
    return docs.map(toEntity)
  }

  async findOneByBraceletEventType(braceletId: string, eventId: string, type: InteractionType): Promise<Nullable<CheckInEntity>> {
    const doc = await CheckInModel.findOne({ braceletId, eventId, interactionType: type })
    return doc ? toEntity(doc) : null
  }

  async countByInteractionType(): Promise<{ type: InteractionType; count: number }[]> {
    const rows = await CheckInModel.aggregate<{ _id: InteractionType; count: number }>([
      { $group: { _id: '$interactionType', count: { $sum: 1 } } },
    ])
    const typeMap = new Map(rows.map((r) => [r._id, r.count]))
    return Object.values(InteractionType).map((type) => ({
      type,
      count: typeMap.get(type) ?? 0,
    }))
  }

  async countByEventIdAndType(eventId: string, type: InteractionType): Promise<number> {
    return CheckInModel.countDocuments({ eventId, interactionType: type })
  }

  async countByEventId(eventId: string): Promise<number> {
    return CheckInModel.countDocuments({ eventId })
  }

  async findPaginatedByEventId(params: {
    eventId: string
    page: number
    limit: number
  }): Promise<PaginatedResult<CheckInEntity>> {
    const { eventId, page, limit } = params
    const filter = { eventId }
    const [docs, total] = await Promise.all([
      CheckInModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      CheckInModel.countDocuments(filter),
    ])
    return { items: docs.map(toEntity), total, page, limit, totalPages: Math.ceil(total / limit) }
  }
}
