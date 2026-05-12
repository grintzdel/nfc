import { AppError } from '@shared/errors/app.error'

export class CreateBraceletRequestDto {
  nfcId: Nullable<string>
  productId: Nullable<string>

  constructor(body: Record<string, unknown>) {
    if (body.nfcId !== undefined && typeof body.nfcId !== 'string') {
      throw new AppError(400, 'nfcId must be a string')
    }
    if (body.productId !== undefined && typeof body.productId !== 'string') {
      throw new AppError(400, 'productId must be a string')
    }
    this.nfcId = typeof body.nfcId === 'string' ? body.nfcId : null
    this.productId = typeof body.productId === 'string' ? body.productId : null
  }
}
