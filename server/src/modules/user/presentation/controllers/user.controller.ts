import { Request, Response, NextFunction } from 'express'
import { UserService } from '../../application/services/user.service'
import { UserResponseDto } from '../dto/user.response.dto'
import { UpdateUserRequestDto } from '../dto/update-user.request.dto'

export class UserController {
  constructor(private readonly userService: UserService) {}

  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await this.userService.getMe(req.user!.userId)
      res.status(200).json({ success: true, data: new UserResponseDto(user) })
    } catch (error) { next(error) }
  }

  async updateMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = new UpdateUserRequestDto(req.body)
      const user = await this.userService.updateMe(req.user!.userId, dto)
      res.status(200).json({ success: true, data: new UserResponseDto(user) })
    } catch (error) { next(error) }
  }

  async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await this.userService.getAllUsers()
      res.status(200).json({ success: true, data: users.map((u) => new UserResponseDto(u)) })
    } catch (error) { next(error) }
  }
}
