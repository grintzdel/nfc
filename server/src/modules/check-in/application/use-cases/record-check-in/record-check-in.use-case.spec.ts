import { RecordCheckInUseCase } from './record-check-in.use-case'
import { CheckInRepositoryMock } from '../../../__tests__/check-in.repository.mock'
import { BraceletRepositoryMock } from '@modules/bracelet/__tests__/bracelet.repository.mock'
import { ParticipantRepositoryMock } from '@modules/participant/__tests__/participant.repository.mock'
import { ActivateBraceletUseCase } from '@modules/bracelet/application/use-cases/activate-bracelet/activate-bracelet.use-case'
import { createCheckInFixture } from '../../../__tests__/check-in.factory'
import { createBraceletFixture } from '@modules/bracelet/__tests__/bracelet.factory'
import { createParticipantFixture } from '@modules/participant/__tests__/participant.factory'
import { InteractionType } from '../../../domain/constants/interaction-type.constant'
import { BraceletStatus } from '@modules/bracelet/domain/constants/bracelet-status.constant'
import { CheckInInvalidBraceletStateError, DuplicateCheckInError } from '../../../domain/errors/check-in.error'
import { BraceletNotFoundError } from '@modules/bracelet/domain/errors/bracelet.error'

function makeUseCase() {
  const checkInRepo = new CheckInRepositoryMock()
  const braceletRepo = new BraceletRepositoryMock()
  const participantRepo = new ParticipantRepositoryMock()
  const mockActivate = { execute: jest.fn().mockResolvedValue(undefined) } as unknown as ActivateBraceletUseCase
  const useCase = new RecordCheckInUseCase(checkInRepo, braceletRepo, participantRepo, mockActivate)
  return { checkInRepo, braceletRepo, participantRepo, mockActivate, useCase }
}

