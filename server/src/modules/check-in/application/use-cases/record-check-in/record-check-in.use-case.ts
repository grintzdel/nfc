import { ActivateBraceletUseCase } from '@modules/bracelet/application/use-cases/activate-bracelet/activate-bracelet.use-case'
import { BraceletNotFoundError } from '@modules/bracelet/domain/errors/bracelet.error'
import { IBraceletRepository } from '@modules/bracelet/domain/repository/bracelet.repository.interface'
import { IParticipantRepository } from '@modules/participant/domain/repository/participant.repository.interface'

import { InteractionType } from '../../../domain/constants/interaction-type.constant'
import { CheckInEntity } from '../../../domain/entity/check-in.entity'
import { CheckInInvalidBraceletStateError, DuplicateCheckInError } from '../../../domain/errors/check-in.error'
import { ICheckInRepository } from '../../../domain/repository/check-in.repository.interface'

export interface RecordCheckInInput {
  nfcId: string
  eventId: string
  interactionType: InteractionType
  zoneName?: Nullable<string>
  targetNfcId?: Nullable<string>
  amount?: Nullable<number>
  metadata?: Record<string, unknown>
}

export class RecordCheckInUseCase {
  constructor(
    private readonly checkInRepository: ICheckInRepository,
    private readonly braceletRepository: IBraceletRepository,
    private readonly participantRepository: IParticipantRepository,
    private readonly activateBraceletUseCase: ActivateBraceletUseCase
  ) {}

  async execute(input: RecordCheckInInput): Promise<CheckInEntity> {
    const bracelet = await this.braceletRepository.findByNfcId(input.nfcId)
    if (!bracelet || bracelet.isDeleted()) throw new BraceletNotFoundError(input.nfcId)

    if (bracelet.isInStock() || bracelet.isDisabled()) {
      throw new CheckInInvalidBraceletStateError(input.nfcId, bracelet.status)
    }

    // Reject duplicate door-entrance check-ins for the same bracelet+event.
    // Other interaction types (networking / vote / cashless) can legitimately repeat.
    if (input.interactionType === InteractionType.CHECK_IN) {
      const existing = await this.checkInRepository.findOneByBraceletEventType(
        bracelet.id,
        input.eventId,
        InteractionType.CHECK_IN
      )
      if (existing) throw new DuplicateCheckInError(input.nfcId)
    }

    let targetBraceletId: Nullable<string> = null
    if (input.targetNfcId) {
      const target = await this.braceletRepository.findByNfcId(input.targetNfcId)
      targetBraceletId = target?.id ?? null
    }

    const checkIn = CheckInEntity.create({
      braceletId: bracelet.id,
      eventId: input.eventId,
      interactionType: input.interactionType,
      zoneName: input.zoneName ?? null,
      targetBraceletId,
      amount: input.amount ?? null,
      metadata: input.metadata ?? {},
    })
    const saved = await this.checkInRepository.create(checkIn)

    // Side-effect: if PRE_ACTIVATED + CHECK_IN, activate bracelet
    if (bracelet.isPreActivated() && input.interactionType === InteractionType.CHECK_IN) {
      try {
        await this.activateBraceletUseCase.execute(bracelet.id)
      } catch (err) {
        console.error('[check-in] failed to activate bracelet', bracelet.id, err)
      }
    }

    // Side-effect: if CHECK_IN, mark the linked participant as checked in
    if (input.interactionType === InteractionType.CHECK_IN) {
      try {
        const participant = await this.participantRepository.findByBraceletId(bracelet.id)
        if (participant) {
          participant.checkIn()
          await this.participantRepository.update(participant)
        }
      } catch (err) {
        console.error('[check-in] failed to mark participant checked in', bracelet.id, err)
      }
    }

    return saved
  }
}
