import { UserEntity } from '@modules/auth/domain/entity/user.entity'

export class UserResponseDto {
  public readonly id: string
  public readonly email: string
  public readonly firstName: string
  public readonly lastName: string
  public readonly role: string
  public readonly createdAt: Date

  constructor(entity: UserEntity) {
    this.id = entity.id
    this.email = entity.email
    this.firstName = entity.firstName
    this.lastName = entity.lastName
    this.role = entity.role
    this.createdAt = entity.createdAt
  }
}
