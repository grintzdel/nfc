import mongoose, { Schema, Document } from 'mongoose'

export interface FaqDocument extends Document {
  question: string
  answer: string
  order: number
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

const faqSchema = new Schema<FaqDocument>(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true },
)

export const FaqModel = mongoose.model<FaqDocument>('Faq', faqSchema)
