import type { AuthDomainModel } from '../model/auth.domain-model'

export interface IAuthPort {
  login(dto: AuthDomainModel.LoginDto): Promise<AuthDomainModel.AuthResponseDto>
  register(dto: AuthDomainModel.RegisterDto): Promise<AuthDomainModel.AuthResponseDto>
}
