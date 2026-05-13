import mongoose, { Schema, Document } from 'mongoose'

import { SupplyOrderStatus } from '../../domain/constants/supply-order-status.constant'

export interface SupplyOrderDocument extends Document {
  units: number
  orderedAt: Date
  estimatedDeliveryDate: Date
  status: SupplyOrderStatus
  receivedAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
}

const supplyOrderSchema = new Schema<SupplyOrderDocument>(
  {
    units: { type: Number, required: true },
    orderedAt: { type: Date, required: true },
    estimatedDeliveryDate: { type: Date, required: true },
    status: {
      type: String,
      enum: Object.values(SupplyOrderStatus),
      default: SupplyOrderStatus.PENDING,
      required: true,
    },
    receivedAt: { type: Date, default: null },
  },
  { timestamps: true }
)
supplyOrderSchema.index({ status: 1 })

export const SupplyOrderModel = mongoose.model<SupplyOrderDocument>('SupplyOrder', supplyOrderSchema)
