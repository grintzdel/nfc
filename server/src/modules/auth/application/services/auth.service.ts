import { RegisterUseCase } from '../use-cases/register/register.use-case'
import { LoginUseCase } from '../use-cases/login/login.use-case'

export class AuthService {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly loginUseCase: LoginUseCase
  ) {}

  register(input: { email: string; password: string; firstName: string; lastName: string }) {
    return this.registerUseCase.execute(input)
  }

  login(input: { email: string; password: string }) {
    return this.loginUseCase.execute(input)
  }
}
