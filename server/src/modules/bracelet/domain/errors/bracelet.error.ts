import { AppError } from '@shared/errors/app.error'

export class BraceletNotFoundError extends AppError {
  constructor(id: string) {
    super(404, `Bracelet ${id} not found`)
  }
}

export class BraceletInvalidStatusError extends AppError {
  constructor(from: string, action: string) {
    super(400, `Cannot ${action} a bracelet in status ${from}`)
  }
}

export class BraceletNfcIdAlreadyTakenError extends AppError {
  constructor(nfcId: string) {
    super(409, `Bracelet with NFC id ${nfcId} already exists`)
  }
}
