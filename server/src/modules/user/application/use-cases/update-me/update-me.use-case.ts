import { UserEntity } from '@modules/auth/domain/entity/user.entity'
import { UserNotFoundError } from '@modules/auth/domain/errors/auth.error'
import { IUserRepository } from '@modules/auth/domain/repository/user.repository.interface'

interface UpdateMeInput {
  firstName?: string
  lastName?: string
  email?: string
}

export class UpdateMeUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string, input: UpdateMeInput): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId)
    if (!user) throw new UserNotFoundError(userId)
    user.update(input)
    return this.userRepository.update(user)
  }
}
