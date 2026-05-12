import { AppError } from '@shared/errors/app.error'

export class AttachBraceletRequestDto {
  braceletId: string

  constructor(body: Record<string, unknown>) {
    if (typeof body.braceletId !== 'string' || !body.braceletId) throw new AppError(400, 'braceletId is required')
    this.braceletId = body.braceletId
  }
}
