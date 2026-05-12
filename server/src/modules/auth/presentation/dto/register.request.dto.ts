import { AppError } from '@shared/errors/app.error'

export class RegisterRequestDto {
  public readonly email: string
  public readonly password: string
  public readonly firstName: string
  public readonly lastName: string

  constructor(body: Record<string, unknown>) {
    if (!body.email || typeof body.email !== 'string') {
      throw new AppError(400, 'Email is required')
    }
    if (!body.password || typeof body.password !== 'string') {
      throw new AppError(400, 'Password is required')
    }
    if (typeof body.password === 'string' && body.password.length < 6) {
      throw new AppError(400, 'Password must be at least 6 characters')
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email as string)) {
      throw new AppError(400, 'Invalid email format')
    }

    this.email = (body.email as string).toLowerCase().trim()
    this.password = body.password as string
    this.firstName = (body.firstName as string) ?? ''
    this.lastName = (body.lastName as string) ?? ''
  }
}