describe('RecordCheckInUseCase', () => {
  it('should create check-in for ACTIVE bracelet with NETWORKING — no activate call', async () => {
    const { useCase, braceletRepo, checkInRepo, mockActivate } = makeUseCase()
    const bracelet = createBraceletFixture({ status: BraceletStatus.ACTIVE, nfcId: 'nfc-active-1' })
    braceletRepo.findByNfcId_result = bracelet
    checkInRepo.create_result = createCheckInFixture({ braceletId: bracelet.id, eventId: 'event-1', interactionType: InteractionType.NETWORKING })

    const result = await useCase.execute({ nfcId: 'nfc-active-1', eventId: 'event-1', interactionType: InteractionType.NETWORKING })

    expect(result).toBeDefined()
    expect(result.interactionType).toBe(InteractionType.NETWORKING)
    expect(mockActivate.execute).not.toHaveBeenCalled()
  })

  it('should create check-in AND activate bracelet when PRE_ACTIVATED + CHECK_IN', async () => {
    const { useCase, braceletRepo, checkInRepo, mockActivate } = makeUseCase()
    const bracelet = createBraceletFixture({ status: BraceletStatus.PRE_ACTIVATED, nfcId: 'nfc-pre-1' })
    braceletRepo.findByNfcId_result = bracelet
    checkInRepo.create_result = createCheckInFixture({ braceletId: bracelet.id, eventId: 'event-1', interactionType: InteractionType.CHECK_IN })

    const result = await useCase.execute({ nfcId: 'nfc-pre-1', eventId: 'event-1', interactionType: InteractionType.CHECK_IN })

    expect(result).toBeDefined()
    expect(mockActivate.execute).toHaveBeenCalledWith(bracelet.id)
  })

  it('should throw CheckInInvalidBraceletStateError for STOCK bracelet', async () => {
    const { useCase, braceletRepo } = makeUseCase()
    const bracelet = createBraceletFixture({ status: BraceletStatus.STOCK, nfcId: 'nfc-stock-1' })
    braceletRepo.findByNfcId_result = bracelet

    await expect(
      useCase.execute({ nfcId: 'nfc-stock-1', eventId: 'event-1', interactionType: InteractionType.CHECK_IN }),
    ).rejects.toThrow(CheckInInvalidBraceletStateError)
  })

  it('should throw CheckInInvalidBraceletStateError for DISABLED bracelet', async () => {
    const { useCase, braceletRepo } = makeUseCase()
    const bracelet = createBraceletFixture({ status: BraceletStatus.DISABLED, nfcId: 'nfc-disabled-1' })
    braceletRepo.findByNfcId_result = bracelet

    await expect(
      useCase.execute({ nfcId: 'nfc-disabled-1', eventId: 'event-1', interactionType: InteractionType.CHECK_IN }),
    ).rejects.toThrow(CheckInInvalidBraceletStateError)
  })

  it('should throw BraceletNotFoundError when nfcId not found', async () => {
    const { useCase, braceletRepo } = makeUseCase()
    braceletRepo.findByNfcId_result = null

    await expect(
      useCase.execute({ nfcId: 'nfc-unknown', eventId: 'event-1', interactionType: InteractionType.CHECK_IN }),
    ).rejects.toThrow(BraceletNotFoundError)
  })

  it('should resolve targetBraceletId from targetNfcId when provided', async () => {
    const { useCase, braceletRepo, checkInRepo } = makeUseCase()
    const bracelet = createBraceletFixture({ status: BraceletStatus.ACTIVE, nfcId: 'nfc-main-1' })
    const targetBracelet = createBraceletFixture({ status: BraceletStatus.ACTIVE, nfcId: 'nfc-target-1' })

    braceletRepo.findByNfcId_result = bracelet
    // Override findByNfcId to return target on second call
    const originalFindByNfcId = braceletRepo.findByNfcId.bind(braceletRepo)
    let callCount = 0
    braceletRepo.findByNfcId = async (nfcId: string) => {
      callCount++
      if (callCount === 1) return originalFindByNfcId(nfcId)
      return targetBracelet
    }
    checkInRepo.create_result = createCheckInFixture({
      braceletId: bracelet.id,
      eventId: 'event-1',
      interactionType: InteractionType.NETWORKING,
      targetBraceletId: targetBracelet.id,
    })

    const result = await useCase.execute({
      nfcId: 'nfc-main-1',
      eventId: 'event-1',
      interactionType: InteractionType.NETWORKING,
      targetNfcId: 'nfc-target-1',
    })

    expect(result.targetBraceletId).toBe(targetBracelet.id)
  })

  it('should still return saved check-in even if activation fails', async () => {
    const { useCase, braceletRepo, checkInRepo, mockActivate } = makeUseCase()
    const bracelet = createBraceletFixture({ status: BraceletStatus.PRE_ACTIVATED, nfcId: 'nfc-pre-2' })
    braceletRepo.findByNfcId_result = bracelet
    const saved = createCheckInFixture({ braceletId: bracelet.id, eventId: 'event-1', interactionType: InteractionType.CHECK_IN })
    checkInRepo.create_result = saved
    ;(mockActivate.execute as jest.Mock).mockRejectedValueOnce(new Error('activation failed'))

    const result = await useCase.execute({ nfcId: 'nfc-pre-2', eventId: 'event-1', interactionType: InteractionType.CHECK_IN })

    expect(result).toBe(saved)
  })

  it('should call participant.checkIn() when interactionType is CHECK_IN', async () => {
    const { useCase, braceletRepo, checkInRepo, participantRepo } = makeUseCase()
    const bracelet = createBraceletFixture({ status: BraceletStatus.ACTIVE, nfcId: 'nfc-active-2' })
    braceletRepo.findByNfcId_result = bracelet
    checkInRepo.create_result = createCheckInFixture({ braceletId: bracelet.id, eventId: 'event-1', interactionType: InteractionType.CHECK_IN })
    const participant = createParticipantFixture({ braceletId: bracelet.id })
    participantRepo.findByBraceletId_result = participant

    await useCase.execute({ nfcId: 'nfc-active-2', eventId: 'event-1', interactionType: InteractionType.CHECK_IN })

    expect(participantRepo.update_calledWith).not.toBeNull()
    expect(participantRepo.update_calledWith?.isCheckedIn()).toBe(true)
  })

  it('throws DuplicateCheckInError when a CHECK_IN already exists for the same bracelet+event', async () => {
    const { useCase, braceletRepo, checkInRepo } = makeUseCase()
    const bracelet = createBraceletFixture({ status: BraceletStatus.ACTIVE, nfcId: 'nfc-active-3' })
    braceletRepo.findByNfcId_result = bracelet
    checkInRepo.findOneByBraceletEventType_result = createCheckInFixture({
      braceletId: bracelet.id,
      eventId: 'event-1',
      interactionType: InteractionType.CHECK_IN,
    })

    await expect(
      useCase.execute({ nfcId: 'nfc-active-3', eventId: 'event-1', interactionType: InteractionType.CHECK_IN }),
    ).rejects.toThrow(DuplicateCheckInError)
    expect(checkInRepo.findOneByBraceletEventType_calledWith).toEqual({
      braceletId: bracelet.id,
      eventId: 'event-1',
      type: InteractionType.CHECK_IN,
    })
  })

  it('allows repeated NETWORKING / CASHLESS / VOTE interactions (only CHECK_IN is deduped)', async () => {
    const { useCase, braceletRepo, checkInRepo } = makeUseCase()
    const bracelet = createBraceletFixture({ status: BraceletStatus.ACTIVE, nfcId: 'nfc-active-4' })
    braceletRepo.findByNfcId_result = bracelet
    // Even if a previous one exists, NETWORKING should pass through unchecked.
    checkInRepo.findOneByBraceletEventType_result = createCheckInFixture({
      braceletId: bracelet.id,
      eventId: 'event-1',
      interactionType: InteractionType.NETWORKING,
    })
    checkInRepo.create_result = createCheckInFixture({
      braceletId: bracelet.id,
      eventId: 'event-1',
      interactionType: InteractionType.NETWORKING,
    })

    const result = await useCase.execute({
      nfcId: 'nfc-active-4',
      eventId: 'event-1',
      interactionType: InteractionType.NETWORKING,
    })
    expect(result.interactionType).toBe(InteractionType.NETWORKING)
    expect(checkInRepo.findOneByBraceletEventType_calledWith).toBeNull()
  })
})
