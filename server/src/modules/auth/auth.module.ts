import { Router } from 'express'
import type { StringValue } from 'ms'

import { AuthService } from './application/services/auth.service'
import { HashServiceSecurity } from './application/services/security/hash.service-security'
import { JwtServiceSecurity } from './application/services/security/jwt.service-security'
import { LoginUseCase } from './application/use-cases/login/login.use-case'
import { RegisterUseCase } from './application/use-cases/register/register.use-case'
import { AuthConstant } from './domain/constants/auth.constant'
import { UserRepositoryMongooseMongo } from './infrastructure/repository/user.repository.mongoose-mongo'
import { AuthController } from './presentation/controllers/auth.controller'

export function createAuthModule() {
  const userRepository = new UserRepositoryMongooseMongo()
  const hashService = new HashServiceSecurity()
  const jwtService = new JwtServiceSecurity(
    process.env.JWT_SECRET!,
    (process.env.JWT_EXPIRES_IN ?? AuthConstant.JWT_DEFAULT_EXPIRATION) as StringValue
  )

  const registerUseCase = new RegisterUseCase(userRepository, hashService, jwtService)
  const loginUseCase = new LoginUseCase(userRepository, hashService, jwtService)
  const authService = new AuthService(registerUseCase, loginUseCase)
  const controller = new AuthController(authService)

  const router = Router()
  router.post('/register', (req, res, next) => controller.register(req, res, next))
  router.post('/login', (req, res, next) => controller.login(req, res, next))

  return { router, jwtService, userRepository }
}
