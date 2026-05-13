import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { ICheckInRepository } from '@modules/check-in/domain/repository/check-in.repository.interface'
import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'
import { createAuthMiddleware, createAdminMiddleware } from '@shared/middlewares/auth.middleware'
import { Router } from 'express'

import { EventService } from './application/services/event.service'
import { CancelEventUseCase } from './application/use-cases/cancel-event/cancel-event.use-case'
import { CompleteEventUseCase } from './application/use-cases/complete-event/complete-event.use-case'
import { CreateEventUseCase } from './application/use-cases/create-event/create-event.use-case'
import { DeleteEventUseCase } from './application/use-cases/delete-event/delete-event.use-case'
import { GetAllEventsUseCase } from './application/use-cases/get-all-events/get-all-events.use-case'
import { GetEventByIdUseCase } from './application/use-cases/get-event-by-id/get-event-by-id.use-case'
import { GetEventBySlugPublicUseCase } from './application/use-cases/get-event-by-slug-public/get-event-by-slug-public.use-case'
import { GetMyEventsUseCase } from './application/use-cases/get-my-events/get-my-events.use-case'
import { ListPaginatedEventsUseCase } from './application/use-cases/list-paginated-events/list-paginated-events.use-case'
import { PublishEventUseCase } from './application/use-cases/publish-event/publish-event.use-case'
import { StartEventUseCase } from './application/use-cases/start-event/start-event.use-case'
import { UpdateEventUseCase } from './application/use-cases/update-event/update-event.use-case'
import { IEventRepository } from './domain/repository/event.repository.interface'
import { EventRepositoryMongooseMongo } from './infrastructure/repository/event.repository.mongoose-mongo'
import { EventController } from './presentation/controllers/event.controller'

export interface EventModuleDeps {
  braceletRepository: IBraceletRepository
  checkInRepository: ICheckInRepository
  participantRepository: IParticipantRepository
}

export function createEventModule(
  jwtService: JwtServiceSecurity,
  deps?: EventModuleDeps
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

  // The public endpoint needs participantCount, which lives in the participant module.
  // We wire a fallback that throws on first call, then attachDeps replaces it with the real one
  // once main.ts has spun up the participant module (same pattern as listPaginated above).
  let getBySlugPublicUC: GetEventBySlugPublicUseCase = deps
    ? new GetEventBySlugPublicUseCase(eventRepository, deps.participantRepository)
    : new GetEventBySlugPublicUseCase(eventRepository, {
        async countByEventId() {
          throw new Error('Event module participantRepository not attached yet')
        },
      } as unknown as IParticipantRepository)

  const service = new EventService(
    createUC,
    getByIdUC,
    getMyUC,
    getAllUC,
    updateUC,
    publishUC,
    startUC,
    completeUC,
    cancelUC,
    deleteUC,
    listPaginatedUC,
    getBySlugPublicUC
  )
  const controller = new EventController(service)

  const auth = createAuthMiddleware(jwtService)
  const admin = createAdminMiddleware()

  const router = Router()
  router.get('/public/:slug', (req, res, next) => controller.getPublicBySlug(req, res, next))
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
    getBySlugPublicUC = new GetEventBySlugPublicUseCase(eventRepository, d.participantRepository)
    service.attachGetBySlugPublic(getBySlugPublicUC)
  }

  return { router, eventRepository, attachDeps }
}
