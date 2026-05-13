import mongoose, { Schema, Document } from 'mongoose'

import { InteractionType } from '../../domain/constants/interaction-type.constant'

export interface CheckInDocument extends Document {
  braceletId: string
  eventId: string
  interactionType: InteractionType
  zoneName: Nullable<string>
  targetBraceletId: Nullable<string>
  amount: Nullable<number>
  metadata: Record<string, unknown>
  createdAt: Date
}

const checkInSchema = new Schema<CheckInDocument>(
  {
    braceletId: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    interactionType: {
      type: String,
      enum: Object.values(InteractionType),
      required: true,
      index: true,
    },
    zoneName: { type: String, default: null },
    targetBraceletId: { type: String, default: null },
    amount: { type: Number, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
)

export const CheckInModel = mongoose.model<CheckInDocument>('CheckIn', checkInSchema)
