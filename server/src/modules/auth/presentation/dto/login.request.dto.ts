import { AppError } from '@shared/errors/app.error'

export class LoginRequestDto {
  public readonly email: string
  public readonly password: string

  constructor(body: Record<string, unknown>) {
    if (!body.email || typeof body.email !== 'string') {
      throw new AppError(400, 'Email is required')
    }
    if (!body.password || typeof body.password !== 'string') {
      throw new AppError(400, 'Password is required')
    }

    this.email = (body.email as string).toLowerCase().trim()
    this.password = body.password as string
  }
}
