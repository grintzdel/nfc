import { IEventRepository } from '../../domain/repository/event.repository.interface'
import { EventEntity } from '../../domain/entity/event.entity'
import { EventStatus } from '../../domain/constants/event-status.constant'
import { EventModel, EventDocument } from '../schema/event.schema'

function toEntity(doc: EventDocument): EventEntity {
  return EventEntity.fromProps({
    id: String(doc._id),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    venueName: doc.venueName,
    venueAddress: doc.venueAddress,
    city: doc.city,
    startsAt: doc.startsAt,
    endsAt: doc.endsAt,
    capacity: doc.capacity,
    staffCount: doc.staffCount,
    status: doc.status,
    ownerId: doc.ownerId,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt,
  })
}

export class EventRepositoryMongooseMongo implements IEventRepository {
  async create(event: EventEntity): Promise<EventEntity> {
    const { id: _ignored, ...props } = event.toJSON()
    const doc = await EventModel.create(props)
    return toEntity(doc)
  }

  async findById(id: string): Promise<Nullable<EventEntity>> {
    const doc = await EventModel.findOne({ _id: id, deletedAt: null })
    return doc ? toEntity(doc) : null
  }

  async findAll(): Promise<EventEntity[]> {
    const docs = await EventModel.find({ deletedAt: null })
    return docs.map(toEntity)
  }

  async findAllByOwner(ownerId: string): Promise<EventEntity[]> {
    const docs = await EventModel.find({ ownerId, deletedAt: null })
    return docs.map(toEntity)
  }

  async findAllByStatusIn(statuses: EventStatus[]): Promise<EventEntity[]> {
    const docs = await EventModel.find({ status: { $in: statuses }, deletedAt: null })
    return docs.map(toEntity)
  }

  async findNextUpcoming(): Promise<Nullable<EventEntity>> {
    const doc = await EventModel.findOne({
      status: EventStatus.UPCOMING,
      startsAt: { $gt: new Date() },
      deletedAt: null,
    }).sort({ startsAt: 1 })
    return doc ? toEntity(doc) : null
  }

  async countByOwner(ownerId: string): Promise<number> {
    return EventModel.countDocuments({ ownerId, deletedAt: null })
  }

  async countByStatusInRange(statuses: EventStatus[], from: Date, to: Date): Promise<number> {
    return EventModel.countDocuments({
      status: { $in: statuses },
      createdAt: { $gte: from, $lt: to },
      deletedAt: null,
    })
  }

  async findPaginated(params: PaginationParams): Promise<PaginatedResult<EventEntity>> {
    const { page, limit, search, status } = params
    const filter: Record<string, unknown> = { deletedAt: null }
    if (status && status !== 'all') filter['status'] = status
    if (search) {
      const regex = new RegExp(search, 'i')
      filter['$or'] = [{ name: regex }, { city: regex }, { venueName: regex }]
    }
    const [docs, total] = await Promise.all([
      EventModel.find(filter).skip((page - 1) * limit).limit(limit).sort({ startsAt: -1 }),
      EventModel.countDocuments(filter),
    ])
    return { items: docs.map(toEntity), total, page, limit, totalPages: Math.ceil(total / limit) }
  }

  async countByStatusNotDeleted(status: EventStatus): Promise<number> {
    return EventModel.countDocuments({ status, deletedAt: null })
  }

  async countCompletedInYear(year: number): Promise<number> {
    const from = new Date(year, 0, 1)
    const to = new Date(year + 1, 0, 1)
    return EventModel.countDocuments({ status: EventStatus.COMPLETED, updatedAt: { $gte: from, $lt: to }, deletedAt: null })
  }

  async countUpcomingInDays(days: number): Promise<number> {
    const now = new Date()
    const future = new Date(now.getTime() + days * 24 * 3600 * 1000)
    return EventModel.countDocuments({
      status: { $in: [EventStatus.UPCOMING, EventStatus.DRAFT] },
      startsAt: { $gte: now, $lte: future },
      deletedAt: null,
    })
  }

  async update(event: EventEntity): Promise<EventEntity> {
    const { name, slug, description, venueName, venueAddress, city, startsAt, endsAt, capacity, staffCount, status, deletedAt } = event.toJSON()
    const doc = await EventModel.findByIdAndUpdate(
      event.id,
      { name, slug, description, venueName, venueAddress, city, startsAt, endsAt, capacity, staffCount, status, deletedAt },
      { new: true },
    )
    if (!doc) throw new Error(`Event ${event.id} not found in DB during update`)
    return toEntity(doc)
  }

  async softDelete(id: string): Promise<void> {
    await EventModel.findByIdAndUpdate(id, { deletedAt: new Date() })
  }
}
