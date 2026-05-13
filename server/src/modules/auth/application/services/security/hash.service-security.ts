import bcrypt from 'bcryptjs'

import { AuthConstant } from '../../../domain/constants/auth.constant'

export class HashServiceSecurity {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, AuthConstant.SALT_ROUNDS)
  }

  async compare(plain: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(plain, hashed)
  }
}
