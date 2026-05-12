import { Router } from 'express'
import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { createAuthMiddleware, createAdminMiddleware } from '@shared/middlewares/auth.middleware'
import { IEventRepository } from '@modules/event/domain/repository/event.repository.interface'
import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { ParticipantRepositoryMongooseMongo } from './infrastructure/repository/participant.repository.mongoose-mongo'
import { IParticipantRepository } from './domain/repository/participant.repository.interface'
import { RegisterParticipantUseCase } from './application/use-cases/register-participant/register-participant.use-case'
import { GetParticipantByIdUseCase } from './application/use-cases/get-participant-by-id/get-participant-by-id.use-case'
import { GetMyParticipationsUseCase } from './application/use-cases/get-my-participations/get-my-participations.use-case'
import { GetParticipantsByEventUseCase } from './application/use-cases/get-participants-by-event/get-participants-by-event.use-case'
import { GetPaginatedParticipantsByEventUseCase } from './application/use-cases/get-paginated-participants-by-event/get-paginated-participants-by-event.use-case'
import { UpdateParticipantProfileUseCase } from './application/use-cases/update-participant-profile/update-participant-profile.use-case'
import { AttachBraceletUseCase } from './application/use-cases/attach-bracelet/attach-bracelet.use-case'
import { UnregisterParticipantUseCase } from './application/use-cases/unregister-participant/unregister-participant.use-case'
import { ParticipantService } from './application/services/participant.service'
import { ParticipantController } from './presentation/controllers/participant.controller'

export function createParticipantModule(
  jwtService: JwtServiceSecurity,
  eventRepository: IEventRepository,
  braceletRepository: IBraceletRepository,
): { router: Router; participantRepository: IParticipantRepository } {
  const participantRepository = new ParticipantRepositoryMongooseMongo()

  const registerUC = new RegisterParticipantUseCase(participantRepository, eventRepository)
  const getByIdUC = new GetParticipantByIdUseCase(participantRepository)
  const getMyUC = new GetMyParticipationsUseCase(participantRepository, eventRepository)
  const getByEventUC = new GetParticipantsByEventUseCase(participantRepository)
  const getPaginatedByEventUC = new GetPaginatedParticipantsByEventUseCase(participantRepository, braceletRepository)
  const updateProfileUC = new UpdateParticipantProfileUseCase(participantRepository)
  const attachBraceletUC = new AttachBraceletUseCase(participantRepository, braceletRepository)
  const unregisterUC = new UnregisterParticipantUseCase(participantRepository)

  const service = new ParticipantService(
    registerUC,
    getByIdUC,
    getMyUC,
    getByEventUC,
    getPaginatedByEventUC,
    updateProfileUC,
    attachBraceletUC,
    unregisterUC,
  )
  const controller = new ParticipantController(service)

  const auth = createAuthMiddleware(jwtService)
  const admin = createAdminMiddleware()

  const router = Router()
  router.post('/', auth, (req, res, next) => controller.register(req, res, next))
  router.get('/me', auth, (req, res, next) => controller.getMyParticipations(req, res, next))
  router.get('/event/:eventId/paginated', auth, admin, (req, res, next) => controller.getPaginatedByEvent(req, res, next))
  router.get('/event/:eventId', auth, admin, (req, res, next) => controller.getByEvent(req, res, next))
  router.get('/:id', auth, (req, res, next) => controller.getById(req, res, next))
  router.patch('/:id/profile', auth, (req, res, next) => controller.updateProfile(req, res, next))
  router.patch('/:id/bracelet', auth, admin, (req, res, next) => controller.attachBracelet(req, res, next))
  router.delete('/:id', auth, (req, res, next) => controller.unregister(req, res, next))

  return { router, participantRepository }
}
