import { UserEntity } from '../entity/user.entity'

export interface IUserRepository {
  findByEmail(email: string): Promise<Nullable<UserEntity>>
  findById(id: string): Promise<Nullable<UserEntity>>
  findAll(): Promise<UserEntity[]>
  create(user: UserEntity): Promise<UserEntity>
  update(user: UserEntity): Promise<UserEntity>
}
