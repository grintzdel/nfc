import { UserEntity } from '../../../domain/entity/user.entity'
import { UserAlreadyExistsError } from '../../../domain/errors/auth.error'
import { IUserRepository } from '../../../domain/repository/user.repository.interface'
import { HashServiceSecurity } from '../../services/security/hash.service-security'
import { JwtServiceSecurity } from '../../services/security/jwt.service-security'

interface RegisterInput {
  email: string
  password: string
  firstName: string
  lastName: string
}

interface RegisterOutput {
  token: string
  user: {
    id: string
    email: string
    firstName: string
    lastName: string
    role: string
  }
}

export class RegisterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hashService: HashServiceSecurity,
    private readonly jwtService: JwtServiceSecurity
  ) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const existing = await this.userRepository.findByEmail(input.email)
    if (existing) {
      throw new UserAlreadyExistsError(input.email)
    }

    const hashedPassword = await this.hashService.hash(input.password)

    const user = UserEntity.create({
      email: input.email,
      password: hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
    })

    const saved = await this.userRepository.create(user)

    const token = this.jwtService.generate({
      userId: saved.id,
      role: saved.role,
    })

    return {
      token,
      user: {
        id: saved.id,
        email: saved.email,
        firstName: saved.firstName,
        lastName: saved.lastName,
        role: saved.role,
      },
    }
  }
}
