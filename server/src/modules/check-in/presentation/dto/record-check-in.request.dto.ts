import { AppError } from '@shared/errors/app.error'

import { InteractionType } from '../../domain/constants/interaction-type.constant'

export class RecordCheckInRequestDto {
  nfcId: string
  eventId: string
  interactionType: InteractionType
  zoneName: Nullable<string>
  targetNfcId: Nullable<string>
  amount: Nullable<number>
  metadata: Record<string, unknown>

  constructor(body: Record<string, unknown>) {
    if (typeof body.nfcId !== 'string' || !body.nfcId) throw new AppError(400, 'nfcId is required')
    if (typeof body.eventId !== 'string' || !body.eventId) throw new AppError(400, 'eventId is required')
    if (typeof body.interactionType !== 'string') throw new AppError(400, 'interactionType is required')
    const validTypes = Object.values(InteractionType) as string[]
    if (!validTypes.includes(body.interactionType)) {
      throw new AppError(400, `Invalid interactionType. Must be one of: ${validTypes.join(', ')}`)
    }
    if (body.amount !== undefined && body.amount !== null && typeof body.amount !== 'number') {
      throw new AppError(400, 'amount must be a number or null')
    }

    this.nfcId = body.nfcId
    this.eventId = body.eventId
    this.interactionType = body.interactionType as InteractionType
    this.zoneName = typeof body.zoneName === 'string' ? body.zoneName : null
    this.targetNfcId = typeof body.targetNfcId === 'string' ? body.targetNfcId : null
    this.amount = typeof body.amount === 'number' ? body.amount : null
    this.metadata =
      typeof body.metadata === 'object' && body.metadata !== null ? (body.metadata as Record<string, unknown>) : {}
  }
}
