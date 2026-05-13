import { OrderStatus } from '../../domain/constants/order.constant'
import { OrderEntity } from '../../domain/entity/order.entity'
import { IOrderRepository } from '../../domain/repository/order.repository.interface'
import { OrderModel, OrderDocument } from '../schema/order.schema'

export class OrderRepositoryMongooseMongo implements IOrderRepository {
  private toEntity(doc: OrderDocument): OrderEntity {
    return OrderEntity.fromProps({
      id: doc._id.toString(),
      userId: doc.userId,
      items: doc.items,
      totalAmount: doc.totalAmount,
      status: doc.status as OrderStatus,
      shippingAddress: doc.shippingAddress,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
      deletedAt: doc.deletedAt,
    })
  }

  async findAll(): Promise<OrderEntity[]> {
    const docs = await OrderModel.find({ deletedAt: null }).sort({ createdAt: -1 })
    return docs.map((doc) => this.toEntity(doc))
  }
  async findById(id: string): Promise<Nullable<OrderEntity>> {
    const doc = await OrderModel.findOne({ _id: id, deletedAt: null })
    return doc ? this.toEntity(doc) : null
  }
  async findByUserId(userId: string): Promise<OrderEntity[]> {
    const docs = await OrderModel.find({ userId, deletedAt: null }).sort({ createdAt: -1 })
    return docs.map((doc) => this.toEntity(doc))
  }
  async create(order: OrderEntity): Promise<OrderEntity> {
    const doc = await OrderModel.create({
      userId: order.userId,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status,
      shippingAddress: order.shippingAddress,
    })
    return this.toEntity(doc)
  }
  async update(order: OrderEntity): Promise<OrderEntity> {
    const json = order.toJSON()
    const doc = await OrderModel.findByIdAndUpdate(
      order.id,
      { status: json.status, shippingAddress: json.shippingAddress, deletedAt: json.deletedAt },
      { new: true }
    )
    return this.toEntity(doc!)
  }
  async delete(id: string): Promise<void> {
    await OrderModel.findByIdAndUpdate(id, { deletedAt: new Date() })
  }

  async sumRevenueInRange(from: Date, to: Date, statuses: OrderStatus[]): Promise<number> {
    const rows = await OrderModel.aggregate<{ sum: number }>([
      { $match: { status: { $in: statuses }, createdAt: { $gte: from, $lt: to }, deletedAt: null } },
      { $group: { _id: null, sum: { $sum: '$totalAmount' } } },
    ])
    return rows[0]?.sum ?? 0
  }
}
