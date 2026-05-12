import { Router } from 'express'
import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { createAuthMiddleware, createAdminMiddleware } from '@shared/middlewares/auth.middleware'
import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'
import { ActivateBraceletUseCase } from '@modules/bracelet/application/use-cases/activate-bracelet/activate-bracelet.use-case'
import { CheckInRepositoryMongooseMongo } from './infrastructure/repository/check-in.repository.mongoose-mongo'
import { ICheckInRepository } from './domain/repository/check-in.repository.interface'
import { RecordCheckInUseCase } from './application/use-cases/record-check-in/record-check-in.use-case'
import { GetCheckInsByEventUseCase } from './application/use-cases/get-check-ins-by-event/get-check-ins-by-event.use-case'
import { CheckInService } from './application/services/check-in.service'
import { CheckInController } from './presentation/controllers/check-in.controller'

export function createCheckInModule(
  jwtService: JwtServiceSecurity,
  braceletRepository: IBraceletRepository,
  participantRepository: IParticipantRepository,
  activateBraceletUseCase: ActivateBraceletUseCase,
): { router: Router; checkInRepository: ICheckInRepository } {
  const checkInRepository = new CheckInRepositoryMongooseMongo()

  const recordUC = new RecordCheckInUseCase(checkInRepository, braceletRepository, participantRepository, activateBraceletUseCase)
  const getByEventUC = new GetCheckInsByEventUseCase(checkInRepository)

  const service = new CheckInService(recordUC, getByEventUC)
  const controller = new CheckInController(service)

  const auth = createAuthMiddleware(jwtService)
  const admin = createAdminMiddleware()

  const router = Router()
  router.post('/', auth, (req, res, next) => controller.record(req, res, next))
  router.get('/event/:eventId', auth, admin, (req, res, next) => controller.getByEvent(req, res, next))

  return { router, checkInRepository }
}
