import { IParticipantRepository } from '../../domain/repository/participant.repository.interface'
import { ParticipantEntity } from '../../domain/entity/participant.entity'
import { ParticipantModel, ParticipantDocument } from '../schema/participant.schema'

function toEntity(doc: ParticipantDocument): ParticipantEntity {
  return ParticipantEntity.fromProps({
    id: String(doc._id),
    userId: doc.userId,
    eventId: doc.eventId,
    braceletId: doc.braceletId,
    profile: {
      displayName: doc.profile.displayName,
      role: doc.profile.role,
      bio: doc.profile.bio,
      links: doc.profile.links,
    },
    registeredAt: doc.registeredAt,
    checkedInAt: doc.checkedInAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt,
  })
}

export class ParticipantRepositoryMongooseMongo implements IParticipantRepository {
  async create(entity: ParticipantEntity): Promise<ParticipantEntity> {
    const { id: _ignored, ...props } = entity.toJSON()
    const doc = await ParticipantModel.create(props)
    return toEntity(doc)
  }

  async findById(id: string): Promise<Nullable<ParticipantEntity>> {
    const doc = await ParticipantModel.findOne({ _id: id, deletedAt: null })
    return doc ? toEntity(doc) : null
  }

  async findByUserAndEvent(userId: string, eventId: string): Promise<Nullable<ParticipantEntity>> {
    const doc = await ParticipantModel.findOne({ userId, eventId, deletedAt: null })
    return doc ? toEntity(doc) : null
  }

  async findByBraceletId(braceletId: string): Promise<Nullable<ParticipantEntity>> {
    const doc = await ParticipantModel.findOne({ braceletId, deletedAt: null })
    return doc ? toEntity(doc) : null
  }

  async findAllByEventId(eventId: string): Promise<ParticipantEntity[]> {
    const docs = await ParticipantModel.find({ eventId, deletedAt: null })
    return docs.map(toEntity)
  }

  async findAllByUserId(userId: string): Promise<ParticipantEntity[]> {
    const docs = await ParticipantModel.find({ userId, deletedAt: null })
    return docs.map(toEntity)
  }

  async countInRange(from: Date, to: Date): Promise<number> {
    return ParticipantModel.countDocuments({ createdAt: { $gte: from, $lt: to }, deletedAt: null })
  }

  async countByEventId(eventId: string): Promise<number> {
    return ParticipantModel.countDocuments({ eventId, deletedAt: null })
  }

  async update(entity: ParticipantEntity): Promise<ParticipantEntity> {
    const { userId, eventId, braceletId, profile, registeredAt, checkedInAt, deletedAt } = entity.toJSON()
    const doc = await ParticipantModel.findByIdAndUpdate(
      entity.id,
      { userId, eventId, braceletId, profile, registeredAt, checkedInAt, deletedAt },
      { new: true },
    )
    if (!doc) throw new Error(`Participant ${entity.id} not found in DB during update`)
    return toEntity(doc)
  }

  async softDelete(id: string): Promise<void> {
    await ParticipantModel.findByIdAndUpdate(id, { deletedAt: new Date() })
  }
}
