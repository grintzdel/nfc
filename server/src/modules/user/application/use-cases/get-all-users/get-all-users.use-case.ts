import { UserEntity } from '@modules/auth/domain/entity/user.entity'
import { IUserRepository } from '@modules/auth/domain/repository/user.repository.interface'

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}
  async execute(): Promise<UserEntity[]> {
    return this.userRepository.findAll()
  }
}
