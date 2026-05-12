import { AppError } from '@shared/errors/app.error'

export class SupplyOrderNotFoundError extends AppError {
  constructor(id: string) { super(404, `Supply order ${id} not found`) }
}

export class SupplyOrderInvalidStatusError extends AppError {
  constructor(from: string, action: string) { super(400, `Cannot ${action} a supply order in status ${from}`) }
}
