import { TeamMemberEntity, TeamMemberEntityProps } from './team-member.entity'
import { TeamRole } from '../constants/team-role.constant'
import { TeamMemberAlreadyAcceptedError, TeamMemberInvalidRoleError } from '../errors/team.error'

function makeProps(overrides: Partial<TeamMemberEntityProps> = {}): TeamMemberEntityProps {
  const now = new Date()
  return {
    id: 'tm-1',
    userId: 'user-1',
    eventId: 'event-1',
    role: TeamRole.STAFF,
    invitedAt: now,
    invitedBy: 'owner-1',
    acceptedAt: null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    ...overrides,
  }
}

describe('TeamMemberEntity', () => {
  describe('create()', () => {
    it('should create with defaults when minimal props given', () => {
      const member = TeamMemberEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        role: TeamRole.MANAGER,
        invitedBy: 'owner-1',
      })
      expect(member.userId).toBe('user-1')
      expect(member.eventId).toBe('event-1')
      expect(member.role).toBe(TeamRole.MANAGER)
      expect(member.invitedBy).toBe('owner-1')
      expect(member.acceptedAt).toBeNull()
      expect(member.deletedAt).toBeNull()
      expect(member.invitedAt).toBeInstanceOf(Date)
      expect(member.createdAt).toBeInstanceOf(Date)
      expect(member.updatedAt).toBeInstanceOf(Date)
    })

    it('should throw when role is OWNER', () => {
      expect(() =>
        TeamMemberEntity.create({
          userId: 'user-1',
          eventId: 'event-1',
          role: TeamRole.OWNER,
          invitedBy: 'owner-1',
        }),
      ).toThrow('Cannot create OWNER team member — OWNER is stored on EventEntity.ownerId')
    })

    it('should throw when userId is missing', () => {
      expect(() =>
        TeamMemberEntity.create({ eventId: 'event-1', role: TeamRole.STAFF, invitedBy: 'owner-1' }),
      ).toThrow('userId is required')
    })

    it('should throw when eventId is missing', () => {
      expect(() =>
        TeamMemberEntity.create({ userId: 'user-1', role: TeamRole.STAFF, invitedBy: 'owner-1' }),
      ).toThrow('eventId is required')
    })

    it('should throw when invitedBy is missing', () => {
      expect(() =>
        TeamMemberEntity.create({ userId: 'user-1', eventId: 'event-1', role: TeamRole.STAFF }),
      ).toThrow('invitedBy is required')
    })
  })

  describe('accept()', () => {
    it('should set acceptedAt and update updatedAt', () => {
      const before = new Date(Date.now() - 1000)
      const member = TeamMemberEntity.fromProps(makeProps({ updatedAt: before }))
      member.accept()
      expect(member.acceptedAt).toBeInstanceOf(Date)
      expect(member.isAccepted()).toBe(true)
      expect(member.updatedAt.getTime()).toBeGreaterThan(before.getTime())
    })

    it('should throw TeamMemberAlreadyAcceptedError if already accepted', () => {
      const member = TeamMemberEntity.fromProps(makeProps({ acceptedAt: new Date() }))
      expect(() => member.accept()).toThrow(TeamMemberAlreadyAcceptedError)
    })
  })

  describe('changeRole()', () => {
    it('should change role from STAFF to MANAGER', () => {
      const member = TeamMemberEntity.fromProps(makeProps({ role: TeamRole.STAFF }))
      member.changeRole(TeamRole.MANAGER)
      expect(member.role).toBe(TeamRole.MANAGER)
    })

    it('should throw TeamMemberInvalidRoleError when changing to OWNER', () => {
      const member = TeamMemberEntity.fromProps(makeProps())
      expect(() => member.changeRole(TeamRole.OWNER)).toThrow(TeamMemberInvalidRoleError)
    })
  })

  describe('softDelete()', () => {
    it('should set deletedAt and update updatedAt', () => {
      const member = TeamMemberEntity.fromProps(makeProps())
      expect(member.isDeleted()).toBe(false)
      member.softDelete()
      expect(member.deletedAt).toBeInstanceOf(Date)
      expect(member.isDeleted()).toBe(true)
    })

    it('should not overwrite deletedAt if already set', () => {
      const firstDeletion = new Date(Date.now() - 10000)
      const member = TeamMemberEntity.fromProps(makeProps({ deletedAt: firstDeletion }))
      member.softDelete()
      expect(member.deletedAt).toBe(firstDeletion)
    })
  })

  describe('toJSON()', () => {
    it('should serialize all props', () => {
      const now = new Date()
      const member = TeamMemberEntity.fromProps(makeProps({ id: 'tm-42', createdAt: now, updatedAt: now }))
      const json = member.toJSON()
      expect(json.id).toBe('tm-42')
      expect(json.userId).toBe('user-1')
      expect(json.eventId).toBe('event-1')
      expect(json.role).toBe(TeamRole.STAFF)
      expect(json.invitedBy).toBe('owner-1')
      expect(json.acceptedAt).toBeNull()
      expect(json.deletedAt).toBeNull()
    })
  })
})
