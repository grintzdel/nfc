export const ProfileLinkType = {
  LINKEDIN: 'linkedin',
  TWITTER: 'twitter',
  GITHUB: 'github',
  INSTAGRAM: 'instagram',
  WEBSITE: 'website',
  EMAIL: 'email',
  CUSTOM: 'custom',
} as const

export type ProfileLinkType = (typeof ProfileLinkType)[keyof typeof ProfileLinkType]
