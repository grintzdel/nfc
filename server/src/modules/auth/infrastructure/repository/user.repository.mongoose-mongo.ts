import { UserRole } from '../../domain/constants/auth.constant'
import { UserEntity } from '../../domain/entity/user.entity'
import { IUserRepository } from '../../domain/repository/user.repository.interface'
import { UserModel, UserDocument } from '../schema/user.schema'

export class UserRepositoryMongooseMongo implements IUserRepository {
  private toEntity(doc: UserDocument): UserEntity {
    return UserEntity.fromProps({
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      firstName: doc.firstName,
      lastName: doc.lastName,
      role: doc.role as UserRole,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    })
  }

  async findByEmail(email: string): Promise<Nullable<UserEntity>> {
    const doc = await UserModel.findOne({ email, deletedAt: null })
    return doc ? this.toEntity(doc) : null
  }

  async findById(id: string): Promise<Nullable<UserEntity>> {
    const doc = await UserModel.findOne({ _id: id, deletedAt: null })
    return doc ? this.toEntity(doc) : null
  }

  async findAll(): Promise<UserEntity[]> {
    const docs = await UserModel.find({ deletedAt: null }).sort({ createdAt: -1 })
    return docs.map((doc) => this.toEntity(doc))
  }

  async create(user: UserEntity): Promise<UserEntity> {
    const doc = await UserModel.create({
      email: user.email,
      password: user.password,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
    })
    return this.toEntity(doc)
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const json = user.toJSON()
    const doc = await UserModel.findByIdAndUpdate(
      user.id,
      {
        email: json.email,
        password: json.password,
        firstName: json.firstName,
        lastName: json.lastName,
        role: json.role,
        deletedAt: json.deletedAt,
      },
      { new: true }
    )
    return this.toEntity(doc!)
  }
}
