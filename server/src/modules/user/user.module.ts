import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { IUserRepository } from '@modules/auth/domain/repository/user.repository.interface'
import { createAuthMiddleware, createAdminMiddleware } from '@shared/middlewares/auth.middleware'
import { Router } from 'express'

import { UserService } from './application/services/user.service'
import { GetAllUsersUseCase } from './application/use-cases/get-all-users/get-all-users.use-case'
import { GetMeUseCase } from './application/use-cases/get-me/get-me.use-case'
import { UpdateMeUseCase } from './application/use-cases/update-me/update-me.use-case'
import { UserController } from './presentation/controllers/user.controller'

export function createUserModule(userRepository: IUserRepository, jwtService: JwtServiceSecurity) {
  const getMeUseCase = new GetMeUseCase(userRepository)
  const updateMeUseCase = new UpdateMeUseCase(userRepository)
  const getAllUsersUseCase = new GetAllUsersUseCase(userRepository)
  const userService = new UserService(getMeUseCase, updateMeUseCase, getAllUsersUseCase)
  const controller = new UserController(userService)

  const authMiddleware = createAuthMiddleware(jwtService)
  const adminMiddleware = createAdminMiddleware()

  const router = Router()
  router.get('/me', authMiddleware, (req, res, next) => controller.getMe(req, res, next))
  router.patch('/me', authMiddleware, (req, res, next) => controller.updateMe(req, res, next))
  router.get('/', authMiddleware, adminMiddleware, (req, res, next) => controller.getAll(req, res, next))

  return router
}
