import { GetMeUseCase } from '../use-cases/get-me/get-me.use-case'
import { UpdateMeUseCase } from '../use-cases/update-me/update-me.use-case'
import { GetAllUsersUseCase } from '../use-cases/get-all-users/get-all-users.use-case'

export class UserService {
  constructor(
    private readonly getMeUseCase: GetMeUseCase,
    private readonly updateMeUseCase: UpdateMeUseCase,
    private readonly getAllUsersUseCase: GetAllUsersUseCase
  ) {}

  getMe(userId: string) { return this.getMeUseCase.execute(userId) }
  updateMe(userId: string, input: { firstName?: string; lastName?: string; email?: string }) { return this.updateMeUseCase.execute(userId, input) }
  getAllUsers() { return this.getAllUsersUseCase.execute() }
}
