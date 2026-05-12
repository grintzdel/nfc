import { ISupplyOrderRepository } from '../../domain/repository/supply-order.repository.interface'
import { SupplyOrderEntity } from '../../domain/entity/supply-order.entity'
import { SupplyOrderStatus } from '../../domain/constants/supply-order-status.constant'
import { SupplyOrderModel, SupplyOrderDocument } from '../schema/supply-order.schema'

function toEntity(doc: SupplyOrderDocument): SupplyOrderEntity {
  return SupplyOrderEntity.fromProps({
    id: String(doc._id),
    units: doc.units,
    orderedAt: doc.orderedAt,
    estimatedDeliveryDate: doc.estimatedDeliveryDate,
    status: doc.status,
    receivedAt: doc.receivedAt,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  })
}

export class SupplyOrderRepositoryMongooseMongo implements ISupplyOrderRepository {
  async create(entity: SupplyOrderEntity): Promise<SupplyOrderEntity> {
    const { id: _ignored, ...props } = entity.toJSON()
    const doc = await SupplyOrderModel.create(props)
    return toEntity(doc)
  }

  async findById(id: string): Promise<Nullable<SupplyOrderEntity>> {
    const doc = await SupplyOrderModel.findById(id)
    return doc ? toEntity(doc) : null
  }

  async findAll(): Promise<SupplyOrderEntity[]> {
    const docs = await SupplyOrderModel.find().sort({ createdAt: -1 })
    return docs.map(toEntity)
  }

  async findPending(): Promise<Nullable<SupplyOrderEntity>> {
    const doc = await SupplyOrderModel.findOne({ status: SupplyOrderStatus.PENDING })
      .sort({ estimatedDeliveryDate: 1 })
    return doc ? toEntity(doc) : null
  }

  async update(entity: SupplyOrderEntity): Promise<SupplyOrderEntity> {
    const { units, orderedAt, estimatedDeliveryDate, status, receivedAt } = entity.toJSON()
    const doc = await SupplyOrderModel.findByIdAndUpdate(
      entity.id,
      { units, orderedAt, estimatedDeliveryDate, status, receivedAt },
      { new: true },
    )
    if (!doc) throw new Error(`SupplyOrder ${entity.id} not found in DB during update`)
    return toEntity(doc)
  }
}
