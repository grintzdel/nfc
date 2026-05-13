import { ParticipantEntity, ParticipantProfile } from '../../domain/entity/participant.entity'
import { AttachBraceletUseCase } from '../use-cases/attach-bracelet/attach-bracelet.use-case'
import {
  GetMyParticipationsUseCase,
  ParticipantWithEvent,
} from '../use-cases/get-my-participations/get-my-participations.use-case'
import {
  GetPaginatedParticipantsByEventUseCase,
  ParticipantWithBracelet,
} from '../use-cases/get-paginated-participants-by-event/get-paginated-participants-by-event.use-case'
import {
  GetPaginatedParticipantsUseCase,
  ParticipantWithEventItem,
} from '../use-cases/get-paginated-participants/get-paginated-participants.use-case'
import { GetParticipantByIdUseCase } from '../use-cases/get-participant-by-id/get-participant-by-id.use-case'
import { GetParticipantsByEventUseCase } from '../use-cases/get-participants-by-event/get-participants-by-event.use-case'
import {
  RegisterParticipantUseCase,
  RegisterParticipantInput,
} from '../use-cases/register-participant/register-participant.use-case'
import { UnregisterParticipantUseCase } from '../use-cases/unregister-participant/unregister-participant.use-case'
import { UpdateParticipantProfileUseCase } from '../use-cases/update-participant-profile/update-participant-profile.use-case'

export class ParticipantService {
  constructor(
    private readonly registerParticipantUseCase: RegisterParticipantUseCase,
    private readonly getParticipantByIdUseCase: GetParticipantByIdUseCase,
    private readonly getMyParticipationsUseCase: GetMyParticipationsUseCase,
    private readonly getParticipantsByEventUseCase: GetParticipantsByEventUseCase,
    private readonly getPaginatedParticipantsByEventUseCase: GetPaginatedParticipantsByEventUseCase,
    private readonly getPaginatedParticipantsUseCase: GetPaginatedParticipantsUseCase,
    private readonly updateParticipantProfileUseCase: UpdateParticipantProfileUseCase,
    private readonly attachBraceletUseCase: AttachBraceletUseCase,
    private readonly unregisterParticipantUseCase: UnregisterParticipantUseCase
  ) {}

  register(input: RegisterParticipantInput): Promise<ParticipantEntity> {
    return this.registerParticipantUseCase.execute(input)
  }

  getById(id: string): Promise<ParticipantEntity> {
    return this.getParticipantByIdUseCase.execute(id)
  }

  getMyParticipations(userId: string): Promise<ParticipantWithEvent[]> {
    return this.getMyParticipationsUseCase.execute(userId)
  }

  getByEvent(eventId: string): Promise<ParticipantEntity[]> {
    return this.getParticipantsByEventUseCase.execute(eventId)
  }

  getPaginatedByEvent(params: {
    eventId: string
    page: number
    limit: number
    search?: string
  }): Promise<PaginatedResult<ParticipantWithBracelet>> {
    return this.getPaginatedParticipantsByEventUseCase.execute(params)
  }

  getPaginated(params: {
    page: number
    limit: number
    checkedIn?: boolean
    search?: string
  }): Promise<PaginatedResult<ParticipantWithEventItem>> {
    return this.getPaginatedParticipantsUseCase.execute(params)
  }

  updateProfile(
    participantId: string,
    callerUserId: string,
    partial: Partial<ParticipantProfile>
  ): Promise<ParticipantEntity> {
    return this.updateParticipantProfileUseCase.execute(participantId, callerUserId, partial)
  }

  attachBracelet(participantId: string, braceletId: string): Promise<ParticipantEntity> {
    return this.attachBraceletUseCase.execute(participantId, braceletId)
  }

  unregister(participantId: string, callerUserId: string): Promise<void> {
    return this.unregisterParticipantUseCase.execute(participantId, callerUserId)
  }
}
