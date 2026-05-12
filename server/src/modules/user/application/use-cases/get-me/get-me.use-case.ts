import { IUserRepository } from '@modules/auth/domain/repository/user.repository.interface'
import { UserNotFoundError } from '@modules/auth/domain/errors/auth.error'
import { UserEntity } from '@modules/auth/domain/entity/user.entity'

export class GetMeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new UserNotFoundError(userId)
    return user
  }
}
