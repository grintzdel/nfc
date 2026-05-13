import { createEventFixture } from '@modules/event/__tests__/event.factory'
import { EventRepositoryMock } from '@modules/event/__tests__/event.repository.mock'

import { createParticipantFixture } from '../../../__tests__/participant.factory'
import { ParticipantRepositoryMock } from '../../../__tests__/participant.repository.mock'
import { GetMyParticipationsUseCase } from './get-my-participations.use-case'

describe('GetMyParticipationsUseCase', () => {
  let participantRepo: ParticipantRepositoryMock
  let eventRepo: EventRepositoryMock
  let useCase: GetMyParticipationsUseCase

  beforeEach(() => {
    participantRepo = new ParticipantRepositoryMock()
    eventRepo = new EventRepositoryMock()
    useCase = new GetMyParticipationsUseCase(participantRepo, eventRepo)
  })

  it('returns an empty array when the user has no participations', async () => {
    participantRepo.findAllByUserId_result = []

    const result = await useCase.execute('user-1')

    expect(result).toEqual([])
    expect(eventRepo.findAllByIds_calledWith).toBeNull()
  })

  it('enriches each participation with its event summary', async () => {
    const p1 = createParticipantFixture({ id: 'p1', userId: 'u1', eventId: 'e1' })
    const p2 = createParticipantFixture({ id: 'p2', userId: 'u1', eventId: 'e2' })
    const e1 = createEventFixture({ id: 'e1', name: 'Event One' })
    const e2 = createEventFixture({ id: 'e2', name: 'Event Two' })

    participantRepo.findAllByUserId_result = [p1, p2]
    eventRepo.findAllByIds_result = [e1, e2]

    const result = await useCase.execute('u1')

    expect(eventRepo.findAllByIds_calledWith).toEqual(['e1', 'e2'])
    expect(result).toHaveLength(2)
    expect(result.map((it) => it.participant.id)).toEqual(expect.arrayContaining(['p1', 'p2']))
    const r1 = result.find((it) => it.participant.id === 'p1')!
    expect(r1.event?.id).toBe('e1')
    expect(r1.event?.name).toBe('Event One')
  })

  it('returns event=null when the event has been deleted (or missing from repo)', async () => {
    const p1 = createParticipantFixture({ id: 'p1', userId: 'u1', eventId: 'e1' })
    participantRepo.findAllByUserId_result = [p1]
    eventRepo.findAllByIds_result = [] // event missing/soft-deleted

    const result = await useCase.execute('u1')

    expect(result).toHaveLength(1)
    expect(result[0]!.participant.id).toBe('p1')
    expect(result[0]!.event).toBeNull()
  })

  it('sorts results by registeredAt DESC (most recent first)', async () => {
    const old = createParticipantFixture({ id: 'p-old', registeredAt: new Date('2026-01-01') })
    const recent = createParticipantFixture({ id: 'p-recent', registeredAt: new Date('2026-05-10') })
    const middle = createParticipantFixture({ id: 'p-middle', registeredAt: new Date('2026-03-15') })
    participantRepo.findAllByUserId_result = [old, recent, middle]
    eventRepo.findAllByIds_result = []

    const result = await useCase.execute('u1')

    expect(result.map((it) => it.participant.id)).toEqual(['p-recent', 'p-middle', 'p-old'])
  })
})
