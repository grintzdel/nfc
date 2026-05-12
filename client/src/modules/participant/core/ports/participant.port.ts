import type { ParticipantDomainModel } from '../model/participant.domain-model'

export interface IParticipantPort {
  register(dto: ParticipantDomainModel.RegisterParticipantDto): Promise<ParticipantDomainModel.ParticipantOverviewDto>
  getMyParticipations(): Promise<ParticipantDomainModel.ParticipantOverviewDto[]>
  getByEvent(eventId: string): Promise<ParticipantDomainModel.ParticipantOverviewDto[]>
  getPaginatedByEvent(params: {
    eventId: string
    page: number
    limit: number
    search?: string
  }): Promise<ParticipantDomainModel.PaginatedParticipantsDto>
  getById(id: string): Promise<ParticipantDomainModel.ParticipantOverviewDto>
  updateProfile(id: string, dto: ParticipantDomainModel.UpdateParticipantProfileDto): Promise<ParticipantDomainModel.ParticipantOverviewDto>
  attachBracelet(id: string, dto: ParticipantDomainModel.AttachBraceletDto): Promise<ParticipantDomainModel.ParticipantOverviewDto>
  unregister(id: string): Promise<void>
}
