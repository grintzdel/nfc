import { Request, Response, NextFunction } from 'express'
import { AppError } from '../errors/app.error'
import { JwtServiceSecurity } from '../../modules/auth/application/services/security/jwt.service-security'

export function createAuthMiddleware(jwtService: JwtServiceSecurity) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const header = req.headers.authorization
    if (!header || !header.startsWith('Bearer ')) {
      next(new AppError(401, 'Missing or invalid token'))
      return
    }

    try {
      const token = header.split(' ')[1]
      const payload = jwtService.verify(token)
      req.user = { userId: payload.userId as string, role: payload.role as string }
      next()
    } catch {
      next(new AppError(401, 'Invalid or expired token'))
    }
  }
}

export function createAdminMiddleware() {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== 'admin') {
      next(new AppError(403, 'Admin access required'))
      return
    }
    next()
  }
}
