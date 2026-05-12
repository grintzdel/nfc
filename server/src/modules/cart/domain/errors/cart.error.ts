import { AppError } from '@shared/errors/app.error'

export class CartItemNotFoundError extends AppError {
  constructor(id: string) {
    super(404, `Cart item "${id}" not found`)
  }
}
