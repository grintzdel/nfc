import mongoose, { Schema, Document } from 'mongoose'
import { BraceletStatus } from '../../domain/constants/bracelet-status.constant'

export interface BraceletDocument extends Document {
  nfcId: string
  status: BraceletStatus
  userId: Nullable<string>
  eventId: Nullable<string>
  productId: Nullable<string>
  orderId: Nullable<string>
  activatedAt: Nullable<Date>
  deletedAt: Nullable<Date>
  createdAt: Date
  updatedAt: Date
}

const braceletSchema = new Schema<BraceletDocument>(
  {
    nfcId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: Object.values(BraceletStatus),
      default: BraceletStatus.STOCK,
      required: true,
      index: true,
    },
    userId: { type: String, default: null, index: true },
    eventId: { type: String, default: null, index: true },
    productId: { type: String, default: null, index: true },
    orderId: { type: String, default: null, index: true },
    activatedAt: { type: Date, default: null, index: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export const BraceletModel = mongoose.model<BraceletDocument>('Bracelet', braceletSchema)
