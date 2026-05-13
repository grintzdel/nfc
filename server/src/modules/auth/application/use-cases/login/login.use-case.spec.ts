import { UserEntity } from '../../../domain/entity/user.entity'
import { InvalidCredentialsError } from '../../../domain/errors/auth.error'
import { IUserRepository } from '../../../domain/repository/user.repository.interface'
import { HashServiceSecurity } from '../../services/security/hash.service-security'
import { JwtServiceSecurity } from '../../services/security/jwt.service-security'
import { LoginUseCase } from './login.use-case'

describe('LoginUseCase', () => {
  let useCase: LoginUseCase
  let mockUserRepository: jest.Mocked<IUserRepository>
  let mockHashService: jest.Mocked<HashServiceSecurity>
  let mockJwtService: jest.Mocked<JwtServiceSecurity>

  beforeEach(() => {
    mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      findAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    }

    mockHashService = {
      hash: jest.fn(),
      compare: jest.fn(),
    } as unknown as jest.Mocked<HashServiceSecurity>

    mockJwtService = {
      generate: jest.fn(),
      verify: jest.fn(),
    } as unknown as jest.Mocked<JwtServiceSecurity>

    useCase = new LoginUseCase(mockUserRepository, mockHashService, mockJwtService)
  })

  it('should login and return a token for valid credentials', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(
      UserEntity.fromProps({
        id: 'user-1',
        email: 'test@pulse.io',
        password: 'hashed-password',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
    )
    mockHashService.compare.mockResolvedValue(true)
    mockJwtService.generate.mockReturnValue('jwt-token-456')

    const result = await useCase.execute({ email: 'test@pulse.io', password: 'password123' })

    expect(result.token).toBe('jwt-token-456')
    expect(result.user.email).toBe('test@pulse.io')
  })

  it('should throw InvalidCredentialsError if user not found', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)

    await expect(useCase.execute({ email: 'unknown@pulse.io', password: 'password123' })).rejects.toThrow(
      InvalidCredentialsError
    )
  })

  it('should throw InvalidCredentialsError if password is wrong', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(
      UserEntity.fromProps({
        id: 'user-1',
        email: 'test@pulse.io',
        password: 'hashed-password',
        firstName: 'Jean',
        lastName: 'Dupont',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
    )
    mockHashService.compare.mockResolvedValue(false)

    await expect(useCase.execute({ email: 'test@pulse.io', password: 'wrong-password' })).rejects.toThrow(
      InvalidCredentialsError
    )
  })
})
