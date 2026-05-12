import { IUserRepository } from '@modules/auth/domain/repository/user.repository.interface'
import { UserEntity } from '@modules/auth/domain/entity/user.entity'

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}
  async execute(): Promise<UserEntity[]> { return this.userRepository.findAll() }
}
