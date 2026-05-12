import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { useDependencies } from '@/modules/app/ui/hooks/use-dependencies'
import type { TeamDomainModel } from '@/modules/team/core/model/team.domain-model'

export function useInviteTeamMember() {
  const { teamPort } = useDependencies()
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['inviteTeamMember'],
    mutationFn: ({ eventId, dto }: { eventId: string; dto: TeamDomainModel.InviteTeamMemberDto }) =>
      teamPort.invite(eventId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] })
    },
  })
}
