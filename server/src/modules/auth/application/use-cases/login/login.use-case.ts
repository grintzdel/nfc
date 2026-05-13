import { InvalidCredentialsError } from '../../../domain/errors/auth.error'
import { IUserRepository } from '../../../domain/repository/user.repository.interface'
import { HashServiceSecurity } from '../../services/security/hash.service-security'
import { JwtServiceSecurity } from '../../services/security/jwt.service-security'

interface LoginInput {
  email: string
  password: string
}

interface LoginOutput {
  token: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

export class LoginUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashServiceSecurity,
    private readonly jwtService: JwtServiceSecurity
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email)
    if (!user) {
      throw new InvalidCredentialsError()
    }

    const isPasswordValid = await this.hashService.compare(input.password, user.password)
    if (!isPasswordValid) {
      throw new InvalidCredentialsError()
    }

    const token = this.jwtService.generate({
      userId: user.id,
      role: user.role,
    })

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    }
  }
}
