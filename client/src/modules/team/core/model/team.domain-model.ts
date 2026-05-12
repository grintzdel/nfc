export const TeamRole = {
  OWNER: 'owner',
  MANAGER: 'manager',
  STAFF: 'staff',
} as const

export type TeamRole = (typeof TeamRole)[keyof typeof TeamRole]

export namespace TeamDomainModel {
  export type TeamMemberOverviewDto = {
    id: string
    userId: string
    eventId: string
    role: TeamRole
    invitedAt: string
    invitedBy: string
    acceptedAt: string | null
    createdAt: string
    updatedAt: string
  }

  export type InviteTeamMemberDto = {
    userId: string
    role: 'manager' | 'staff'
  }

  export type ChangeRoleDto = {
    role: 'manager' | 'staff'
  }
}
