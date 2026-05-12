import { ITeamMemberRepository } from '../../domain/repository/team-member.repository.interface'
import { TeamMemberEntity } from '../../domain/entity/team-member.entity'
import { TeamMemberModel, TeamMemberDocument } from '../schema/team-member.schema'

function toEntity(doc: TeamMemberDocument): TeamMemberEntity {
  return TeamMemberEntity.fromProps({
    id: String(doc._id),
    userId: doc.userId,
    eventId: doc.eventId,
    role: doc.role,
    invitedAt: doc.invitedAt,
    invitedBy: doc.invitedBy,
    acceptedAt: doc.acceptedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    deletedAt: doc.deletedAt,
  })
}

export class TeamMemberRepositoryMongooseMongo implements ITeamMemberRepository {
  async create(entity: TeamMemberEntity): Promise<TeamMemberEntity> {
    const { id: _ignored, ...props } = entity.toJSON()
    const doc = await TeamMemberModel.create(props)
    return toEntity(doc)
  }

  async findById(id: string): Promise<Nullable<TeamMemberEntity>> {
    const doc = await TeamMemberModel.findOne({ _id: id, deletedAt: null })
    return doc ? toEntity(doc) : null
  }

  async findByUserAndEvent(userId: string, eventId: string): Promise<Nullable<TeamMemberEntity>> {
    const doc = await TeamMemberModel.findOne({ userId, eventId, deletedAt: null })
    return doc ? toEntity(doc) : null
  }

  async findAllByEventId(eventId: string): Promise<TeamMemberEntity[]> {
    const docs = await TeamMemberModel.find({ eventId, deletedAt: null })
    return docs.map(toEntity)
  }

  async findAllByUserId(userId: string): Promise<TeamMemberEntity[]> {
    const docs = await TeamMemberModel.find({ userId, deletedAt: null })
    return docs.map(toEntity)
  }

  async update(entity: TeamMemberEntity): Promise<TeamMemberEntity> {
    const { userId, eventId, role, invitedAt, invitedBy, acceptedAt, deletedAt } = entity.toJSON()
    const doc = await TeamMemberModel.findByIdAndUpdate(
      entity.id,
      { userId, eventId, role, invitedAt, invitedBy, acceptedAt, deletedAt },
      { new: true },
    )
    if (!doc) throw new Error(`TeamMember ${entity.id} not found in DB during update`)
    return toEntity(doc)
  }

  async softDelete(id: string): Promise<void> {
    await TeamMemberModel.findByIdAndUpdate(id, { deletedAt: new Date() })
  }
}
