import { RegisterUseCase } from './register.use-case'
import { UserAlreadyExistsError } from '../../../domain/errors/auth.error'
import { UserEntity } from '../../../domain/entity/user.entity'
import { IUserRepository } from '../../../domain/repository/user.repository.interface'
import { HashServiceSecurity } from '../../services/security/hash.service-security'
import { JwtServiceSecurity } from '../../services/security/jwt.service-security'

describe('RegisterUseCase', () => {
  let useCase: RegisterUseCase
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

    useCase = new RegisterUseCase(mockUserRepository, mockHashService, mockJwtService)
  })

  it('should register a new user and return a token', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null)
    mockHashService.hash.mockResolvedValue('hashed-password')
    mockUserRepository.create.mockResolvedValue(
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
    mockJwtService.generate.mockReturnValue('jwt-token-123')

    const result = await useCase.execute({
      email: 'test@pulse.io',
      password: 'password123',
      firstName: 'Jean',
      lastName: 'Dupont',
    })

    expect(result.token).toBe('jwt-token-123')
    expect(result.user.email).toBe('test@pulse.io')
    expect(mockHashService.hash).toHaveBeenCalledWith('password123')
    expect(mockUserRepository.create).toHaveBeenCalled()
  })

  it('should throw UserAlreadyExistsError if email is taken', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(
      UserEntity.fromProps({
        id: 'existing-user',
        email: 'test@pulse.io',
        password: 'hashed',
        firstName: 'Existing',
        lastName: 'User',
        role: 'customer',
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      })
    )

    await expect(
      useCase.execute({ email: 'test@pulse.io', password: 'password123', firstName: 'Jean', lastName: 'Dupont' })
    ).rejects.toThrow(UserAlreadyExistsError)
  })
})
