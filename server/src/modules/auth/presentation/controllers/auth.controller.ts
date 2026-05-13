import { Request, Response, NextFunction } from 'express'

import { AuthService } from '../../application/services/auth.service'
import { AuthResponseDto } from '../dto/auth.response.dto'
import { LoginRequestDto } from '../dto/login.request.dto'
import { RegisterRequestDto } from '../dto/register.request.dto'

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new RegisterRequestDto(req.body)
      const result = await this.authService.register(dto)
      const response = new AuthResponseDto(result)
      res.status(201).json({ success: true, data: response })
    } catch (error) {
      next(error)
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new LoginRequestDto(req.body)
      const result = await this.authService.login(dto)
      const response = new AuthResponseDto(result)
      res.status(200).json({ success: true, data: response })
    } catch (error) {
      next(error)
    }
  }
}
