import { ParticipantEntity } from './participant.entity'

describe('ParticipantEntity', () => {
  describe('create()', () => {
    it('should create with defaults when minimal props given', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, linkedinUrl: null, bio: null },
      })
      expect(p.userId).toBe('user-1')
      expect(p.eventId).toBe('event-1')
      expect(p.braceletId).toBeNull()
      expect(p.checkedInAt).toBeNull()
      expect(p.deletedAt).toBeNull()
      expect(p.registeredAt).toBeInstanceOf(Date)
      expect(p.profile.role).toBeNull()
      expect(p.profile.linkedinUrl).toBeNull()
      expect(p.profile.bio).toBeNull()
    })

    it('should default optional profile fields to null when not provided', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, linkedinUrl: null, bio: null },
      })
      expect(p.profile.role).toBeNull()
      expect(p.profile.linkedinUrl).toBeNull()
      expect(p.profile.bio).toBeNull()
    })

    it('should throw when userId is missing', () => {
      expect(() =>
        ParticipantEntity.create({
          eventId: 'event-1',
          profile: { displayName: 'Alice', role: null, linkedinUrl: null, bio: null },
        }),
      ).toThrow('userId is required')
    })

    it('should throw when eventId is missing', () => {
      expect(() =>
        ParticipantEntity.create({
          userId: 'user-1',
          profile: { displayName: 'Alice', role: null, linkedinUrl: null, bio: null },
        }),
      ).toThrow('eventId is required')
    })

    it('should throw when displayName is missing', () => {
      expect(() =>
        ParticipantEntity.create({
          userId: 'user-1',
          eventId: 'event-1',
          profile: { displayName: '', role: null, linkedinUrl: null, bio: null },
        }),
      ).toThrow('displayName is required')
    })
  })

  describe('attachBracelet()', () => {
    it('should set braceletId and update updatedAt', () => {
      const before = new Date(Date.now() - 1000)
      const p = ParticipantEntity.fromProps({
        id: 'p-1',
        userId: 'user-1',
        eventId: 'event-1',
        braceletId: null,
        profile: { displayName: 'Alice', role: null, linkedinUrl: null, bio: null },
        registeredAt: before,
        checkedInAt: null,
        createdAt: before,
        updatedAt: before,
        deletedAt: null,
      })
      p.attachBracelet('bracelet-1')
      expect(p.braceletId).toBe('bracelet-1')
      expect(p.updatedAt.getTime()).toBeGreaterThan(before.getTime())
      expect(p.hasBracelet()).toBe(true)
    })
  })

  describe('checkIn()', () => {
    it('should set checkedInAt and update updatedAt', () => {
      const before = new Date(Date.now() - 1000)
      const p = ParticipantEntity.fromProps({
        id: 'p-1',
        userId: 'user-1',
        eventId: 'event-1',
        braceletId: null,
        profile: { displayName: 'Alice', role: null, linkedinUrl: null, bio: null },
        registeredAt: before,
        checkedInAt: null,
        createdAt: before,
        updatedAt: before,
        deletedAt: null,
      })
      expect(p.isCheckedIn()).toBe(false)
      p.checkIn()
      expect(p.checkedInAt).toBeInstanceOf(Date)
      expect(p.isCheckedIn()).toBe(true)
    })
  })

  describe('updateProfile()', () => {
    it('should patch profile fields', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, linkedinUrl: null, bio: null },
      })
      p.updateProfile({ displayName: 'Bob', role: 'Speaker', bio: 'Short bio' })
      expect(p.profile.displayName).toBe('Bob')
      expect(p.profile.role).toBe('Speaker')
      expect(p.profile.bio).toBe('Short bio')
    })

    it('should throw when displayName is set to empty string', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, linkedinUrl: null, bio: null },
      })
      expect(() => p.updateProfile({ displayName: '   ' })).toThrow('displayName cannot be empty')
    })
  })

  describe('softDelete()', () => {
    it('should set deletedAt', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, linkedinUrl: null, bio: null },
      })
      expect(p.isDeleted()).toBe(false)
      p.softDelete()
      expect(p.deletedAt).toBeInstanceOf(Date)
      expect(p.isDeleted()).toBe(true)
    })

    it('should not overwrite deletedAt if already set', () => {
      const firstDeletion = new Date(Date.now() - 10000)
      const p = ParticipantEntity.fromProps({
        id: 'p-1',
        userId: 'user-1',
        eventId: 'event-1',
        braceletId: null,
        profile: { displayName: 'Alice', role: null, linkedinUrl: null, bio: null },
        registeredAt: new Date(),
        checkedInAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: firstDeletion,
      })
      p.softDelete()
      expect(p.deletedAt).toBe(firstDeletion)
    })
  })

  describe('toJSON()', () => {
    it('should serialize all props', () => {
      const now = new Date()
      const p = ParticipantEntity.fromProps({
        id: 'p-1',
        userId: 'user-1',
        eventId: 'event-1',
        braceletId: null,
        profile: { displayName: 'Alice', role: 'VIP', linkedinUrl: null, bio: null },
        registeredAt: now,
        checkedInAt: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      })
      const json = p.toJSON()
      expect(json.id).toBe('p-1')
      expect(json.userId).toBe('user-1')
      expect(json.profile.displayName).toBe('Alice')
      expect(json.profile.role).toBe('VIP')
      expect(json.braceletId).toBeNull()
    })
  })
})
