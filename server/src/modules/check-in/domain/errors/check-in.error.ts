import { AppError } from '@shared/errors/app.error'

export class CheckInInvalidBraceletStateError extends AppError {
  constructor(nfcId: string, status: string) {
    super(400, `Cannot check in bracelet ${nfcId} in state ${status}`)
  }
}
