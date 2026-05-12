import { Router } from 'express'
import { JwtServiceSecurity } from '@modules/auth/application/services/security/jwt.service-security'
import { createAuthMiddleware, createAdminMiddleware } from '@shared/middlewares/auth.middleware'
import { IProductRepository } from '@modules/product/domain/repository/product.repository.interface'
import { BraceletRepositoryMongooseMongo } from './infrastructure/repository/bracelet.repository.mongoose-mongo'
import { IBraceletRepository } from './domain/repository/bracelet.repository.interface'
import { CreateBraceletUseCase } from './application/use-cases/create-bracelet/create-bracelet.use-case'
import { CreateBraceletFromOrderUseCase } from './application/use-cases/create-bracelet-from-order/create-bracelet-from-order.use-case'
import { GetAllBraceletsUseCase } from './application/use-cases/get-all-bracelets/get-all-bracelets.use-case'
import { GetBraceletByIdUseCase } from './application/use-cases/get-bracelet-by-id/get-bracelet-by-id.use-case'
import { GetBraceletByNfcIdUseCase } from './application/use-cases/get-bracelet-by-nfc-id/get-bracelet-by-nfc-id.use-case'
import { AssignBraceletUseCase } from './application/use-cases/assign-bracelet/assign-bracelet.use-case'
import { ActivateBraceletUseCase } from './application/use-cases/activate-bracelet/activate-bracelet.use-case'
import { DisableBraceletUseCase } from './application/use-cases/disable-bracelet/disable-bracelet.use-case'
import { DeleteBraceletUseCase } from './application/use-cases/delete-bracelet/delete-bracelet.use-case'
import { GetAvailableBraceletsUseCase } from './application/use-cases/get-available-bracelets/get-available-bracelets.use-case'
import { GetPaginatedBraceletsByEventUseCase } from './application/use-cases/get-paginated-bracelets-by-event/get-paginated-bracelets-by-event.use-case'
import { GetPaginatedBraceletsUseCase } from './application/use-cases/get-paginated-bracelets/get-paginated-bracelets.use-case'
import { BraceletService } from './application/services/bracelet.service'
import { BraceletController } from './presentation/controllers/bracelet.controller'
import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'

export function createBraceletModule(
  jwtService: JwtServiceSecurity,
  _productRepository: IProductRepository,
): {
  router: Router
  braceletRepository: IBraceletRepository
  createBraceletFromOrderUseCase: CreateBraceletFromOrderUseCase
  activateBraceletUseCase: ActivateBraceletUseCase
  attachDeps: (deps: { participantRepository: IParticipantRepository }) => void
} {
  const braceletRepository = new BraceletRepositoryMongooseMongo()
  const createUC = new CreateBraceletUseCase(braceletRepository)
  const createFromOrderUC = new CreateBraceletFromOrderUseCase(braceletRepository)
  const getAllUC = new GetAllBraceletsUseCase(braceletRepository)
  const getByIdUC = new GetBraceletByIdUseCase(braceletRepository)
  const getByNfcIdUC = new GetBraceletByNfcIdUseCase(braceletRepository)
  const assignUC = new AssignBraceletUseCase(braceletRepository)
  const activateUC = new ActivateBraceletUseCase(braceletRepository)
  const disableUC = new DisableBraceletUseCase(braceletRepository)
  const deleteUC = new DeleteBraceletUseCase(braceletRepository)

  let getAvailableUC: GetAvailableBraceletsUseCase | null = null
  let getPaginatedByEventUC: GetPaginatedBraceletsByEventUseCase | null = null

  const getPaginatedUC = new GetPaginatedBraceletsUseCase(braceletRepository)

  const service = new BraceletService(
    createUC,
    createFromOrderUC,
    getAllUC,
    getByIdUC,
    getByNfcIdUC,
    assignUC,
    activateUC,
    disableUC,
    deleteUC,
    getPaginatedUC,
  )
  const controller = new BraceletController(service)

  const auth = createAuthMiddleware(jwtService)
  const admin = createAdminMiddleware()

  const router = Router()
  router.post('/', auth, admin, (req, res, next) => controller.create(req, res, next))
  router.get('/available', auth, admin, (req, res, next) => {
    if (!getAvailableUC) {
      next(new Error('Bracelet module dependencies not attached'))
      return
    }
    controller.getAvailable(getAvailableUC, req, res, next)
  })
  router.get('/event/:eventId/paginated', auth, admin, (req, res, next) => {
    if (!getPaginatedByEventUC) {
      next(new Error('Bracelet module dependencies not attached'))
      return
    }
    controller.getPaginatedByEvent(getPaginatedByEventUC, req, res, next)
  })
  router.get('/paginated', auth, admin, (req, res, next) => controller.getPaginated(req, res, next))
  router.get('/', auth, admin, (req, res, next) => controller.getAll(req, res, next))
  router.get('/:id', auth, (req, res, next) => controller.getById(req, res, next))
  router.patch('/:id/assign', auth, admin, (req, res, next) => controller.assign(req, res, next))
  router.patch('/:id/disable', auth, admin, (req, res, next) => controller.disable(req, res, next))
  router.delete('/:id', auth, admin, (req, res, next) => controller.delete(req, res, next))

  function attachDeps({ participantRepository }: { participantRepository: IParticipantRepository }): void {
    getAvailableUC = new GetAvailableBraceletsUseCase(braceletRepository, participantRepository)
    getPaginatedByEventUC = new GetPaginatedBraceletsByEventUseCase(braceletRepository, participantRepository)
  }

  return {
    router,
    braceletRepository,
    createBraceletFromOrderUseCase: createFromOrderUC,
    activateBraceletUseCase: activateUC,
    attachDeps,
  }
}
