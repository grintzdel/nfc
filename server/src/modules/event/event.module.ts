import { Router } from 'express'
import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { createAuthMiddleware, createAdminMiddleware } from '@shared/middlewares/auth.middleware'
import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { ICheckInRepository } from '@modules/check-in/domain/repository/check-in.repository.interface'
import { EventRepositoryMongooseMongo } from './infrastructure/repository/event.repository.mongoose-mongo'
import { IEventRepository } from './domain/repository/event.repository.interface'
import { CreateEventUseCase } from './application/use-cases/create-event/create-event.use-case'
import { GetEventByIdUseCase } from './application/use-cases/get-event-by-id/get-event-by-id.use-case'
import { GetMyEventsUseCase } from './application/use-cases/get-my-events/get-my-events.use-case'
import { GetAllEventsUseCase } from './application/use-cases/get-all-events/get-all-events.use-case'
import { UpdateEventUseCase } from './application/use-cases/update-event/update-event.use-case'
import { PublishEventUseCase } from './application/use-cases/publish-event/publish-event.use-case'
import { StartEventUseCase } from './application/use-cases/start-event/start-event.use-case'
import { CompleteEventUseCase } from './application/use-cases/complete-event/complete-event.use-case'
import { CancelEventUseCase } from './application/use-cases/cancel-event/cancel-event.use-case'
import { DeleteEventUseCase } from './application/use-cases/delete-event/delete-event.use-case'
import { ListPaginatedEventsUseCase } from './application/use-cases/list-paginated-events/list-paginated-events.use-case'
import { EventService } from './application/services/event.service'
import { EventController } from './presentation/controllers/event.controller'

export interface EventModuleDeps {
  braceletRepository: IBraceletRepository
  checkInRepository: ICheckInRepository
}

export function createEventModule(
  jwtService: JwtServiceSecurity,
  deps?: EventModuleDeps,
): { router: Router; eventRepository: IEventRepository; attachDeps: (d: EventModuleDeps) => void } {
  const eventRepository = new EventRepositoryMongooseMongo()
  const createUC = new CreateEventUseCase(eventRepository)
  const getByIdUC = new GetEventByIdUseCase(eventRepository)
  const getMyUC = new GetMyEventsUseCase(eventRepository)
  const getAllUC = new GetAllEventsUseCase(eventRepository)
  const updateUC = new UpdateEventUseCase(eventRepository)
  const publishUC = new PublishEventUseCase(eventRepository)
  const startUC = new StartEventUseCase(eventRepository)
  const completeUC = new CompleteEventUseCase(eventRepository)
  const cancelUC = new CancelEventUseCase(eventRepository)
  const deleteUC = new DeleteEventUseCase(eventRepository)

  let listPaginatedUC: ListPaginatedEventsUseCase | null = deps
    ? new ListPaginatedEventsUseCase(eventRepository, deps.braceletRepository, deps.checkInRepository)
    : null

  const service = new EventService(createUC, getByIdUC, getMyUC, getAllUC, updateUC, publishUC, startUC, completeUC, cancelUC, deleteUC, listPaginatedUC)
  const controller = new EventController(service)

  const auth = createAuthMiddleware(jwtService)
  const admin = createAdminMiddleware()

  const router = Router()
  router.post('/', auth, (req, res, next) => controller.create(req, res, next))
  router.get('/', auth, (req, res, next) => controller.getMyEvents(req, res, next))
  router.get('/admin', auth, admin, (req, res, next) => controller.getAll(req, res, next))
  router.get('/admin/paginated', auth, admin, (req, res, next) => controller.listPaginated(req, res, next))
  router.get('/:id', auth, (req, res, next) => controller.getById(req, res, next))
  router.patch('/:id', auth, (req, res, next) => controller.update(req, res, next))
  router.post('/:id/publish', auth, (req, res, next) => controller.publish(req, res, next))
  router.post('/:id/start', auth, (req, res, next) => controller.start(req, res, next))
  router.post('/:id/complete', auth, (req, res, next) => controller.complete(req, res, next))
  router.post('/:id/cancel', auth, (req, res, next) => controller.cancel(req, res, next))
  router.delete('/:id', auth, (req, res, next) => controller.delete(req, res, next))

  function attachDeps(d: EventModuleDeps): void {
    listPaginatedUC = new ListPaginatedEventsUseCase(eventRepository, d.braceletRepository, d.checkInRepository)
    service.attachListPaginated(listPaginatedUC)
  }

  return { router, eventRepository, attachDeps }
}
