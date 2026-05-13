import { UserRole } from '@modules/auth/domain/constants/auth.constant'
import { UserEntity } from '@modules/auth/domain/entity/user.entity'
import { IUserRepository } from '@modules/auth/domain/repository/user.repository.interface'
import { createEventFixture } from '@modules/event/__tests__/event.factory'
import { EventRepositoryMock } from '@modules/event/__tests__/event.repository.mock'
import { EventNotFoundError } from '@modules/event/domain/errors/event.error'
import { AppError } from '@shared/errors/app.error'

import { createTeamMemberFixture } from '../../../__tests__/team-member.factory'
import { TeamMemberRepositoryMock } from '../../../__tests__/team-member.repository.mock'
import { TeamRole } from '../../../domain/constants/team-role.constant'
import {
  TeamMemberAlreadyExistsError,
  TeamMemberInvalidRoleError,
  TeamMemberNotAuthorizedError,
} from '../../../domain/errors/team.error'
import { InviteTeamMemberUseCase } from './invite-team-member.use-case'

function makeUserFixture(): UserEntity {
  return UserEntity.fromProps({
    id: 'target-1',
    email: 'target@example.com',
    password: 'hashed',
    firstName: 'Target',
    lastName: 'User',
    role: UserRole.CUSTOMER,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  })
}

function makeUserRepoMock(user: UserEntity | null = makeUserFixture()): jest.Mocked<IUserRepository> {
  return {
    findByEmail: jest.fn(),
    findById: jest.fn().mockResolvedValue(user),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  }
}

describe('InviteTeamMemberUseCase', () => {
  let useCase: InviteTeamMemberUseCase
  let teamMemberRepo: TeamMemberRepositoryMock
  let eventRepo: EventRepositoryMock
  let userRepo: jest.Mocked<IUserRepository>

  const OWNER_ID = 'owner-1'
  const TARGET_USER_ID = 'target-1'
  const EVENT_ID = 'event-1'

  beforeEach(() => {
    teamMemberRepo = new TeamMemberRepositoryMock()
    eventRepo = new EventRepositoryMock()
    userRepo = makeUserRepoMock()
    useCase = new InviteTeamMemberUseCase(teamMemberRepo, eventRepo, userRepo)
    eventRepo.findById_result = createEventFixture({ id: EVENT_ID, ownerId: OWNER_ID })
  })

  it('should create a team member when event owner invites a STAFF', async () => {
    teamMemberRepo.findByUserAndEvent_result = null

    const result = await useCase.execute({
      inviterUserId: OWNER_ID,
      eventId: EVENT_ID,
      targetUserId: TARGET_USER_ID,
      role: TeamRole.STAFF,
    })

    expect(result).toBeDefined()
    expect(teamMemberRepo.create_calledWith).not.toBeNull()
    expect(teamMemberRepo.create_calledWith!.userId).toBe(TARGET_USER_ID)
    expect(teamMemberRepo.create_calledWith!.role).toBe(TeamRole.STAFF)
  })

  it('should allow an accepted MANAGER to invite', async () => {
    const managerMember = createTeamMemberFixture({
      userId: 'manager-1',
      eventId: EVENT_ID,
      role: TeamRole.MANAGER,
      acceptedAt: new Date(),
    })
    // first call: auth check for manager-1
    // second call: duplicate check for target user
    let callCount = 0
    teamMemberRepo.findByUserAndEvent = jest.fn().mockImplementation(async () => {
      callCount++
      if (callCount === 1) return managerMember
      return null
    })

    const result = await useCase.execute({
      inviterUserId: 'manager-1',
      eventId: EVENT_ID,
      targetUserId: TARGET_USER_ID,
      role: TeamRole.STAFF,
    })

    expect(result).toBeDefined()
  })

  it('should throw TeamMemberNotAuthorizedError when caller is not owner or accepted manager', async () => {
    teamMemberRepo.findByUserAndEvent_result = null

    await expect(
      useCase.execute({
        inviterUserId: 'random-user',
        eventId: EVENT_ID,
        targetUserId: TARGET_USER_ID,
        role: TeamRole.STAFF,
      })
    ).rejects.toThrow(TeamMemberNotAuthorizedError)
  })

  it('should throw EventNotFoundError when event does not exist', async () => {
    eventRepo.findById_result = null

    await expect(
      useCase.execute({
        inviterUserId: OWNER_ID,
        eventId: EVENT_ID,
        targetUserId: TARGET_USER_ID,
        role: TeamRole.STAFF,
      })
    ).rejects.toThrow(EventNotFoundError)
  })

  it('should throw AppError(404) when target user does not exist', async () => {
    userRepo.findById.mockResolvedValue(null)

    await expect(
      useCase.execute({
        inviterUserId: OWNER_ID,
        eventId: EVENT_ID,
        targetUserId: TARGET_USER_ID,
        role: TeamRole.STAFF,
      })
    ).rejects.toMatchObject({ statusCode: 404 })
    await expect(
      useCase.execute({
        inviterUserId: OWNER_ID,
        eventId: EVENT_ID,
        targetUserId: TARGET_USER_ID,
        role: TeamRole.STAFF,
      })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('should throw TeamMemberAlreadyExistsError when target is already a team member', async () => {
    const existing = createTeamMemberFixture({
      userId: TARGET_USER_ID,
      eventId: EVENT_ID,
    })
    teamMemberRepo.findByUserAndEvent_result = existing

    await expect(
      useCase.execute({
        inviterUserId: OWNER_ID,
        eventId: EVENT_ID,
        targetUserId: TARGET_USER_ID,
        role: TeamRole.STAFF,
      })
    ).rejects.toThrow(TeamMemberAlreadyExistsError)
  })

  it('should throw TeamMemberInvalidRoleError when trying to invite with OWNER role', async () => {
    await expect(
      useCase.execute({
        inviterUserId: OWNER_ID,
        eventId: EVENT_ID,
        targetUserId: TARGET_USER_ID,
        role: TeamRole.OWNER,
      })
    ).rejects.toThrow(TeamMemberInvalidRoleError)
  })
})
