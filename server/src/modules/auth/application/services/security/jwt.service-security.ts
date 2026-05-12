import jwt from 'jsonwebtoken'
import type { StringValue } from 'ms'

export class JwtServiceSecurity {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: StringValue
  ) {}

  generate(payload: Record<string, unknown>): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn })
  }

  verify(token: string): Record<string, unknown> {
    return jwt.verify(token, this.secret) as Record<string, unknown>
  }
}
