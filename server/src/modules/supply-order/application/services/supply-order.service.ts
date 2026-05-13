import { SupplyOrderEntity } from '../../domain/entity/supply-order.entity'
import { SupplyOrderDomainModel } from '../../domain/model/supply-order.domain-model'
import { CancelSupplyOrderUseCase } from '../use-cases/cancel-supply-order/cancel-supply-order.use-case'
import { CreateSupplyOrderUseCase } from '../use-cases/create-supply-order/create-supply-order.use-case'
import { GetAllSupplyOrdersUseCase } from '../use-cases/get-all-supply-orders/get-all-supply-orders.use-case'
import { GetPendingSupplyOrderUseCase } from '../use-cases/get-pending-supply-order/get-pending-supply-order.use-case'
import { GetSupplyOrderByIdUseCase } from '../use-cases/get-supply-order-by-id/get-supply-order-by-id.use-case'
import { MarkSupplyOrderReceivedUseCase } from '../use-cases/mark-supply-order-received/mark-supply-order-received.use-case'

export class SupplyOrderService {
  constructor(
    private readonly createSupplyOrderUseCase: CreateSupplyOrderUseCase,
    private readonly getAllSupplyOrdersUseCase: GetAllSupplyOrdersUseCase,
    private readonly getSupplyOrderByIdUseCase: GetSupplyOrderByIdUseCase,
    private readonly getPendingSupplyOrderUseCase: GetPendingSupplyOrderUseCase,
    private readonly markSupplyOrderReceivedUseCase: MarkSupplyOrderReceivedUseCase,
    private readonly cancelSupplyOrderUseCase: CancelSupplyOrderUseCase
  ) {}

  create(dto: SupplyOrderDomainModel.CreateSupplyOrderDto): Promise<SupplyOrderEntity> {
    return this.createSupplyOrderUseCase.execute(dto)
  }
  getAll(): Promise<SupplyOrderEntity[]> {
    return this.getAllSupplyOrdersUseCase.execute()
  }
  getById(id: string): Promise<SupplyOrderEntity> {
    return this.getSupplyOrderByIdUseCase.execute(id)
  }
  getPending(): Promise<Nullable<SupplyOrderEntity>> {
    return this.getPendingSupplyOrderUseCase.execute()
  }
  markReceived(id: string): Promise<SupplyOrderEntity> {
    return this.markSupplyOrderReceivedUseCase.execute(id)
  }
  cancel(id: string): Promise<SupplyOrderEntity> {
    return this.cancelSupplyOrderUseCase.execute(id)
  }
}
