import { OrderEntity } from '@modules/order/domain/entity/order.entity'

import { BraceletStatus } from '../../domain/constants/bracelet-status.constant'
import { BraceletEntity } from '../../domain/entity/bracelet.entity'
import { ActivateBraceletUseCase } from '../use-cases/activate-bracelet/activate-bracelet.use-case'
import { AssignBraceletUseCase } from '../use-cases/assign-bracelet/assign-bracelet.use-case'
import { CreateBraceletFromOrderUseCase } from '../use-cases/create-bracelet-from-order/create-bracelet-from-order.use-case'
import { CreateBraceletUseCase, CreateBraceletInput } from '../use-cases/create-bracelet/create-bracelet.use-case'
import { DeleteBraceletUseCase } from '../use-cases/delete-bracelet/delete-bracelet.use-case'
import { DisableBraceletUseCase } from '../use-cases/disable-bracelet/disable-bracelet.use-case'
import { GetAllBraceletsUseCase } from '../use-cases/get-all-bracelets/get-all-bracelets.use-case'
import { GetBraceletByIdUseCase } from '../use-cases/get-bracelet-by-id/get-bracelet-by-id.use-case'
import { GetBraceletByNfcIdUseCase } from '../use-cases/get-bracelet-by-nfc-id/get-bracelet-by-nfc-id.use-case'
import { GetPaginatedBraceletsUseCase } from '../use-cases/get-paginated-bracelets/get-paginated-bracelets.use-case'

export class BraceletService {
  constructor(
    private readonly createBraceletUseCase: CreateBraceletUseCase,
    private readonly createBraceletFromOrderUseCase: CreateBraceletFromOrderUseCase,
    private readonly getAllBraceletsUseCase: GetAllBraceletsUseCase,
    private readonly getBraceletByIdUseCase: GetBraceletByIdUseCase,
    private readonly getBraceletByNfcIdUseCase: GetBraceletByNfcIdUseCase,
    private readonly assignBraceletUseCase: AssignBraceletUseCase,
    private readonly activateBraceletUseCase: ActivateBraceletUseCase,
    private readonly disableBraceletUseCase: DisableBraceletUseCase,
    private readonly deleteBraceletUseCase: DeleteBraceletUseCase,
    private readonly getPaginatedBraceletsUseCase: GetPaginatedBraceletsUseCase
  ) {}

  create(input: CreateBraceletInput): Promise<BraceletEntity> {
    return this.createBraceletUseCase.execute(input)
  }

  createFromOrder(order: OrderEntity): Promise<BraceletEntity[]> {
    return this.createBraceletFromOrderUseCase.execute(order)
  }

  getAll(status?: BraceletStatus): Promise<BraceletEntity[]> {
    return this.getAllBraceletsUseCase.execute(status)
  }

  getPaginated(params: {
    page: number
    limit: number
    status?: BraceletStatus
    search?: string
  }): Promise<PaginatedResult<BraceletEntity>> {
    return this.getPaginatedBraceletsUseCase.execute(params)
  }

  getById(id: string): Promise<BraceletEntity> {
    return this.getBraceletByIdUseCase.execute(id)
  }

  getByNfcId(nfcId: string): Promise<BraceletEntity> {
    return this.getBraceletByNfcIdUseCase.execute(nfcId)
  }

  assign(id: string, userId: string, eventId: string): Promise<BraceletEntity> {
    return this.assignBraceletUseCase.execute(id, userId, eventId)
  }

  activate(id: string): Promise<BraceletEntity> {
    return this.activateBraceletUseCase.execute(id)
  }

  disable(id: string): Promise<BraceletEntity> {
    return this.disableBraceletUseCase.execute(id)
  }

  delete(id: string): Promise<void> {
    return this.deleteBraceletUseCase.execute(id)
  }
}
