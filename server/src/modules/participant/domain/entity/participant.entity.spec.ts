import { ProfileLinkType } from '../constants/profile-link-type.constant'
import { ParticipantEntity } from './participant.entity'

const baseProps = {
  id: 'p-1',
  userId: 'user-1',
  eventId: 'event-1',
  braceletId: null,
  profile: { displayName: 'Alice', role: null, bio: null, links: [] },
  registeredAt: new Date(),
  checkedInAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
}

describe('ParticipantEntity', () => {
  describe('create()', () => {
    it('should create with defaults when minimal props given', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, bio: null, links: [] },
      })
      expect(p.userId).toBe('user-1')
      expect(p.eventId).toBe('event-1')
      expect(p.braceletId).toBeNull()
      expect(p.checkedInAt).toBeNull()
      expect(p.deletedAt).toBeNull()
      expect(p.registeredAt).toBeInstanceOf(Date)
      expect(p.profile.role).toBeNull()
      expect(p.profile.bio).toBeNull()
      expect(p.profile.links).toEqual([])
    })

    it('should default links to [] when omitted', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        // links intentionally omitted to exercise the `?? []` default in create()
        profile: { displayName: 'Alice', role: null, bio: null } as never,
      })
      expect(p.profile.links).toEqual([])
    })

    it('should throw when userId is missing', () => {
      expect(() =>
        ParticipantEntity.create({
          eventId: 'event-1',
          profile: { displayName: 'Alice', role: null, bio: null, links: [] },
        }),
      ).toThrow('userId is required')
    })

    it('should throw when eventId is missing', () => {
      expect(() =>
        ParticipantEntity.create({
          userId: 'user-1',
          profile: { displayName: 'Alice', role: null, bio: null, links: [] },
        }),
      ).toThrow('eventId is required')
    })

    it('should throw when displayName is missing', () => {
      expect(() =>
        ParticipantEntity.create({
          userId: 'user-1',
          eventId: 'event-1',
          profile: { displayName: '', role: null, bio: null, links: [] },
        }),
      ).toThrow('displayName is required')
    })
  })

  describe('attachBracelet()', () => {
    it('should set braceletId and update updatedAt', () => {
      const before = new Date(Date.now() - 1000)
      const p = ParticipantEntity.fromProps({ ...baseProps, updatedAt: before, createdAt: before, registeredAt: before })
      p.attachBracelet('bracelet-1')
      expect(p.braceletId).toBe('bracelet-1')
      expect(p.updatedAt.getTime()).toBeGreaterThan(before.getTime())
      expect(p.hasBracelet()).toBe(true)
    })
  })

  describe('checkIn()', () => {
    it('should set checkedInAt and update updatedAt', () => {
      const before = new Date(Date.now() - 1000)
      const p = ParticipantEntity.fromProps({ ...baseProps, updatedAt: before, createdAt: before, registeredAt: before })
      expect(p.isCheckedIn()).toBe(false)
      p.checkIn()
      expect(p.checkedInAt).toBeInstanceOf(Date)
      expect(p.isCheckedIn()).toBe(true)
    })
  })

  describe('updateProfile()', () => {
    it('should patch displayName, role, and bio', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, bio: null, links: [] },
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
        profile: { displayName: 'Alice', role: null, bio: null, links: [] },
      })
      expect(() => p.updateProfile({ displayName: '   ' })).toThrow('displayName cannot be empty')
    })

    it('should accept updateProfile with 3 valid links', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, bio: null, links: [] },
      })
      p.updateProfile({
        links: [
          { type: ProfileLinkType.LINKEDIN, url: 'https://linkedin.com/in/alice', label: null },
          { type: ProfileLinkType.GITHUB, url: 'https://github.com/alice', label: null },
          { type: ProfileLinkType.WEBSITE, url: 'https://alice.dev', label: null },
        ],
      })
      expect(p.profile.links).toHaveLength(3)
    })

    it('should throw Invalid link type for unknown type', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, bio: null, links: [] },
      })
      expect(() =>
        p.updateProfile({
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          links: [{ type: 'fax' as any, url: 'https://example.com', label: null }],
        }),
      ).toThrow('Invalid link type')
    })

    it('should throw Invalid link URL for non-https URL on non-email type', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, bio: null, links: [] },
      })
      expect(() =>
        p.updateProfile({
          links: [{ type: ProfileLinkType.WEBSITE, url: 'ftp://bad.com', label: null }],
        }),
      ).toThrow('Invalid link URL')
    })

    it('should throw Invalid link URL for non-mailto URL on email type', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, bio: null, links: [] },
      })
      expect(() =>
        p.updateProfile({
          links: [{ type: ProfileLinkType.EMAIL, url: 'https://example.com', label: null }],
        }),
      ).toThrow('Invalid link URL')
    })

    it('should throw Maximum 10 links allowed for 11 links', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, bio: null, links: [] },
      })
      const links = Array.from({ length: 11 }, (_, i) => ({
        type: ProfileLinkType.WEBSITE,
        url: `https://example${i}.com`,
        label: null,
      }))
      expect(() => p.updateProfile({ links })).toThrow('Maximum 10 links allowed')
    })

    it('should throw Custom link requires a label for custom type with null label', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, bio: null, links: [] },
      })
      expect(() =>
        p.updateProfile({
          links: [{ type: ProfileLinkType.CUSTOM, url: 'https://custom.com', label: null }],
        }),
      ).toThrow('Custom link requires a label')
    })
  })

  describe('softDelete()', () => {
    it('should set deletedAt', () => {
      const p = ParticipantEntity.create({
        userId: 'user-1',
        eventId: 'event-1',
        profile: { displayName: 'Alice', role: null, bio: null, links: [] },
      })
      expect(p.isDeleted()).toBe(false)
      p.softDelete()
      expect(p.deletedAt).toBeInstanceOf(Date)
      expect(p.isDeleted()).toBe(true)
    })

    it('should not overwrite deletedAt if already set', () => {
      const firstDeletion = new Date(Date.now() - 10000)
      const p = ParticipantEntity.fromProps({ ...baseProps, deletedAt: firstDeletion })
      p.softDelete()
      expect(p.deletedAt).toBe(firstDeletion)
    })
  })

  describe('toJSON()', () => {
    it('should serialize all props including links', () => {
      const now = new Date()
      const links = [{ type: ProfileLinkType.LINKEDIN, url: 'https://linkedin.com/in/alice', label: null }]
      const p = ParticipantEntity.fromProps({
        id: 'p-1',
        userId: 'user-1',
        eventId: 'event-1',
        braceletId: null,
        profile: { displayName: 'Alice', role: 'VIP', bio: null, links },
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
      expect(json.profile.links).toEqual(links)
      expect(json.braceletId).toBeNull()
    })
  })
})
