import type { AuthDomainModel } from '../model/auth.domain-model'
import type { IAuthPort } from '../ports/auth.port'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

export class AuthHttpAdapter implements IAuthPort {
  async login(dto: AuthDomainModel.LoginDto): Promise<AuthDomainModel.AuthResponseDto> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
    const json = await response.json()
    if (!json.success) throw new Error(json.error ?? 'Login failed')
    return json.data
  }

  async register(dto: AuthDomainModel.RegisterDto): Promise<AuthDomainModel.AuthResponseDto> {
    const response = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dto),
    })
    const json = await response.json()
    if (!json.success) throw new Error(json.error ?? 'Registration failed')
    return json.data
  }
}
